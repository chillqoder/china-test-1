import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Space Shooter",
  description: "Top-down 2D space shooter",
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
