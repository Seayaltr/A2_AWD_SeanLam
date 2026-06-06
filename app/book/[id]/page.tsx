'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [schedule, setSchedule] = useState<any>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: 'Mr', firstName: '', lastName: '', email: '', phone: '' });

  useEffect(() => { fetch(`/api/schedules/${id}`).then(r => r.json()).then(setSchedule); }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, scheduleId: id }) });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Booking failed');
    router.push(`/invoice/${data.reference}`);
  }

  if (!schedule) return <p>Loading...</p>;

  return (
    <>
      <h1>Book flight {schedule.flightNumber}</h1>
      <div className="card">
        <h2>{schedule.origin} → {schedule.destination}</h2>
        <p><b>Departure:</b> {schedule.departLocal} ({schedule.originTz})</p>
        <p><b>Arrival:</b> {schedule.arriveLocal} ({schedule.destinationTz})</p>
        <p><b>Seats left:</b> {schedule.seatsLeft}/{schedule.capacity} | <b>Price:</b> NZ${schedule.priceNZD}</p>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="card">
        <form className="form" onSubmit={submit}>
          <div><label>Title</label><select value={form.title} onChange={e => setForm({...form, title:e.target.value})}><option>Mr</option><option>Mrs</option><option>Miss</option><option>Ms</option><option>Dr</option></select></div>
          <div><label>First name</label><input required value={form.firstName} onChange={e => setForm({...form, firstName:e.target.value})} /></div>
          <div><label>Last name</label><input required value={form.lastName} onChange={e => setForm({...form, lastName:e.target.value})} /></div>
          <div><label>Email</label><input required type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} /></div>
          <div><label>Phone</label><input value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} /></div>
          <button className="btn" type="submit">Confirm booking</button>
        </form>
      </div>
    </>
  );
}
