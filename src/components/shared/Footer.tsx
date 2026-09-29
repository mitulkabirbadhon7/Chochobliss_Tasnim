import React from "react";
import Link from "next/link";
import { Sparkles, MapPin, ShieldCheck, HeartHandshake, Truck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#1C140D] text-[#F5EDE4] border-t border-[#634E3F]/40 mt-auto">
      {/* 1. Value Proposition Strip */}
      <div className="border-b border-[#634E3F]/30 py-8 bg-[#150e09]">
        <div className="container-custom grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#C45A3C]/20 text-[#C45A3C] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#F5EDE4]">Single-Origin Beans</h4>
              <p className="text-xs text-[#E8DCCF]/70">Directly traded, ethically harvested cacao.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#D4A853]/20 text-[#D4A853] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#F5EDE4]">Handcrafted in Small Batches</h4>
              <p className="text-xs text-[#E8DCCF]/70">Artisanal tempering and bespoke recipes.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#C45A3C]/20 text-[#C45A3C] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#F5EDE4]">Climate-Controlled Shipping</h4>
              <p className="text-xs text-[#E8DCCF]/70">Complimentary delivery on orders over $100.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#D4A853]/20 text-[#D4A853] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#F5EDE4]">Pure Ingredients</h4>
              <p className="text-xs text-[#E8DCCF]/70">No artificial preservatives or palm oils.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-3xl font-bold tracking-tight text-[#F5EDE4] hover:text-[#C45A3C] transition-colors">
                Chocobliss
              </span>
              <span className="block text-xs uppercase tracking-[0.25em] text-[#D4A853] font-semibold mt-0.5">
                By Tasnim
              </span>
            </Link>
            <p className="text-sm text-[#E8DCCF]/80 max-w-sm leading-relaxed">
              Handcrafted in Dhaka, Bangladesh. Dedicated to celebrating the complex nuances of heritage cacao through contemporary confectionery artistry.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D4A853] font-medium pt-2">
              <MapPin className="w-4 h-4 text-[#C45A3C]" />
              <span>Dhanmondi, Dhaka, Bangladesh</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="font-serif text-base font-bold text-[#F5EDE4] tracking-wide">
              Collections
            </h5>
            <ul className="space-y-2 text-sm text-[#E8DCCF]/70">
              <li>
                <Link href="/shop" className="hover:text-[#D4A853] transition-colors">
                  All Chocolates
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Bars" className="hover:text-[#D4A853] transition-colors">
                  Single-Origin Bars
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Truffles" className="hover:text-[#D4A853] transition-colors">
                  Velvet Truffles
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Gifts" className="hover:text-[#D4A853] transition-colors">
                  Bespoke Gift Boxes
                </Link>
              </li>
            </ul>
          </div>

          {/* The Craft */}
          <div className="space-y-3">
            <h5 className="font-serif text-base font-bold text-[#F5EDE4] tracking-wide">
              The Craft
            </h5>
            <ul className="space-y-2 text-sm text-[#E8DCCF]/70">
              <li>
                <Link href="/story" className="hover:text-[#D4A853] transition-colors">
                  Tasnim&apos;s Story
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="hover:text-[#D4A853] transition-colors">
                  Announcements & News
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#D4A853] transition-colors">
                  Cocoa Points Rewards
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h5 className="font-serif text-base font-bold text-[#F5EDE4] tracking-wide">
              Customer Care
            </h5>
            <ul className="space-y-2 text-sm text-[#E8DCCF]/70">
              <li className="text-xs text-[#E8DCCF]/60">
                Warm Weather Guarantee: Packages shipped in insulated foil with ice gel.
              </li>
              <li className="text-xs text-[#E8DCCF]/60">
                Personalized gift cards included upon request at checkout.
              </li>
              <li>
                <Link href="/login" className="hover:text-[#D4A853] transition-colors text-xs font-semibold text-[#D4A853]">
                  Account Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal & Attribution */}
      <div className="border-t border-[#634E3F]/30 py-6 text-xs text-[#E8DCCF]/60">
        <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Chocobliss by Tasnim. All rights reserved.</p>
          <p className="text-center sm:text-right font-serif italic text-[#D4A853]/90">
            Handcrafted with passion for discerning chocolate lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
