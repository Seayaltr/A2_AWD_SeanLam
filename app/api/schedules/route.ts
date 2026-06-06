import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orig = searchParams.get('orig') || undefined;
  const dest = searchParams.get('dest') || undefined;
  const date1 = searchParams.get('date1');
  const date2 = searchParams.get('date2');

  const query: any = {};
  if (orig) query.origin = orig;
  if (dest) query.destination = dest;
  if (date1 || date2) {
    query.departUTC = {};
    if (date1) query.departUTC.$gte = new Date(`${date1}T00:00:00.000Z`).toISOString();
    if (date2) query.departUTC.$lte = new Date(`${date2}T23:59:59.999Z`).toISOString();
  }

  const db = await getDb();
  const schedules = await db.collection('schedules')
    .find(query)
    .sort({ departUTC: 1 })
    .limit(100)
    .toArray();

  const result = schedules.map((s: any) => ({
    ...s,
    _id: s._id.toString(),
    seatsLeft: s.capacity - (s.bookings || []).filter((b: any) => b.status === 'confirmed').length
  }));

  return NextResponse.json(result);
}
