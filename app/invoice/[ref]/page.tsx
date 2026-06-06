'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';

export default function InvoicePage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = use(params);
  const [booking, setBooking] = useState<any>(null);
  useEffect(() => { fetch(`/api/bookings?ref=${ref}`).then(r => r.json()).then(d => setBooking(d[0])); }, [ref]);
  if (!booking) return <p>Loading invoice...</p>;
  const s = booking.schedule;
  return (
    <>
      <h1>Invoice / Booking confirmation</h1>
      <div className="success">Booking confirmed. Your reference is <b>{booking.reference}</b>.</div>
      <div className="card">
        <h2>{booking.title} {booking.firstName} {booking.lastName}</h2>
        <p><b>Email:</b> {booking.email}</p>
        <hr />
        <p><b>Flight:</b> {s.flightNumber} ({s.aircraft})</p>
        <p><b>Route:</b> {s.origin} → {s.destination}</p>
        <p><b>Departure:</b> {s.departLocal} ({s.originTz})</p>
        <p><b>Arrival:</b> {s.arriveLocal} ({s.destinationTz})</p>
        <p><b>Total paid:</b> NZ${s.priceNZD}</p>
      </div>
      <Link className="btn" href="/manage">Manage this booking</Link>
    </>
  );
}
