import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Dairy Flat Air',
  description: 'Online booking system for Assignment 2'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <Link href="/" className="brand">Dairy Flat Air</Link>
          <div>
            <Link href="/search">Search flights</Link>
            <Link href="/manage">Manage booking</Link>
          </div>
        </nav>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
