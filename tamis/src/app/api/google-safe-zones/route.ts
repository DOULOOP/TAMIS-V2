import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET() {
  try {
    const rows = await db.googleSafeZone.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ count: rows.length, places: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load' }, { status: 500 });
  }
}
