import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nomad Compass — Southeast Asia Cost of Living',
  description: 'Discover the real cost of living across Southeast Asia. Compare cities, plan your escape, and make the dream possible.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
