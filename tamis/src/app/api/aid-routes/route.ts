import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET() {
  try {
    const routes = (await (db as any).aidRoute.findMany()) as any[];
    const analysis = {
      routes: routes.map((r: any) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        status: r.status,
        priority: r.priority,
        startPoint: r.startPoint,
        endPoint: r.endPoint,
        waypoints: r.waypoints,
        distance: r.distance,
        estimatedTime: r.estimatedTime,
        currentSpeed: r.currentSpeed,
        trafficCondition: r.trafficCondition,
        roadCondition: r.roadCondition,
        weatherImpact: r.weatherImpact,
        supplies: r.supplies ?? [],
        vehicles: r.vehicles ?? [],
        checkpoints: r.checkpoints ?? [],
        blockageReason: r.blockageReason,
        estimatedClearTime: r.estimatedClearTime,
        alternativeRoute: r.alternativeRoute,
      })),
      averageTime: routes.length ? Math.round(routes.reduce((a: number, r: any) => a + (r.estimatedTime ?? 0), 0) / routes.length) : 0,
      averageDistance: routes.length ? Number((routes.reduce((a: number, r: any) => a + (r.distance ?? 0), 0)).toFixed(1)) : 0,
    };
    return NextResponse.json({ aidRouteAnalysis: analysis });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load aid routes' }, { status: 500 });
  }
}
