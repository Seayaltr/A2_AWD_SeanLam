'use client';
import { useState } from 'react';

type Booking = any;

export default function ManagePage() {
  const [email, setEmail] = useState('');
  const [ref, setRef] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [msg, setMsg] = useState('Enter a passenger email to show all flights booked by that customer, or enter a booking reference to cancel it.');

  async function findBookings(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/bookings?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    setBookings(data);
    setMsg(data.length ? `${data.length} confirmed booking(s) found.` : 'No confirmed bookings found for this email.');
  }

  async function cancelBooking(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/bookings/${ref}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) setMsg(data.error || 'Could not cancel booking.');
    else setMsg(`Booking ${data.reference} was cancelled.`);
  }

  return (
    <>
      <h1>Manage bookings</h1>
      <p className="notice">{msg}</p>
      <div className="grid">
        <div className="card">
          <h2>Find passenger flights</h2>
          <form onSubmit={findBookings}>
            <label>Passenger email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            <br/><br/><button className="btn" type="submit">Show flights</button>
          </form>
        </div>
        <div className="card">
          <h2>Cancel booking</h2>
          <form onSubmit={cancelBooking}>
            <label>Booking reference</label>
            <input required placeholder="DFA-ABC123" value={ref} onChange={e => setRef(e.target.value.toUpperCase())} />
            <br/><br/><button className="btn" type="submit">Cancel booking</button>
          </form>
        </div>
      </div>
      <table className="table">
        <thead><tr><th>Reference</th><th>Passenger</th><th>Flight</th><th>Route</th><th>Departure</th><th>Price</th></tr></thead>
        <tbody>{bookings.map(b => <tr key={b.reference}>
          <td>{b.reference}</td>
          <td>{b.firstName} {b.lastName}</td>
          <td>{b.schedule.flightNumber}</td>
          <td>{b.schedule.origin} → {b.schedule.destination}</td>
          <td>{b.schedule.departLocal}</td>
          <td>NZ${b.schedule.priceNZD}</td>
        </tr>)}</tbody>
      </table>
    </>
  );
}
