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
  Flame,
} from "lucide-react";

export const revalidate = 1800; // 30 minutes cache revalidation

export default async function HomePage() {
  let featuredProducts: any[] = [];
  let activeAnnouncements: any[] = [];
  let categoriesContent: any = null;
  let showcaseContent: any = null;
  let allRecentProducts: any[] = [];
  let totalProductsCount = 0;

  try {
    const results = await Promise.all([
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
      prisma.siteContent.findUnique({ where: { key: "homepage_categories" } }),
      prisma.siteContent.findUnique({ where: { key: "homepage_showcase" } }),
      prisma.product.findMany({
        where: {
          isPublished: true,
          deletedAt: null,
        },
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({
        where: {
          isPublished: true,
          deletedAt: null,
        },
      }),
    ]);

    featuredProducts = results[0];
    activeAnnouncements = results[1];
    categoriesContent = results[2];
    showcaseContent = results[3];
    allRecentProducts = results[4];
    totalProductsCount = results[5];
  } catch (err) {
    console.warn("HomePage database fallback:", err);
  }

  const activeAnnouncement = activeAnnouncements[0];

  // Dynamic fallback: if no products explicitly checked as isFeatured, show latest published products
  const displayFeatured = featuredProducts.length > 0 ? featuredProducts : allRecentProducts.slice(0, 4);

  // Derive dynamic category product mappings from user's actual database creations
  const barProduct = allRecentProducts.find(
    (p) => p.category.toLowerCase() === "bar" || p.name.toLowerCase().includes("bar")
  );
  const customProduct = allRecentProducts.find(
    (p) => p.category.toLowerCase().includes("custom") || p.name.toLowerCase().includes("custom")
  );
  const miniProduct = allRecentProducts.find(
    (p) => p.category.toLowerCase().includes("mini") || p.name.toLowerCase().includes("mini")
  );

  const defaultCategories = [
    {
      title: "Bar",
      description:
        barProduct?.description ||
        "Terroir-driven single-origin dark and milk chocolate bars crafted from rare cacao beans.",
      href: "/shop?category=Bar",
      image:
        barProduct?.images?.[0] ||
        "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80",
      hoverImage: barProduct?.hoverImage || (barProduct?.images && barProduct.images.length > 1 ? barProduct.images[1] : null),
      tag: "SINGLE ORIGIN",
    },
    {
      title: "Customized Bar",
      description:
        customProduct?.description ||
        "Hand-poured bespoke chocolate bars custom-infused with roasted nuts, berries, and personalized inscriptions.",
      href: "/shop?category=Customized+Bar",
      image:
        customProduct?.images?.[0] ||
        "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=800&q=80",
      hoverImage: customProduct?.hoverImage || (customProduct?.images && customProduct.images.length > 1 ? customProduct.images[1] : null),
      tag: "BESPOKE CREATION",
    },
    {
      title: "mini",
      description:
        miniProduct?.description ||
        "Velvety bite-sized chocolates, mini bars, and delicate cocoa confections crafted for every sweet craving.",
      href: "/shop?category=mini",
      image:
        miniProduct?.images?.[0] ||
        "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
      hoverImage: miniProduct?.hoverImage || (miniProduct?.images && miniProduct.images.length > 1 ? miniProduct.images[1] : null),
      tag: "ARTISANAL BITES",
    },
  ];

  let collections = defaultCategories;
  if (categoriesContent && typeof categoriesContent.content === "object" && categoriesContent.content !== null) {
    const raw = categoriesContent.content as any;
    if (Array.isArray(raw.items) && raw.items.length > 0) {
      collections = raw.items;
    }
  }

  const defaultShowcase = [
    {
      title: "Molten Artisanal Ganache",
      subtitle: "70% Single-Origin Cacao",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Gold-Dusted Truffles",
      subtitle: "Hand-Rolled Artisan Gems",
      image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Customized Roasted Slabs",
      subtitle: "Pistachio & Sea Salt Inscription",
      image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Mini Cacao Bonbons",
      subtitle: "Bite-Sized Indulgence",
      image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
    },
  ];

  let showcaseItems = defaultShowcase;
  if (showcaseContent && typeof showcaseContent.content === "object" && showcaseContent.content !== null) {
    const raw = showcaseContent.content as any;
    if (Array.isArray(raw.items) && raw.items.length > 0) {
      showcaseItems = raw.items;
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* 1. Hero Canvas Scroll Sequence */}
      <HeroCanvas totalFrames={120} framePrefix="/frames/ezgif-frame-" frameExtension=".jpg" />

      {/* 2. Non-Clickable Lucrative Showcase Gallery (Pure Visual Eye-Candy) */}
      <section className="py-16 px-6 bg-[#1C140D] text-[#FAF7F2] border-y border-[#38281B] relative overflow-hidden">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#D4A853] font-bold block mb-2">
                Atelier Showcase · Visual Impressions
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#FAF7F2]">
                Artisanal Confectionery Showcase
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F2]/10 border border-[#FAF7F2]/15 text-xs text-[#E8DCCF]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
              <span>Showcase Only · Handcrafted in Dhaka</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {showcaseItems.map((item, idx) => (
              <div
                key={idx}
                className="group relative aspect-4/5 rounded-2xl overflow-hidden shadow-lg border border-[#38281B] hover:border-[#D4A853]/60 bg-[#2A1D13] select-none cursor-default transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(212,168,83,0.22)]"
              >
                <Image
                  src={item.image}
                  alt={item.title || "Artisanal Chocolate Showcase"}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#1C140D] via-[#1C140D]/30 to-transparent opacity-85 group-hover:opacity-65 transition-opacity duration-500" />
                {/* Time-lapse shade sweep light effect that shines and intensifies on mouse hover */}
                <div className="absolute -inset-full bg-linear-to-r from-transparent via-[#FAF7F2]/20 group-hover:via-[#D4A853]/35 to-transparent animate-timelapse-shade pointer-events-none transition-all duration-500" />
                <div className="absolute bottom-0 inset-x-0 p-4 space-y-1.5 z-10 pointer-events-none">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4A853] block group-hover:tracking-widest transition-all duration-300">
                    {item.subtitle || "Artisan Batch"}
                  </span>
                  <p className="font-serif text-sm sm:text-base font-bold text-[#FAF7F2] group-hover:text-[#D4A853] transition-colors duration-300 leading-tight">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Curated Collections Grid (Clickable Categories: Bar, Customized Bar, mini with Hover Image Swap) */}
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
            {collections.map((col) => {
              const secondaryImage = (col as any).hoverImage || null;

              return (
                <Link
                  key={col.title}
                  href={col.href}
                  className="group relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-6 sm:p-8 border border-[#E8DCCF]"
                >
                  {/* Default Base Image */}
                  <Image
                    src={col.image}
                    alt={col.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Hover Swap Image (Only displayed if an actual hover image is available) */}
                  {secondaryImage && (
                    <Image
                      src={secondaryImage}
                      alt={`${col.title} alternate view`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                    />
                  )}
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
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Featured Artisanal Chocolates (Real Database Records) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#F5EDE4]/40 border-t border-[#E8DCCF]">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
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
            {displayFeatured.map((product) => (
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

          <div className="mt-12 sm:mt-14 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#1C140D] hover:bg-[#C45A3C] text-[#FAF7F2] font-semibold text-sm transition-all shadow-md hover:shadow-lg"
            >
              View All {totalProductsCount || 8} Confections in Boutique <ArrowRight className="w-4 h-4" />
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
    </div>
  );
}
