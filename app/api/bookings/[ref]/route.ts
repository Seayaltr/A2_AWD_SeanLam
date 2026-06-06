import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const db = await getDb();
  const result = await db.collection('schedules').updateOne(
    { 'bookings.reference': ref.toUpperCase(), 'bookings.status': 'confirmed' },
    { $set: { 'bookings.$.status': 'cancelled', 'bookings.$.cancelledAt': new Date().toISOString() } }
  );
  if (result.modifiedCount === 0) return NextResponse.json({ error: 'Booking reference not found or already cancelled' }, { status: 404 });
  return NextResponse.json({ ok: true, reference: ref.toUpperCase() });
}
