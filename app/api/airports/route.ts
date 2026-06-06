import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { code: 'NZNE', name: 'Dairy Flat', city: 'Auckland North' },
    { code: 'YSSY', name: 'Sydney', city: 'Sydney' },
    { code: 'NZRO', name: 'Rotorua', city: 'Rotorua' },
    { code: 'NZGB', name: 'Claris', city: 'Great Barrier Island' },
    { code: 'NZCI', name: 'Tuuta', city: 'Chatham Islands' },
    { code: 'NZTL', name: 'Lake Tekapo', city: 'Tekapo' }
  ]);
}
