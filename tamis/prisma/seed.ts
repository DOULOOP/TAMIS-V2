/*
  Seed database from existing JSON files in src/data.
*/
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

function readJson<T>(relPath: string): T {
  const file = path.resolve(process.cwd(), relPath);
  const raw = fs.readFileSync(file, 'utf-8');
  return JSON.parse(raw) as T;
}

async function seedSafeZones() {
  const data = readJson<any>('src/data/safe-zone.json');
  const zones: any[] = data.safeZoneAnalysis?.safeZones ?? [];
  for (const z of zones) {
    const [lng, lat] = z.coordinates ?? [0, 0];
    await prisma.safeZone.upsert({
      where: { id: z.id },
      update: {
        name: z.name,
        type: z.type,
        lat, lng,
        address: z.address ?? null,
        capacity: z.capacity,
        currentOccupancy: z.currentOccupancy,
        status: z.status,
        lastUpdated: z.lastUpdated ? new Date(z.lastUpdated) : null,
        facilities: z.facilities ?? undefined,
        accessRoutes: z.accessRoutes ?? undefined,
        emergencyServices: z.emergencyServices ?? undefined,
        evacuationPlan: z.evacuationPlan ?? undefined,
      },
      create: {
        id: z.id,
        name: z.name,
        type: z.type,
        lat, lng,
        address: z.address ?? null,
        capacity: z.capacity,
        currentOccupancy: z.currentOccupancy,
        status: z.status,
        lastUpdated: z.lastUpdated ? new Date(z.lastUpdated) : null,
        facilities: z.facilities ?? undefined,
        accessRoutes: z.accessRoutes ?? undefined,
        emergencyServices: z.emergencyServices ?? undefined,
        evacuationPlan: z.evacuationPlan ?? undefined,
      }
    });
  }
}

async function seedPopulationZones() {
  const data = readJson<any>('src/data/population-density.json');
  const zones: any[] = data.populationDensityAnalysis?.populationData ?? [];
  for (const z of zones) {
    const [lng, lat] = z.coordinates ?? [0, 0];
    await prisma.populationZone.upsert({
      where: { zoneId: z.zoneId },
      update: {
        name: z.name,
        lat, lng,
        bounds: z.bounds ?? undefined,
        population: z.population,
        area: z.area,
        density: z.density,
        riskLevel: z.riskLevel,
        demographics: z.demographics ?? undefined,
        facilities: z.facilities ?? undefined,
        lastUpdated: z.lastUpdated ? new Date(z.lastUpdated) : null,
      },
      create: {
        zoneId: z.zoneId,
        name: z.name,
        lat, lng,
        bounds: z.bounds ?? undefined,
        population: z.population,
        area: z.area,
        density: z.density,
        riskLevel: z.riskLevel,
        demographics: z.demographics ?? undefined,
        facilities: z.facilities ?? undefined,
        lastUpdated: z.lastUpdated ? new Date(z.lastUpdated) : null,
      }
    });
  }
}

async function seedModemStationsAndLinks() {
  const data = readJson<any>('src/data/communication-network.json');
  const stations: any[] = data.communicationNetworkAnalysis?.modemStations ?? [];
  for (const s of stations) {
    const [lng, lat] = s.location?.coordinates ?? [0, 0];
    await prisma.modemStation.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        type: s.type,
        lat, lng,
        address: s.location?.address ?? null,
        elevation: s.location?.elevation ?? null,
        status: s.status,
        signalStrength: s.signalStrength ?? 0,
        dataRate: s.dataRate ?? 0,
        uptime: s.uptime ?? null,
        lastPing: s.lastPing ? new Date(s.lastPing) : null,
        batteryLevel: s.batteryLevel ?? null,
        powerSource: s.powerSource ?? null,
        backupPower: s.backupPower ?? null,
        coverageRadius: s.coverageRadius ?? null,
        connectedDevices: s.connectedDevices ?? null,
        networkLoad: s.networkLoad ?? null,
        frequency: s.frequency ?? null,
        bandwidth: s.bandwidth ?? null,
        technology: s.technology ?? null,
        manufacturer: s.manufacturer ?? null,
        model: s.model ?? null,
        firmware: s.firmware ?? null,
        installDate: s.installDate ? new Date(s.installDate) : null,
        lastMaintenance: s.lastMaintenance ? new Date(s.lastMaintenance) : null,
        operatingTemp: s.operatingTemp ?? null,
        humidity: s.humidity ?? null,
        alerts: s.alerts ?? [],
      },
      create: {
        id: s.id,
        name: s.name,
        type: s.type,
        lat, lng,
        address: s.location?.address ?? null,
        elevation: s.location?.elevation ?? null,
        status: s.status,
        signalStrength: s.signalStrength ?? 0,
        dataRate: s.dataRate ?? 0,
        uptime: s.uptime ?? null,
        lastPing: s.lastPing ? new Date(s.lastPing) : null,
        batteryLevel: s.batteryLevel ?? null,
        powerSource: s.powerSource ?? null,
        backupPower: s.backupPower ?? null,
        coverageRadius: s.coverageRadius ?? null,
        connectedDevices: s.connectedDevices ?? null,
        networkLoad: s.networkLoad ?? null,
        frequency: s.frequency ?? null,
        bandwidth: s.bandwidth ?? null,
        technology: s.technology ?? null,
        manufacturer: s.manufacturer ?? null,
        model: s.model ?? null,
        firmware: s.firmware ?? null,
        installDate: s.installDate ? new Date(s.installDate) : null,
        lastMaintenance: s.lastMaintenance ? new Date(s.lastMaintenance) : null,
        operatingTemp: s.operatingTemp ?? null,
        humidity: s.humidity ?? null,
        alerts: s.alerts ?? [],
      }
    });
  }

  const backbone: any[] = data.communicationNetworkAnalysis?.networkTopology?.backbone ?? [];
  for (const link of backbone) {
    await prisma.networkLink.create({
      data: {
        fromId: link.from,
        toId: link.to,
        linkType: link.linkType,
        bandwidth: link.bandwidth ?? null,
        latency: link.latency ?? null,
        status: link.status ?? null,
      }
    });
  }
}

