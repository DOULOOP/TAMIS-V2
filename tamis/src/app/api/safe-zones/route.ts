import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET() {
  try {
  const zones = (await (db as any).safeZone.findMany()) as any[];
  const totalSafeZones = zones.length;
  const totalCapacity = zones.reduce((a: number, z: any) => a + (z.capacity ?? 0), 0);
  const currentOccupancy = zones.reduce((a: number, z: any) => a + (z.currentOccupancy ?? 0), 0);
    const occupancyRate = totalCapacity ? Number(((currentOccupancy / totalCapacity) * 100).toFixed(1)) : 0;
    const availableSpace = totalCapacity - currentOccupancy;
    // Rough average access time from accessRoutes estimatedTime values
    const times: number[] = [];
    for (const z of zones) {
      const routes = (z.accessRoutes as any[]) || [];
      for (const r of routes) if (typeof r?.estimatedTime === 'number') times.push(r.estimatedTime);
    }
    const averageAccessTime = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    const criticalZones = zones.filter((z: any) => z.status?.toLowerCase() === 'critical' || ((z.currentOccupancy ?? 0) / (z.capacity || 1)) > 0.85).length;

    const safeZoneAnalysis = {
      summary: {
        totalSafeZones,
        totalCapacity,
        currentOccupancy,
        occupancyRate,
        availableSpace,
        averageAccessTime,
        criticalZones,
      },
  safeZones: zones.map((z: any) => ({
        id: z.id,
        name: z.name,
        type: z.type,
        coordinates: [z.lat, z.lng],
        address: z.address,
        capacity: z.capacity,
        currentOccupancy: z.currentOccupancy,
        status: z.status,
        lastUpdated: z.lastUpdated?.toISOString(),
        facilities: z.facilities,
        accessRoutes: z.accessRoutes,
        emergencyServices: z.emergencyServices,
        evacuationPlan: z.evacuationPlan,
      })),
    };
    return NextResponse.json({ safeZoneAnalysis });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load safe zones' }, { status: 500 });
  }
}
