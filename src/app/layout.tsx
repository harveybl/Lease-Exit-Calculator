import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lease Tracker",
  description: "Vehicle lease exit option comparison tool",
  themeColor: '#0d9488',
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
