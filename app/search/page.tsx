'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Airport = { code: string; name: string; city: string };
type Schedule = any;

export default function SearchPage() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [orig, setOrig] = useState('NZNE');
  const [dest, setDest] = useState('YSSY');
  const [date1, setDate1] = useState('2026-06-01');
  const [date2, setDate2] = useState('2026-06-30');
  const [results, setResults] = useState<Schedule[]>([]);
  const [message, setMessage] = useState('Use a wider date range because some routes only run weekly.');

  useEffect(() => { fetch('/api/airports').then(r => r.json()).then(setAirports); }, []);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setMessage('Searching...');
    const res = await fetch(`/api/schedules?date1=${date1}&date2=${date2}&orig=${orig}&dest=${dest}`);
    const data = await res.json();
    setResults(data);
    setMessage(data.length ? `${data.length} flight(s) found.` : 'No flights found. Try a wider date range or different route.');
  }

  return (
    <>
      <h1>Search flights</h1>
      <div className="card">
        <form className="form" onSubmit={search}>
          <div><label>From</label><select value={orig} onChange={e => setOrig(e.target.value)}>{airports.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}</select></div>
          <div><label>To</label><select value={dest} onChange={e => setDest(e.target.value)}>{airports.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}</select></div>
          <div><label>Start date</label><input type="date" value={date1} onChange={e => setDate1(e.target.value)} /></div>
          <div><label>End date</label><input type="date" value={date2} onChange={e => setDate2(e.target.value)} /></div>
          <button className="btn" type="submit">Search</button>
        </form>
      </div>
      <p className="notice">{message}</p>
      <table className="table">
        <thead><tr><th>Flight</th><th>Route</th><th>Departure</th><th>Arrival</th><th>Seats</th><th>Price</th><th></th></tr></thead>
        <tbody>{results.map(s => <tr key={s._id}>
          <td>{s.flightNumber}<br/><span className="small">{s.aircraft}</span></td>
          <td>{s.origin} → {s.destination}</td>
          <td>{s.departLocal}<br/><span className="small">{s.originTz}</span></td>
          <td>{s.arriveLocal}<br/><span className="small">{s.destinationTz}</span></td>
          <td>{s.seatsLeft}/{s.capacity}</td>
          <td>NZ${s.priceNZD}</td>
          <td>{s.seatsLeft > 0 ? <Link className="btn" href={`/book/${s._id}`}>Book</Link> : <span className="error">Full</span>}</td>
        </tr>)}</tbody>
      </table>
    </>
  );
}
