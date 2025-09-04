import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET() {
  try {
    const zones = (await (db as any).populationZone.findMany()) as any[];

    // Toplam yardımcı fonksiyonları
    const sum = (arr: number[]) => arr.reduce((a, b) => a + (b || 0), 0);
    const densities: number[] = zones.map((z: any) => Number(z.density) || 0).sort((a: number, b: number) => a - b);
    const getPercentile = (p: number): number => {
      if (!densities.length) return 0;
      const idx = Math.floor((densities.length - 1) * p);
      const val = densities[idx];
      if (typeof val !== 'number' || !Number.isFinite(val)) return 0;
      return val;
    };

    const totalPopulation = sum(zones.map((z: any) => Number(z.population) || 0));
    const averageDensity = zones.length ? Math.round(sum(zones.map((z: any) => Number(z.density) || 0)) / zones.length) : 0;
    const affectedArea = Number(sum(zones.map((z: any) => Number(z.area) || 0)).toFixed(1));
    const criticalZonesCount = zones.filter((z: any) => String(z.riskLevel).toLowerCase() === 'high').length;
    const riskScore = zones.length ? Number(((criticalZonesCount / zones.length) * 10).toFixed(1)) : 0;

    // SafeZone tablosundan tahliye kapasitesi
    const safeAgg = (await (db as any).safeZone.aggregate({ _sum: { capacity: true } })) as any;
    const totalSafeCapacity = Number(safeAgg?._sum?.capacity || 0);
    const requiredCapacity = totalPopulation;
    const deficit = Math.max(requiredCapacity - totalSafeCapacity, 0);

    // Latest update across zones
  const latestUpdateMs: number | null = zones.length
    ? zones
      .map((z: any) => (z.lastUpdated ? new Date(z.lastUpdated as any).getTime() : 0))
      .reduce((a: number, b: number) => Math.max(a, b), 0)
    : null;

    const summary = {
      totalPopulation,
      averageDensity,
      riskScore,
      affectedArea,
  criticalZones: criticalZonesCount,
      minDensity: densities.length ? densities[0] : 0,
      maxDensity: densities.length ? densities[densities.length - 1] : 0,
    };

    // Build population data list
    const populationData = zones.map((z: any) => ({
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
      lastUpdated: z.lastUpdated ? new Date(z.lastUpdated as any).toISOString() : undefined,
    }));

    // Risk assessment for top critical zones
    const riskAssessment = {
      criticalZones: populationData
        .filter((z: any) => String(z.riskLevel).toLowerCase() === 'high')
        .slice(0, 10)
        .map((z: any) => {
          const riskFactors: string[] = [];
          if (Number(z.density || 0) >= getPercentile(0.75)) riskFactors.push('High population density');
          const vuln = Number((z.demographics as any)?.vulnerable ?? 0);
          if (z.population && vuln / z.population > 0.15) riskFactors.push('High vulnerable population ratio');
          const emerg = Number((z.facilities as any)?.emergencyServices ?? 0);
          if (!emerg || emerg < 1) riskFactors.push('Limited emergency services');
          const recommendedActions: string[] = [];
          if (riskFactors.includes('High population density')) recommendedActions.push('Increase area throughput and crowd management');
          if (riskFactors.includes('High vulnerable population ratio')) recommendedActions.push('Allocate targeted assistance and medical support');
          if (riskFactors.includes('Limited emergency services')) recommendedActions.push('Deploy additional emergency units');
          return {
            zoneId: z.zoneId,
            riskFactors,
            recommendedActions,
          };
        }),
      evacuationCapacity: {
        currentCapacity: totalSafeCapacity,
        requiredCapacity,
        deficit,
        evacuationTime: '45 minutes',
      },
    };

    // Visualization thresholds from percentiles
    const thresholds = {
      low: Math.round(Number(getPercentile(0.25) || 0)),
      medium: Math.round(Number(getPercentile(0.5) || 0)),
      high: Math.round(Number(getPercentile(0.75) || 0)),
      critical: Math.round(Number(getPercentile(0.9) || 0)),
    };

    const populationDensityAnalysis = {
      metadata: {
        analysisId: `pda_${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`,
        timestamp: new Date().toISOString(),
        region: 'Hatay',
        coordinates: undefined,
        dataSource: 'COMBINED_DB',
        status: 'completed',
        processingTime: undefined,
        latestUpdate: latestUpdateMs ? new Date(latestUpdateMs).toISOString() : undefined,
      },
      summary,
      populationData,
      riskAssessment,
      dataSources: {
        COMBINED: {
          accuracy: 0.95,
          coverage: 0.98,
          lastUpdate: latestUpdateMs ? new Date(latestUpdateMs).toISOString() : undefined,
          dataPoints: zones.length,
        },
      },
      visualizationData: {
        heatmapLayers: [
          {
            type: 'population_density',
            colorScale: {
              low: '#90EE90',
              medium: '#FFD700',
              high: '#FF6347',
              critical: '#DC143C',
            },
            thresholds,
          },
        ],
      },
    };
    return NextResponse.json({ populationDensityAnalysis });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load population zones' }, { status: 500 });
  }
}
