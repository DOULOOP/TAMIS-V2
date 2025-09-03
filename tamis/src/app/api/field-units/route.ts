import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET() {
  try {
    const units = (await (db as any).fieldUnit.findMany()) as any[];
    const areas = (await (db as any).areaData.findMany()) as any[];

    const summary = {
      totalUnits: units.length,
      activeUnits: units.filter((u: any) => u.status === 'active').length,
      reportingUnits: units.filter((u: any) => u.status === 'reporting').length,
      inactiveUnits: units.filter((u: any) => u.status === 'inactive').length,
      totalPersonnel: units.reduce((a: number, u: any) => a + ((u.personnel || []).length), 0),
      totalEquipment: units.reduce((a: number, u: any) => a + ((u.equipment || []).length), 0),
      averageBatteryLevel: units.length ? Number((units.reduce((a: number, u: any) => a + (u.batteryLevel ?? 0), 0) / units.length).toFixed(2)) : 0,
      averageSignalStrength: units.length ? Number((units.reduce((a: number, u: any) => a + (u.signalStrength ?? 0), 0) / units.length).toFixed(2)) : 0,
      totalDataPoints: units.reduce((a: number, u: any) => a + (u.dataCollection?.totalDataPoints ?? 0), 0),
      coverageAreas: areas.length,
    };

    const fieldUnitsData = {
      summary,
      fieldUnits: units.map((u: any) => ({
        id: u.id,
        name: u.name,
        location: u.location,
        coordinates: [u.lat, u.lng],
        status: u.status,
        lastReport: u.lastReport,
        dataCount: u.dataCount,
        areasCovered: u.areasCovered,
        batteryLevel: u.batteryLevel,
        signalStrength: u.signalStrength,
        teamLeader: u.teamLeader,
        establishedTime: u.establishedTime,
        missionType: u.missionType,
        personnel: u.personnel,
        equipment: u.equipment,
        communications: u.communications,
        vehicle: u.vehicle,
        dataCollection: u.dataCollection,
      })),
      areaData: areas.map((a: any) => ({
        areaId: a.areaId,
        areaName: a.areaName,
        coordinates: a.coordinates,
        currentOccupancy: a.currentOccupancy,
        maxCapacity: a.maxCapacity,
        lastUpdated: a.lastUpdated,
        reportingUnits: a.reportingUnits,
        dataPoints: a.dataPoints,
        status: a.status,
        areaType: a.areaType,
        facilityDetails: a.facilityDetails,
      })),
    };
    return NextResponse.json({ fieldUnitsData });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load field units' }, { status: 500 });
  }
}
