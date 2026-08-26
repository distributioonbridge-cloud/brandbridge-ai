import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DistributionBridge | Amazon SP-API Integration Dashboard',
  description: 'Enterprise Amazon Brand Protection, MAP Monitoring & Wholesale Sales Intelligence',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
