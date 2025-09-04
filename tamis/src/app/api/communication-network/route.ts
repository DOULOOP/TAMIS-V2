import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const stations = (await (db as any).modemStation.findMany({
      include: { linksFrom: true, linksTo: true },
    })) as any[];
    const totalModems = stations.length;
    const activeModems = stations.filter((s: any) => s.status === 'active').length;
    const inactiveModems = stations.filter((s: any) => s.status === 'inactive').length;
    const maintenanceModems = stations.filter((s: any) => s.status === 'maintenance').length;
    const averageSignalStrength = stations.length ? Number((stations.reduce((a: number, s: any) => a + (s.signalStrength ?? 0), 0) / stations.length).toFixed(1)) : 0;
    const networkCoverage = stations.length ? Number(((activeModems / stations.length) * 100).toFixed(1)) : 0;
    const dataTransmissionRate = stations.length ? Number((stations.reduce((a: number, s: any) => a + (s.dataRate ?? 0), 0) / stations.length).toFixed(1)) : 0;

    const links = (await (db as any).networkLink.findMany()) as any[];
    const backbone = links.map((l: any) => ({
      from: l.fromId,
      to: l.toId,
      linkType: l.linkType,
      bandwidth: l.bandwidth,
      latency: l.latency,
      status: l.status,
    }));

    // Try reading enriched AAIA modem information from local JSON to augment API
    let aaia_modems_information: any = null;
    try {
      const dataPath = path.resolve(process.cwd(), 'src', 'data', 'communication-network.json');
      const raw = fs.readFileSync(dataPath, 'utf-8');
      const parsed = JSON.parse(raw);
      aaia_modems_information = parsed?.aaia_modems_information ?? null;
    } catch {}

    const communicationNetworkAnalysis = {
      summary: {
        totalModems,
        activeModems,
        inactiveModems,
        maintenanceModems,
        networkCoverage,
        averageSignalStrength,
        dataTransmissionRate,
        criticalAlerts: stations.reduce((acc: number, s: any) => acc + ((s.alerts || []).filter((a: any) => a.level === 'critical').length), 0),
      },
      modemStations: stations.map((s: any) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        location: {
          name: s.name,
          coordinates: [s.lat, s.lng],
          address: s.address,
          elevation: s.elevation,
        },
        status: s.status,
        signalStrength: s.signalStrength,
        dataRate: s.dataRate,
        uptime: s.uptime,
        lastPing: s.lastPing?.toISOString(),
        batteryLevel: s.batteryLevel,
        powerSource: s.powerSource,
        backupPower: s.backupPower,
        coverageRadius: s.coverageRadius,
        connectedDevices: s.connectedDevices,
        networkLoad: s.networkLoad,
        frequency: s.frequency,
        bandwidth: s.bandwidth,
        technology: s.technology,
        manufacturer: s.manufacturer,
        model: s.model,
        firmware: s.firmware,
        installDate: s.installDate?.toISOString().slice(0, 10),
        lastMaintenance: s.lastMaintenance?.toISOString().slice(0, 10),
        operatingTemp: s.operatingTemp,
        humidity: s.humidity,
        alerts: s.alerts || [],
      })),
      networkTopology: {
        backbone,
        redundancy: {
          primaryPaths: backbone.length,
          backupPaths: Math.max(0, Math.floor(backbone.length / 3)),
          redundancyLevel: backbone.length > 3 ? 'high' : 'low',
        },
  },
  aaia_modems_information,
    };
    return NextResponse.json({ communicationNetworkAnalysis });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load communication network' }, { status: 500 });
  }
}
