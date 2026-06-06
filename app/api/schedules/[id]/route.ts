import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const schedule = await db.collection('schedules').findOne({ _id: new ObjectId(id) });
  if (!schedule) return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
  const bookings = (schedule.bookings || []).filter((b: any) => b.status === 'confirmed');
  return NextResponse.json({ ...schedule, _id: schedule._id.toString(), seatsLeft: schedule.capacity - bookings.length });
}
