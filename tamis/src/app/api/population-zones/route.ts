import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET() {
  try {
    const zones = (await (db as any).populationZone.findMany()) as any[];
    const summary = {
      totalPopulation: zones.reduce((a: number, z: any) => a + (z.population ?? 0), 0),
      averageDensity: zones.length ? Math.round(zones.reduce((a: number, z: any) => a + (z.density ?? 0), 0) / zones.length) : 0,
      riskScore: zones.length ? Number((zones.filter((z: any) => z.riskLevel === 'high').length / zones.length * 10).toFixed(1)) : 0,
      affectedArea: Number(zones.reduce((a: number, z: any) => a + (z.area ?? 0), 0).toFixed(1)),
      criticalZones: zones.filter((z: any) => z.riskLevel === 'high').length,
    };
    const populationDensityAnalysis = {
      summary,
      populationData: zones.map((z: any) => ({
        zoneId: z.zoneId,
        name: z.name,
        coordinates: [z.lat, z.lng],
        bounds: z.bounds,
        population: z.population,
        area: z.area,
        density: z.density,
        riskLevel: z.riskLevel,
        demographics: z.demographics,
        facilities: z.facilities,
        lastUpdated: z.lastUpdated?.toISOString(),
      })),
    };
    return NextResponse.json({ populationDensityAnalysis });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load population zones' }, { status: 500 });
  }
}
