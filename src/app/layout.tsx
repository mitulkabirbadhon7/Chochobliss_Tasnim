import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chocobliss by Tasnim | Artisanal Chocolates",
  description: "Handcrafted, single-origin artisanal luxury chocolates by Tasnim.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
