import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nomad Compass — Southeast Asia Cost of Living",
  description: "Explore the real cost of living across Southeast Asian countries. Your guide to affordable nomad life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
