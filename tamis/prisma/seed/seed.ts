import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tamis.gov.tr' },
    update: {},
    create: {
      email: 'admin@tamis.gov.tr',
      password: adminPassword,
      name: 'TAMIS Admin',
      role: 'ADMIN',
      department: 'Bilgi İşlem',
      isActive: true,
    },
  });

  // Create supervisor user
  const supervisorPassword = await bcrypt.hash('super123', 12);
  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@tamis.gov.tr' },
    update: {},
    create: {
      email: 'supervisor@tamis.gov.tr',
      password: supervisorPassword,
      name: 'Ahmet Yılmaz',
      role: 'SUPERVISOR',
      department: 'Güvenlik',
      isActive: true,
    },
  });

  // Create engineer user
  const engineerPassword = await bcrypt.hash('eng123', 12);
  const engineer = await prisma.user.upsert({
    where: { email: 'engineer@tamis.gov.tr' },
    update: {},
    create: {
      email: 'engineer@tamis.gov.tr',
      password: engineerPassword,
      name: 'Fatma Demir',
      role: 'ENGINEER',
      department: 'Mühendislik',
      isActive: true,
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@tamis.gov.tr' },
    update: {},
    create: {
      email: 'user@tamis.gov.tr',
      password: userPassword,
      name: 'Mehmet Özkan',
      role: 'USER',
      department: 'Operasyon',
      isActive: true,
    },
  });

  console.log('Seed completed successfully!');
  console.log('Created users:');
  console.log('- Admin:', admin.email, '(password: admin123)');
  console.log('- Supervisor:', supervisor.email, '(password: super123)');
  console.log('- Engineer:', engineer.email, '(password: eng123)');
  console.log('- User:', user.email, '(password: user123)');

  // Load JSON datasets from src/data and import into tables
  const dataDir = path.resolve(process.cwd(), 'src', 'data');

  function readJson<T = any>(file: string): T | null {
    try {
      const p = path.join(dataDir, file);
      const raw = fs.readFileSync(p, 'utf-8');
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  // Safe Zones
  const safeZonesJson = readJson<{ safeZoneAnalysis: any }>('safe-zone.json');
  if (safeZonesJson?.safeZoneAnalysis?.safeZones) {
    for (const z of safeZonesJson.safeZoneAnalysis.safeZones) {
      await prisma.safeZone.upsert({
        where: { id: z.id },
        update: {
          name: z.name,
          type: z.type,
          lat: z.coordinates?.[0] ?? 0,
          lng: z.coordinates?.[1] ?? 0,
          address: z.address,
          capacity: z.capacity ?? 0,
          currentOccupancy: z.currentOccupancy ?? 0,
          status: z.status ?? 'unknown',
          lastUpdated: z.lastUpdated ? new Date(z.lastUpdated) : null,
          facilities: z.facilities ?? {},
          accessRoutes: z.accessRoutes ?? [],
          emergencyServices: z.emergencyServices ?? {},
          evacuationPlan: z.evacuationPlan ?? {},
        },
        create: {
          id: z.id,
          name: z.name,
          type: z.type,
          lat: z.coordinates?.[0] ?? 0,
          lng: z.coordinates?.[1] ?? 0,
          address: z.address,
          capacity: z.capacity ?? 0,
          currentOccupancy: z.currentOccupancy ?? 0,
          status: z.status ?? 'unknown',
          lastUpdated: z.lastUpdated ? new Date(z.lastUpdated) : null,
          facilities: z.facilities ?? {},
          accessRoutes: z.accessRoutes ?? [],
          emergencyServices: z.emergencyServices ?? {},
          evacuationPlan: z.evacuationPlan ?? {},
        },
      });
    }
    console.log(`Imported ${safeZonesJson.safeZoneAnalysis.safeZones.length} safe zones`);
  }

  // Google Places Safe Zones (parks etc.)
  const googleSzJson = readJson<{ places: any[] }>('safe-zone-api.json');
  if (googleSzJson?.places?.length) {
    for (const p of googleSzJson.places) {
      const lat = p.location?.latitude ?? 0;
      const lng = p.location?.longitude ?? 0;
      await prisma.googleSafeZone.upsert({
        where: { placeId: p.id || p.name },
        update: {
          name: p.displayName?.text ?? p.primaryTypeDisplayName?.text ?? p.id ?? 'Unknown',
          primaryType: p.primaryTypeDisplayName?.text ?? null,
          types: Array.isArray(p.types) ? p.types : [],
          formattedAddress: p.formattedAddress ?? null,
          shortFormattedAddress: p.shortFormattedAddress ?? null,
          lat,
          lng,
          directionsUri: p.googleMapsLinks?.directionsUri ?? null,
          placeUri: p.googleMapsLinks?.placeUri ?? null,
          reviewsUri: p.googleMapsLinks?.reviewsUri ?? null,
          photosUri: p.googleMapsLinks?.photosUri ?? null,
          writeAReviewUri: p.googleMapsLinks?.writeAReviewUri ?? null,
          raw: p,
        },
        create: {
          placeId: p.id || p.name,
          name: p.displayName?.text ?? p.primaryTypeDisplayName?.text ?? p.id ?? 'Unknown',
          primaryType: p.primaryTypeDisplayName?.text ?? null,
          types: Array.isArray(p.types) ? p.types : [],
          formattedAddress: p.formattedAddress ?? null,
          shortFormattedAddress: p.shortFormattedAddress ?? null,
          lat,
          lng,
          directionsUri: p.googleMapsLinks?.directionsUri ?? null,
          placeUri: p.googleMapsLinks?.placeUri ?? null,
          reviewsUri: p.googleMapsLinks?.reviewsUri ?? null,
          photosUri: p.googleMapsLinks?.photosUri ?? null,
          writeAReviewUri: p.googleMapsLinks?.writeAReviewUri ?? null,
          raw: p,
        },
      });
    }
    console.log(`Imported ${googleSzJson.places.length} Google safe zones`);
  }

  // Population Zones
  const popJson = readJson<{ populationDensityAnalysis: any }>('population-density.json');
  if (popJson?.populationDensityAnalysis?.populationData) {
    for (const z of popJson.populationDensityAnalysis.populationData) {
      await prisma.populationZone.upsert({
        where: { zoneId: z.zoneId },
        update: {
          name: z.name,
          lat: z.coordinates?.[0] ?? 0,
          lng: z.coordinates?.[1] ?? 0,
          bounds: z.bounds ?? {},
          population: z.population ?? 0,
          area: z.area ?? 0,
          density: z.density ?? 0,
          riskLevel: z.riskLevel ?? 'unknown',
          demographics: z.demographics ?? {},
          facilities: z.facilities ?? {},
          lastUpdated: z.lastUpdated ? new Date(z.lastUpdated) : null,
        },
        create: {
          zoneId: z.zoneId,
          name: z.name,
          lat: z.coordinates?.[0] ?? 0,
          lng: z.coordinates?.[1] ?? 0,
          bounds: z.bounds ?? {},
          population: z.population ?? 0,
          area: z.area ?? 0,
          density: z.density ?? 0,
          riskLevel: z.riskLevel ?? 'unknown',
          demographics: z.demographics ?? {},
          facilities: z.facilities ?? {},
          lastUpdated: z.lastUpdated ? new Date(z.lastUpdated) : null,
        },
      });
    }
    console.log(`Imported ${popJson.populationDensityAnalysis.populationData.length} population zones`);
  }

  // Communication Network: Modem Stations and Links
  const commJson = readJson<{ communicationNetworkAnalysis: any }>('communication-network.json');
  if (commJson?.communicationNetworkAnalysis) {
    const c = commJson.communicationNetworkAnalysis;
    if (Array.isArray(c.modemStations)) {
      for (const s of c.modemStations) {
        await prisma.modemStation.upsert({
          where: { id: s.id },
          update: {
            name: s.name,
            type: s.type,
            lat: s.location?.coordinates?.[0] ?? 0,
            lng: s.location?.coordinates?.[1] ?? 0,
            address: s.location?.address ?? null,
            elevation: s.location?.elevation ?? null,
            status: s.status ?? 'unknown',
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
            lat: s.location?.coordinates?.[0] ?? 0,
            lng: s.location?.coordinates?.[1] ?? 0,
            address: s.location?.address ?? null,
            elevation: s.location?.elevation ?? null,
            status: s.status ?? 'unknown',
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
        });
      }
      console.log(`Imported ${c.modemStations.length} modem stations`);
    }
    if (Array.isArray(c.networkTopology?.backbone)) {
      for (const l of c.networkTopology.backbone) {
        // Create a stable id for link
        const id = `${l.from}_${l.to}_${l.linkType}`;
        await prisma.networkLink.upsert({
          where: { id },
          update: {
            fromId: l.from,
            toId: l.to,
            linkType: l.linkType,
            bandwidth: l.bandwidth ?? null,
            latency: l.latency ?? null,
            status: l.status ?? null,
          },
          create: {
            id,
            fromId: l.from,
            toId: l.to,
            linkType: l.linkType,
            bandwidth: l.bandwidth ?? null,
            latency: l.latency ?? null,
            status: l.status ?? null,
          },
        });
      }
      console.log(`Imported ${c.networkTopology.backbone.length} network links`);
    }
  }

  // Field Units and Area Data
  const fuJson = readJson<{ fieldUnitsData: any }>('field-units.json');
  if (fuJson?.fieldUnitsData) {
    const fd = fuJson.fieldUnitsData;
    if (Array.isArray(fd.fieldUnits)) {
      for (const u of fd.fieldUnits) {
        await prisma.fieldUnit.upsert({
          where: { id: u.id },
          update: {
            name: u.name,
            location: u.location ?? null,
            lat: u.coordinates?.[0] ?? 0,
            lng: u.coordinates?.[1] ?? 0,
            status: u.status ?? 'unknown',
            lastReport: u.lastReport ?? null,
            dataCount: u.dataCount ?? null,
            areasCovered: u.areasCovered ?? [],
            batteryLevel: u.batteryLevel ?? null,
            signalStrength: u.signalStrength ?? null,
            teamLeader: u.teamLeader ?? null,
            establishedTime: u.establishedTime ?? null,
            missionType: u.missionType ?? null,
            personnel: u.personnel ?? [],
            equipment: u.equipment ?? [],
            communications: u.communications ?? {},
            vehicle: u.vehicle ?? {},
            dataCollection: u.dataCollection ?? {},
          },
          create: {
            id: u.id,
            name: u.name,
            location: u.location ?? null,
            lat: u.coordinates?.[0] ?? 0,
            lng: u.coordinates?.[1] ?? 0,
            status: u.status ?? 'unknown',
            lastReport: u.lastReport ?? null,
            dataCount: u.dataCount ?? null,
            areasCovered: u.areasCovered ?? [],
            batteryLevel: u.batteryLevel ?? null,
            signalStrength: u.signalStrength ?? null,
            teamLeader: u.teamLeader ?? null,
            establishedTime: u.establishedTime ?? null,
            missionType: u.missionType ?? null,
            personnel: u.personnel ?? [],
            equipment: u.equipment ?? [],
            communications: u.communications ?? {},
            vehicle: u.vehicle ?? {},
            dataCollection: u.dataCollection ?? {},
          },
        });
      }
      console.log(`Imported ${fd.fieldUnits.length} field units`);
    }
    if (Array.isArray(fd.areaData)) {
      for (const a of fd.areaData) {
        await prisma.areaData.upsert({
          where: { areaId: a.areaId },
          update: {
            areaName: a.areaName,
            coordinates: a.coordinates,
            currentOccupancy: a.currentOccupancy ?? 0,
            maxCapacity: a.maxCapacity ?? 0,
            lastUpdated: a.lastUpdated ?? null,
            reportingUnits: a.reportingUnits ?? [],
            dataPoints: a.dataPoints ?? null,
            status: a.status ?? null,
            areaType: a.areaType ?? null,
            facilityDetails: a.facilityDetails ?? {},
          },
          create: {
            areaId: a.areaId,
            areaName: a.areaName,
            coordinates: a.coordinates,
            currentOccupancy: a.currentOccupancy ?? 0,
            maxCapacity: a.maxCapacity ?? 0,
            lastUpdated: a.lastUpdated ?? null,
            reportingUnits: a.reportingUnits ?? [],
            dataPoints: a.dataPoints ?? null,
            status: a.status ?? null,
            areaType: a.areaType ?? null,
            facilityDetails: a.facilityDetails ?? {},
          },
        });
      }
      console.log(`Imported ${fd.areaData.length} area records`);
    }
  }

  // Aid Routes
  const aidJson = readJson<{ aidRouteAnalysis: any }>('aid-route.json');
  if (aidJson?.aidRouteAnalysis?.routes) {
    for (const r of aidJson.aidRouteAnalysis.routes) {
      await prisma.aidRoute.upsert({
        where: { id: r.id },
        update: {
          name: r.name,
          type: r.type,
          status: r.status,
          priority: r.priority ?? null,
          startPoint: r.startPoint ?? {},
          endPoint: r.endPoint ?? {},
          waypoints: r.waypoints ?? [],
          distance: r.distance ?? null,
          estimatedTime: r.estimatedTime ?? null,
          currentSpeed: r.currentSpeed ?? null,
          trafficCondition: r.trafficCondition ?? null,
          roadCondition: r.roadCondition ?? null,
          weatherImpact: r.weatherImpact ?? null,
          supplies: r.supplies ?? [],
          vehicles: r.vehicles ?? [],
          checkpoints: r.checkpoints ?? [],
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
          startPoint: r.startPoint ?? {},
          endPoint: r.endPoint ?? {},
          waypoints: r.waypoints ?? [],
          distance: r.distance ?? null,
          estimatedTime: r.estimatedTime ?? null,
          currentSpeed: r.currentSpeed ?? null,
          trafficCondition: r.trafficCondition ?? null,
          roadCondition: r.roadCondition ?? null,
          weatherImpact: r.weatherImpact ?? null,
          supplies: r.supplies ?? [],
          vehicles: r.vehicles ?? [],
          checkpoints: r.checkpoints ?? [],
          blockageReason: r.blockageReason ?? null,
          estimatedClearTime: r.estimatedClearTime ?? null,
          alternativeRoute: r.alternativeRoute ?? null,
        },
      });
    }
    console.log(`Imported ${aidJson.aidRouteAnalysis.routes.length} aid routes`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
