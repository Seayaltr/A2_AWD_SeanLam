require('dotenv').config({ path: '.env.local' });

const { MongoClient } = require('mongodb');
require('dotenv/config');


const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'a2_airline';
if (!uri) throw new Error('Missing MONGODB_URI. Put it in .env.local and run: npm i dotenv --save-dev OR run this script with env vars loaded.');

//all the airports from the brief and their UTC offsets
const airports = [
  { code: 'NZNE', name: 'Dairy Flat', city: 'Auckland North', offsetMin: 12 * 60, tz: 'GMT+12' },
  { code: 'YSSY', name: 'Sydney', city: 'Sydney', offsetMin: 10 * 60, tz: 'GMT+10' },
  { code: 'NZRO', name: 'Rotorua', city: 'Rotorua', offsetMin: 12 * 60, tz: 'GMT+12' },
  { code: 'NZGB', name: 'Claris', city: 'Great Barrier Island', offsetMin: 12 * 60, tz: 'GMT+12' },
  { code: 'NZCI', name: 'Tuuta', city: 'Chatham Islands', offsetMin: 12 * 60 + 45, tz: 'GMT+12:45' },
  { code: 'NZTL', name: 'Lake Tekapo', city: 'Tekapo', offsetMin: 12 * 60, tz: 'GMT+12' }
];
const airportMap = Object.fromEntries(airports.map(a => [a.code, a]));

//date helpers so timezone maths stays in one place
function pad(n) { return String(n).padStart(2, '0'); }
function dateKey(d) { return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`; }
function localToUTC(dateStr, hhmm, airportCode) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = hhmm.split(':').map(Number);
  const offset = airportMap[airportCode].offsetMin;
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - offset * 60 * 1000);
}
function addMinutes(date, minutes) { return new Date(date.getTime() + minutes * 60 * 1000); }
function utcToLocalString(utcDate, airportCode) {
  const offset = airportMap[airportCode].offsetMin;
  const local = new Date(utcDate.getTime() + offset * 60 * 1000);
  return `${dateKey(local)} ${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`;
}

//flight numbers just need to be unique for this seed
let counter = 100;
function makeFlight(dateStr, depTime, origin, destination, aircraft, capacity, durationMin, priceNZD, prefix) {
  const departUTC = localToUTC(dateStr, depTime, origin);
  const arriveUTC = addMinutes(departUTC, durationMin);
  return {
    flightNumber: `${prefix}${counter++}`,
    aircraft,
    capacity,
    origin,
    destination,
    departLocal: utcToLocalString(departUTC, origin),
    arriveLocal: utcToLocalString(arriveUTC, destination),
    departUTC: departUTC.toISOString(),
    arriveUTC: arriveUTC.toISOString(),
    originTz: airportMap[origin].tz,
    destinationTz: airportMap[destination].tz,
    priceNZD,
    bookings: []
  };
}

function generateSchedules(start = '2026-06-01', end = '2026-08-31') {
  const schedules = [];
  //go day by day and add whatever runs on that weekday
  for (let d = new Date(`${start}T00:00:00Z`); d <= new Date(`${end}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    const day = d.getUTCDay(); // sun 0, mon 1, etc
    const dateStr = dateKey(d);

    //fancy sydney one: out fri, back sun
    if (day === 5) schedules.push(makeFlight(dateStr, '10:00', 'NZNE', 'YSSY', 'SyberJet SJ30i', 6, 220, 1250, 'DFA'));
    if (day === 0) schedules.push(makeFlight(dateStr, '15:00', 'YSSY', 'NZNE', 'SyberJet SJ30i', 6, 195, 1250, 'DFA'));

    //rotorua does a morning and evening run every weekday
    if (day >= 1 && day <= 5) {
      schedules.push(makeFlight(dateStr, '07:00', 'NZNE', 'NZRO', 'Cirrus SF50', 4, 45, 260, 'DFA'));
      schedules.push(makeFlight(dateStr, '08:30', 'NZRO', 'NZNE', 'Cirrus SF50', 4, 45, 260, 'DFA'));
      schedules.push(makeFlight(dateStr, '16:30', 'NZNE', 'NZRO', 'Cirrus SF50', 4, 45, 260, 'DFA'));
      schedules.push(makeFlight(dateStr, '18:00', 'NZRO', 'NZNE', 'Cirrus SF50', 4, 45, 260, 'DFA'));
    }

    //great barrier alternates out and back days
    if ([1, 3, 5].includes(day)) schedules.push(makeFlight(dateStr, '09:30', 'NZNE', 'NZGB', 'Cirrus SF50', 4, 35, 220, 'DFA'));
    if ([2, 4, 6].includes(day)) schedules.push(makeFlight(dateStr, '09:30', 'NZGB', 'NZNE', 'Cirrus SF50', 4, 35, 220, 'DFA'));

    //chathams: out tue/fri, back wed/sat
    if ([2, 5].includes(day)) schedules.push(makeFlight(dateStr, '08:00', 'NZNE', 'NZCI', 'HondaJet Elite', 5, 120, 760, 'DFA'));
    if ([3, 6].includes(day)) schedules.push(makeFlight(dateStr, '14:00', 'NZCI', 'NZNE', 'HondaJet Elite', 5, 140, 760, 'DFA'));

    //tekapo weekly: monday down, tuesday back
    if (day === 1) schedules.push(makeFlight(dateStr, '11:00', 'NZNE', 'NZTL', 'HondaJet Elite', 5, 90, 540, 'DFA'));
    if (day === 2) schedules.push(makeFlight(dateStr, '14:00', 'NZTL', 'NZNE', 'HondaJet Elite', 5, 100, 540, 'DFA'));
  }
  return schedules;
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  //wipe old seed data so rerunning this does not duplicate everything
  await db.collection('airports').deleteMany({});
  await db.collection('schedules').deleteMany({});
  await db.collection('passengers').deleteMany({});
  await db.collection('airports').insertMany(airports);
  const schedules = generateSchedules();
  await db.collection('schedules').insertMany(schedules);

  //indexes for the searches the app actually does
  await db.collection('schedules').createIndex({ origin: 1, destination: 1, departUTC: 1 });
  await db.collection('schedules').createIndex({ 'bookings.reference': 1 });
  await db.collection('schedules').createIndex({ 'bookings.email': 1 });
  console.log(`Seeded ${airports.length} airports and ${schedules.length} scheduled flights.`);
  await client.close();
}
main().catch(err => { console.error(err); process.exit(1); });
