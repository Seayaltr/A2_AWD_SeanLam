import Link from 'next/link';

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Luxury point-to-point flights from Dairy Flat</h1>
        <p>Search real scheduled flights, book seats, view your invoice, cancel a booking, and check all flights linked to a passenger email.</p>
        <Link className="btn" href="/search">Start searching</Link>
        <Link className="btn secondary" href="/manage" style={{ marginLeft: 12 }}>Manage booking</Link>
      </section>
      <section className="grid">
        <div className="card"><h3>Sydney Prestige</h3><p className="small">Weekly SyberJet service to Sydney.</p></div>
        <div className="card"><h3>Rotorua Shuttle</h3><p className="small">Twice every weekday using a Cirrus jet.</p></div>
        <div className="card"><h3>Island Services</h3><p className="small">Great Barrier, Chatham Islands, and Lake Tekapo routes.</p></div>
      </section>
    </>
  );
}
