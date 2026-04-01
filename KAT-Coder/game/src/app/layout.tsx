import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Space Shooter",
  description: "A top-down 2D space shooter game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
