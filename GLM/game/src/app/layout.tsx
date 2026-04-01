import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Void Striker",
  description: "A top-down 2D space shooter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: 'hidden', background: '#050510' }}>
        {children}
      </body>
    </html>
  );
}