async function seedFieldUnitsAndAreas() {
  const data = readJson<any>('src/data/field-units.json');
  const units: any[] = data.fieldUnitsData?.fieldUnits ?? [];
  for (const u of units) {
    const [lng, lat] = u.coordinates ?? [0, 0];
    await prisma.fieldUnit.upsert({
      where: { id: u.id },
      update: {
        name: u.name,
        location: u.location ?? null,
        lat, lng,
        status: u.status,
        lastReport: u.lastReport ?? null,
        dataCount: u.dataCount ?? null,
        areasCovered: u.areasCovered ?? undefined,
        batteryLevel: u.batteryLevel ?? null,
        signalStrength: u.signalStrength ?? null,
        teamLeader: u.teamLeader ?? null,
        establishedTime: u.establishedTime ?? null,
        missionType: u.missionType ?? null,
        personnel: u.personnel ?? undefined,
        equipment: u.equipment ?? undefined,
        communications: u.communications ?? undefined,
        vehicle: u.vehicle ?? undefined,
        dataCollection: u.dataCollection ?? undefined,
      },
      create: {
        id: u.id,
        name: u.name,
        location: u.location ?? null,
        lat, lng,
        status: u.status,
        lastReport: u.lastReport ?? null,
        dataCount: u.dataCount ?? null,
        areasCovered: u.areasCovered ?? undefined,
        batteryLevel: u.batteryLevel ?? null,
        signalStrength: u.signalStrength ?? null,
        teamLeader: u.teamLeader ?? null,
        establishedTime: u.establishedTime ?? null,
        missionType: u.missionType ?? null,
        personnel: u.personnel ?? undefined,
        equipment: u.equipment ?? undefined,
        communications: u.communications ?? undefined,
        vehicle: u.vehicle ?? undefined,
        dataCollection: u.dataCollection ?? undefined,
      }
    });
  }

  const areas: any[] = data.fieldUnitsData?.areaData ?? [];
  for (const a of areas) {
    await prisma.areaData.upsert({
      where: { areaId: a.areaId },
      update: {
        areaName: a.areaName,
        coordinates: a.coordinates,
        currentOccupancy: a.currentOccupancy,
        maxCapacity: a.maxCapacity,
        lastUpdated: a.lastUpdated ?? null,
        reportingUnits: a.reportingUnits ?? undefined,
        dataPoints: a.dataPoints ?? null,
        status: a.status ?? null,
        areaType: a.areaType ?? null,
        facilityDetails: a.facilityDetails ?? undefined,
      },
      create: {
        areaId: a.areaId,
        areaName: a.areaName,
        coordinates: a.coordinates,
        currentOccupancy: a.currentOccupancy,
        maxCapacity: a.maxCapacity,
        lastUpdated: a.lastUpdated ?? null,
        reportingUnits: a.reportingUnits ?? undefined,
        dataPoints: a.dataPoints ?? null,
        status: a.status ?? null,
        areaType: a.areaType ?? null,
        facilityDetails: a.facilityDetails ?? undefined,
      }
    });
  }
}

async function seedAidRoutes() {
  const data = readJson<any>('src/data/aid-route.json');
  const routes: any[] = data.aidRouteAnalysis?.routes ?? [];
  for (const r of routes) {
    await prisma.aidRoute.upsert({
      where: { id: r.id },
      update: {
        name: r.name,
        type: r.type,
        status: r.status,
        priority: r.priority ?? null,
        startPoint: r.startPoint ?? undefined,
        endPoint: r.endPoint ?? undefined,
        waypoints: r.waypoints ?? undefined,
        distance: r.distance ?? null,
        estimatedTime: r.estimatedTime ?? null,
        currentSpeed: r.currentSpeed ?? null,
        trafficCondition: r.trafficCondition ?? null,
        roadCondition: r.roadCondition ?? null,
        weatherImpact: r.weatherImpact ?? null,
        supplies: r.supplies ?? undefined,
        vehicles: r.vehicles ?? undefined,
        checkpoints: r.checkpoints ?? undefined,
        blockageReason: r.blockageReason ?? null,
        estimatedClearTime: r.estimatedClearTime ?? null,
        alternativeRoute: r.alternativeRoute ?? null,
      },
      create: {
        id: r.id,
        name: r.name,
        type: r.type,
        status: r.status,
        priority: r.priority ?? null,
        startPoint: r.startPoint ?? undefined,
        endPoint: r.endPoint ?? undefined,
        waypoints: r.waypoints ?? undefined,
        distance: r.distance ?? null,
        estimatedTime: r.estimatedTime ?? null,
        currentSpeed: r.currentSpeed ?? null,
        trafficCondition: r.trafficCondition ?? null,
        roadCondition: r.roadCondition ?? null,
        weatherImpact: r.weatherImpact ?? null,
        supplies: r.supplies ?? undefined,
        vehicles: r.vehicles ?? undefined,
        checkpoints: r.checkpoints ?? undefined,
        blockageReason: r.blockageReason ?? null,
        estimatedClearTime: r.estimatedClearTime ?? null,
        alternativeRoute: r.alternativeRoute ?? null,
      }
    });
  }
}

async function main() {
  await seedSafeZones();
  await seedPopulationZones();
  await seedModemStationsAndLinks();
  await seedFieldUnitsAndAreas();
  await seedAidRoutes();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log('Seed completed');
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
