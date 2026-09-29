import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { HeroCanvas } from "@/components/canvas/HeroCanvas";
import { ProductCard } from "@/components/shop/ProductCard";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Award,
  Star,
  Quote,
  Flame,
} from "lucide-react";

export const revalidate = 1800; // 30 minutes cache revalidation

export default async function HomePage() {
  // Query authoritative active featured products and announcements from Neon DB
  const [featuredProducts, activeAnnouncements] = await Promise.all([
    prisma.product.findMany({
      where: {
        isFeatured: true,
        isPublished: true,
        deletedAt: null,
      },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    prisma.announcement.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: new Date() } }] },
          { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
        ],
      },
      take: 1,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const activeAnnouncement = activeAnnouncements[0];

  const collections = [
    {
      title: "Single-Origin Dark Bars",
      description: "Terroir-driven 68% to 85% single-origin cacao from Madagascar, Ecuador, and Colombia.",
      href: "/shop?category=Bars",
      image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80",
      tag: "Terroir Nuances",
    },
    {
      title: "Velvet Ganache Truffles",
      description: "Hand-rolled couture truffles with passionfruit, smoked sea salt, and Piedmont hazelnut.",
      href: "/shop?category=Truffles",
      image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
      tag: "Silk Ganache",
    },
    {
      title: "Grand Tasting Gift Boxes",
      description: "Two-tier keepsake presentation boxes curated for true chocolate connoisseurs.",
      href: "/shop?category=Gift+Boxes",
      image: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80",
      tag: "Couture Gifting",
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* 1. Hero Canvas Scroll Sequence */}
      <HeroCanvas totalFrames={120} framePrefix="/frames/ezgif-frame-" frameExtension=".jpg" />


      {/* 3. Curated Collections Grid */}
      <section className="py-20 px-6 bg-[#FAF7F2]">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#C45A3C] font-bold block mb-2">
                Artisanal Terroirs
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1C140D]">
                Curated Collections
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1C140D] hover:text-[#C45A3C] transition-colors"
            >
              Browse Full Shop <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {collections.map((col) => (
              <Link
                key={col.title}
                href={col.href}
                className="group relative h-96 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-8 border border-[#E8DCCF]"
              >
                <Image
                  src={col.image}
                  alt={col.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#1C140D] via-[#1C140D]/50 to-transparent" />

                <div className="relative z-10 space-y-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#D4A853]/90 text-[#1C140D] text-[10px] font-bold uppercase tracking-wider">
                    {col.tag}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#F5EDE4] group-hover:text-[#D4A853] transition-colors">
                    {col.title}
                  </h3>
                  <p className="text-xs text-[#E8DCCF]/80 line-clamp-2 leading-relaxed font-light">
                    {col.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured Artisanal Chocolates (Real Database Records) */}
      <section className="py-20 px-6 bg-[#F5EDE4]/40 border-t border-[#E8DCCF]">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4A853] font-bold block">
              Hand-Selected Batches
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1C140D]">
              Tasnim&apos;s Signature Creations
            </h2>
            <p className="text-sm sm:text-base text-[#634E3F] leading-relaxed">
              Each recipe is micro-batched and hand-tempered with strict temperature curves to celebrate rare cacao genetics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  price: Number(product.price),
                  salePrice: product.salePrice ? Number(product.salePrice) : null,
                }}
              />
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#1C140D] hover:bg-[#C45A3C] text-[#FAF7F2] font-semibold text-sm transition-all shadow-md hover:shadow-lg"
            >
              View All 8 Confections in Boutique <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Brand Craftsmanship & Sourcing Ethics */}
      <section className="py-24 px-6 bg-[#1C140D] text-[#F5EDE4] relative overflow-hidden">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C45A3C]/20 border border-[#C45A3C]/40 text-xs font-semibold text-[#D4A853] tracking-widest uppercase">
              <Flame className="w-3.5 h-3.5 text-[#C45A3C]" />
              <span>Bean-to-Bar Craftsmanship</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#F5EDE4] leading-tight">
              72 Hours of Conching, Zero Artificial Fillers.
            </h2>

            <p className="text-sm sm:text-base text-[#E8DCCF]/85 leading-relaxed font-light">
              Conventional industrial chocolate masks mediocre cacao with excess white sugar, palm oil, and synthetic vanilla. At Chocobliss, Tasnim works exclusively with single-origin beans harvested by direct-trade farming cooperatives.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-2">
              <div className="space-y-1">
                <span className="font-serif text-3xl font-bold text-[#D4A853]">100%</span>
                <p className="text-xs text-[#E8DCCF]/70">Direct-Trade Single-Origin Beans</p>
              </div>
              <div className="space-y-1">
                <span className="font-serif text-3xl font-bold text-[#D4A853]">72h</span>
                <p className="text-xs text-[#E8DCCF]/70">Stone Conching for Silk Texture</p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/story"
                className="inline-flex items-center gap-2 px-7 py-3 bg-[#D4A853] hover:bg-[#c59a45] text-[#1C140D] rounded-full text-sm font-bold transition-all shadow-md"
              >
                Read Tasnim&apos;s Story <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Visual Showcase */}
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden border border-[#634E3F]/40 shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=1200&q=80"
              alt="Artisanal chocolate tempering"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 6. Connoisseur Reviews & Testimonials */}
      <section className="py-20 px-6 bg-[#FAF7F2] border-t border-[#E8DCCF]">
        <div className="container-custom">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C45A3C] font-bold block">
              Connoisseur Reflections
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C140D]">
              Loved by Discerning Palates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-[#E8DCCF] shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex text-[#D4A853]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-[#C45A3C]/40" />
                <p className="text-sm text-[#634E3F] leading-relaxed italic">
                  &ldquo;The 72% Madagascar bar blew me away with its tart raspberry notes. You can genuinely taste the terroir, unlike anything on grocery store shelves.&rdquo;
                </p>
              </div>
              <div>
                <strong className="block text-xs font-bold text-[#1C140D]">Amira Rahman</strong>
                <span className="text-[11px] text-[#634E3F]">Dhaka • Verified Customer</span>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#E8DCCF] shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex text-[#D4A853]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-[#C45A3C]/40" />
                <p className="text-sm text-[#634E3F] leading-relaxed italic">
                  &ldquo;The velvet truffle collection was packaged in thermal insulation with ice gel. Arrived pristine in the Dhaka humidity. A truly luxurious gift.&rdquo;
                </p>
              </div>
              <div>
                <strong className="block text-xs font-bold text-[#1C140D]">Farhan Chowdhury</strong>
                <span className="text-[11px] text-[#634E3F]">Gulshan • Verified Customer</span>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#E8DCCF] shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex text-[#D4A853]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-[#C45A3C]/40" />
                <p className="text-sm text-[#634E3F] leading-relaxed italic">
                  &ldquo;The Grand Cru box is my go-to corporate gift. Tasnim included our custom note on textured cream cardstock. Exceptional attention to detail.&rdquo;
                </p>
              </div>
              <div>
                <strong className="block text-xs font-bold text-[#1C140D]">Sadia Karim</strong>
                <span className="text-[11px] text-[#634E3F]">Banani • Corporate Patron</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
