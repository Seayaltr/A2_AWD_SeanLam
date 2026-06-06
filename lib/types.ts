export type Booking = {
  reference: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bookedAt: string;
  status: 'confirmed' | 'cancelled';
};

export type Schedule = {
  _id?: string;
  flightNumber: string;
  aircraft: string;
  capacity: number;
  origin: string;
  destination: string;
  departLocal: string;
  arriveLocal: string;
  departUTC: string;
  arriveUTC: string;
  originTz: string;
  destinationTz: string;
  priceNZD: number;
  bookings: Booking[];
};
