import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';

function makeRef() {
  return 'DFA-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { scheduleId, title, firstName, lastName, email, phone } = body;
  if (!scheduleId || !firstName || !lastName || !email) {
    return NextResponse.json({ error: 'Missing passenger details' }, { status: 400 });
  }

  const db = await getDb();
  const schedule = await db.collection('schedules').findOne({ _id: new ObjectId(scheduleId) });
  if (!schedule) return NextResponse.json({ error: 'Flight not found' }, { status: 404 });

  const confirmed = (schedule.bookings || []).filter((b: any) => b.status === 'confirmed').length;
  if (confirmed >= schedule.capacity) {
    return NextResponse.json({ error: 'Sorry, this flight is full.' }, { status: 409 });
  }

  let reference = makeRef();
  while (await db.collection('schedules').findOne({ 'bookings.reference': reference })) reference = makeRef();

  const booking = { reference, title, firstName, lastName, email: email.toLowerCase(), phone, bookedAt: new Date().toISOString(), status: 'confirmed' };

  await db.collection('schedules').updateOne(
    { _id: new ObjectId(scheduleId) },
    { $push: { bookings: booking } } as any
  );
  await db.collection('passengers').updateOne(
    { email: email.toLowerCase() },
    { $set: { title, firstName, lastName, email: email.toLowerCase(), phone, updatedAt: new Date().toISOString() } },
    { upsert: true }
  );

  const updated = await db.collection('schedules').findOne({ _id: new ObjectId(scheduleId) });
  return NextResponse.json({ reference, schedule: { ...updated, _id: updated?._id.toString() } });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email')?.toLowerCase();
  const ref = searchParams.get('ref')?.toUpperCase();
  const db = await getDb();

  const query: any = {};
  if (email) query['bookings.email'] = email;
  if (ref) query['bookings.reference'] = ref;

  const schedules = await db.collection('schedules').find(query).sort({ departUTC: 1 }).toArray();
  const bookings = schedules.flatMap((s: any) => (s.bookings || [])
    .filter((b: any) => (!email || b.email === email) && (!ref || b.reference === ref) && b.status === 'confirmed')
    .map((b: any) => ({ ...b, schedule: { ...s, _id: s._id.toString(), bookings: undefined } }))
  );
  return NextResponse.json(bookings);
}
