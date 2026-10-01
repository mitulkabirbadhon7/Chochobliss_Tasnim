"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  MapPin,
  ShieldCheck,
  HeartHandshake,
  Truck,
  ArrowRight,
  Megaphone,
  Mail,
  Star,
} from "lucide-react";
import { getPublicSiteContentAction } from "@/lib/actions/admin";
import { getCuratedTestimonialsAction } from "@/lib/actions/review";

export function Footer() {
  const pathname = usePathname();
  const [instagramHref, setInstagramHref] = useState("https://instagram.com/chocobliss.tasnim");
  const [facebookHref, setFacebookHref] = useState("https://facebook.com/chocoblissbytasnim");
  const [testimonials, setTestimonials] = useState<
    Array<{
      id: string;
      rating: number;
      title: string | null;
      comment: string;
      userName: string;
      productName: string;
    }>
  >([
    {
      id: "t1",
      rating: 5,
      title: "Pure Terroir Experience",
      comment: "The 72% Madagascar bar blew me away with its tart raspberry notes. Truly artisanal chocolate.",
      userName: "Amira Rahman",
      productName: "Dark Bar 72%",
    },
    {
      id: "t2",
      rating: 5,
      title: "Unmatched Gloss & Snap",
      comment: "Arrived in insulated thermal foil in perfect condition. The single-origin conching is exceptional.",
      userName: "Farhan Chowdhury",
      productName: "Artisanal Truffles",
    },
    {
      id: "t3",
      rating: 5,
      title: "Bespoke Perfection",
      comment: "Custom roasted slab with pistachio was a huge hit for our anniversary. Tasnim's craftsmanship is second to none.",
      userName: "Sadia Karim",
      productName: "Customized Bar",
    },
  ]);

  useEffect(() => {
    let isMounted = true;
    getPublicSiteContentAction("social_links")
      .then((res) => {
        if (isMounted && res?.success && res?.data && typeof res.data.content === "object") {
          const c = res.data.content as any;
          if (c.instagramUrl) setInstagramHref(c.instagramUrl);
          if (c.facebookUrl) setFacebookHref(c.facebookUrl);
        }
      })
      .catch(() => {});

    getCuratedTestimonialsAction(3)
      .then((res) => {
        if (isMounted && res.success && res.data.length > 0) {
          setTestimonials(res.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const categories = [
    { name: "Bar", href: "/shop?category=Bar" },
    { name: "Customized Bar", href: "/shop?category=Customized+Bar" },
    { name: "mini", href: "/shop?category=mini" },
  ];

  return (
    <footer className="bg-[#1C140D] text-[#F5EDE4] border-t border-[#634E3F]/40 mt-auto">
      {/* 1. Verified Connoisseur Reviews & Testimonials (Task 5) */}
      <div className="border-b border-[#634E3F]/30 py-10 bg-[#160f0a]">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4A853] font-bold block mb-1">
                Verified Reflections
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#F5EDE4]">
                Loved by Discerning Connoisseurs
              </h3>
            </div>
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4A853] hover:bg-[#FAF7F2] text-[#1C140D] font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 w-fit"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-[#2A1D13] border border-[#634E3F]/40 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex text-[#D4A853]">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  {t.title && (
                    <h5 className="font-serif text-sm font-bold text-[#F5EDE4]">
                      {t.title}
                    </h5>
                  )}
                  <p className="text-xs text-[#E8DCCF]/80 leading-relaxed italic line-clamp-3">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                </div>
                <div className="pt-2 border-t border-[#634E3F]/30 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#F5EDE4]">{t.userName}</span>
                  <span className="text-[#D4A853] font-medium">Verified Customer</span>
                </div>
              </div>
            ))}
          </div>

          {/* Centered Button to See All Reviews */}
          <div className="text-center pt-8">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2A1D13] hover:bg-[#D4A853] hover:text-[#1C140D] text-[#FAF7F2] border border-[#634E3F]/50 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-md hover:scale-102"
            >
              <Star className="w-3.5 h-3.5 text-[#D4A853] fill-current" />
              <span>View All Customer Reviews</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Value Proposition Strip */}
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
              <h4 className="font-serif text-sm font-bold text-[#F5EDE4]">Small-Batch Handcrafted</h4>
              <p className="text-xs text-[#E8DCCF]/70">Artisanal granite stone conching.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#C45A3C]/20 text-[#C45A3C] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#F5EDE4]">Climate-Controlled Shipping</h4>
              <p className="text-xs text-[#E8DCCF]/70">Free delivery on orders over $100.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#D4A853]/20 text-[#D4A853] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#F5EDE4]">Pure Ingredients</h4>
              <p className="text-xs text-[#E8DCCF]/70">Zero artificial preservatives or palm oils.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info & Shop Now & Social Links */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3.5 group">
              <div className="relative w-12 h-12 shrink-0 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/images/logo.png"
                  alt="Chocobliss by Tasnim"
                  fill
                  className="object-contain drop-shadow-md"
                />
              </div>
              <div>
                <span className="font-serif text-3xl font-bold tracking-tight text-[#F5EDE4] group-hover:text-[#C45A3C] transition-colors leading-none block">
                  Chocobliss
                </span>
                <span className="block text-xs uppercase tracking-[0.25em] text-[#D4A853] font-semibold mt-1">
                  By Tasnim
                </span>
              </div>
            </Link>
            <p className="text-sm text-[#E8DCCF]/80 max-w-sm leading-relaxed">
              Handcrafted in Dhaka, Bangladesh. Dedicated to celebrating the complex terroir of heritage cacao through contemporary confectionery artistry.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#D4A853] font-medium">
              <MapPin className="w-4 h-4 text-[#C45A3C]" />
              <span>Dhanmondi, Dhaka, Bangladesh</span>
            </div>

            {/* Shop Now CTA Button */}
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-[#C45A3C] hover:bg-[#a8492e] text-[#FAF7F2] font-semibold text-xs tracking-wide uppercase transition-all shadow-md hover:shadow-lg"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2 Social Media Buttons */}
            <div className="pt-2">
              <span className="block text-[11px] uppercase tracking-wider font-semibold text-[#D4A853] mb-2.5">
                Connect With Us On Social
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2A1F17] hover:bg-[#E1306C] text-[#FAF7F2] text-xs font-medium border border-[#634E3F]/50 transition-all hover:scale-105"
                  aria-label="Visit Chocobliss on Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>Instagram</span>
                </a>

                <a
                  href={facebookHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2A1F17] hover:bg-[#1877F2] text-[#FAF7F2] text-xs font-medium border border-[#634E3F]/50 transition-all hover:scale-105"
                  aria-label="Visit Chocobliss on Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </div>

          {/* Collections Column with Sub-Category Buttons */}
          <div className="space-y-4">
            <div>
              <Link
                href="/shop"
                className="group inline-flex items-center gap-1.5 font-serif text-base font-bold text-[#F5EDE4] hover:text-[#D4A853] transition-colors tracking-wide"
              >
                <span>Collections</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-[11px] text-[#E8DCCF]/60 mt-0.5">Explore by category</p>
            </div>

            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link
                    href={cat.href}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#E8DCCF]/80 hover:text-[#FAF7F2] bg-[#2A1F17]/60 hover:bg-[#2A1F17] border border-[#634E3F]/30 transition-all"
                  >
                    <span>{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Announcements & Inquiries Column */}
          <div className="space-y-4">
            <h5 className="font-serif text-base font-bold text-[#F5EDE4] tracking-wide">
              News & Contact
            </h5>

            <div className="space-y-2.5">
              <div>
                <Link
                  href="/announcements"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2A1F17] hover:bg-[#C45A3C] text-[#FAF7F2] text-xs font-medium border border-[#634E3F]/40 transition-colors w-full sm:w-auto"
                >
                  <Megaphone className="w-3.5 h-3.5 text-[#D4A853]" />
                  <span>Announcements</span>
                </Link>
              </div>

              <div>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2A1F17] hover:bg-[#C45A3C] text-[#FAF7F2] text-xs font-medium border border-[#634E3F]/40 transition-colors w-full sm:w-auto"
                >
                  <Mail className="w-3.5 h-3.5 text-[#C45A3C]" />
                  <span>Contact With Us</span>
                </Link>
              </div>

              <div>
                <Link
                  href="/reviews"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2A1F17] hover:bg-[#D4A853] hover:text-[#1C140D] text-[#FAF7F2] text-xs font-medium border border-[#634E3F]/40 transition-colors w-full sm:w-auto"
                >
                  <Star className="w-3.5 h-3.5 text-[#D4A853]" />
                  <span>Review</span>
                </Link>
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="text-xs text-[#E8DCCF]/70 hover:text-[#D4A853] transition-colors block"
                >
                  Cocoa Points Rewards
                </Link>
              </div>
            </div>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h5 className="font-serif text-base font-bold text-[#F5EDE4] tracking-wide">
              Customer Care
            </h5>
            <ul className="space-y-2 text-sm text-[#E8DCCF]/70">
              <li className="text-xs text-[#E8DCCF]/60">
                Warm Weather Guarantee: Insulated boxes packed with cold gel.
              </li>
              <li className="text-xs text-[#E8DCCF]/60">
                Complaints or inquiries sent to both atelier admin inboxes.
              </li>
              <li className="pt-1">
                <Link
                  href="/login"
                  className="hover:text-[#D4A853] transition-colors text-xs font-semibold text-[#D4A853]"
                >
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
          <div className="flex items-center gap-4 flex-wrap">
            <p>© {new Date().getFullYear()} Chocobliss by Tasnim. All rights reserved.</p>
            <span className="text-[#634E3F]">•</span>
            <Link
              href="/privacy"
              className="px-3 py-1 rounded-full bg-[#2A1F17] hover:bg-[#C45A3C] text-[#FAF7F2] text-xs font-medium border border-[#634E3F]/50 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
          <p className="text-center sm:text-right font-serif italic text-[#D4A853]/90">
            Handcrafted with passion for discerning chocolate lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
