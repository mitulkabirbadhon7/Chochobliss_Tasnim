import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/store/provider";
import { SessionSync } from "@/components/shared/SessionSync";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SessionService } from "@/lib/auth/session";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1C140D",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Chocobliss by Tasnim | Artisanal Chocolates & Luxury Confections",
    template: "%s | Chocobliss by Tasnim",
  },
  description:
    "Handcrafted, single-origin artisanal luxury chocolates, velvety truffles, and bespoke gift boxes made with passion by Tasnim in Dhaka, Bangladesh.",
  keywords: [
    "artisanal chocolate",
    "single origin chocolate",
    "luxury chocolates Dhaka",
    "handmade truffles",
    "Chocobliss",
    "Tasnim chocolate",
  ],
  authors: [{ name: "Tasnim", url: "https://chocobliss.test" }],
  openGraph: {
    title: "Chocobliss by Tasnim | Artisanal Chocolates",
    description: "Handcrafted, single-origin artisanal luxury chocolates by Tasnim.",
    type: "website",
    locale: "en_US",
  },
  icons: {
    icon: [
      { url: "/images/logo.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative server-side session check
  const currentUser = await SessionService.getCurrentUser();

  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C140D] font-sans antialiased selection:bg-[#C45A3C] selection:text-[#FAF7F2]">
        <StoreProvider>
          {/* Synchronize server-verified session to client Redux for header UI display */}
          <SessionSync initialUser={currentUser} />

          {/* Navigation Bar */}
          <Navbar />

          {/* Main Page Area */}
          <main className="flex-1 flex flex-col">{children}</main>

          {/* Slide-out Cart Drawer */}
          <CartDrawer />

          {/* Global Footer */}
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
