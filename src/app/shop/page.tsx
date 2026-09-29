import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";
import { Sparkles, Search, SlidersHorizontal, ArrowLeft, RotateCcw } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Artisanal Boutique | Handcrafted Chocolates",
  description:
    "Explore our collection of single-origin dark chocolate bars, velvety truffles, and luxury gift boxes handcrafted by Tasnim in Dhaka.",
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    inStock?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const activeCategory = params.category || "All";
  const searchQuery = params.search?.trim() || "";
  const sortOption = params.sort || "newest";
  const inStockOnly = params.inStock === "true";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const pageSize = 12;

  // Build Prisma Where query (Strictly excluding soft-deleted and unpublished products)
  const where: any = {
    deletedAt: null,
    isPublished: true,
  };

  if (activeCategory !== "All") {
    where.category = activeCategory;
  }

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
      { origin: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  if (inStockOnly) {
    where.inventory = { gt: 0 };
  }

  // Sorting logic
  let orderBy: any = { createdAt: "desc" };
  if (sortOption === "price_asc") {
    orderBy = { price: "asc" };
  } else if (sortOption === "price_desc") {
    orderBy = { price: "desc" };
  }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const categories = ["All", "Bars", "Truffles", "Gift Boxes", "Seasonal"];

  return (
    <div className="flex-1 py-12 px-6 bg-[#FAF7F2]">
      <div className="container-custom space-y-10">
        {/* 1. Header Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5EDE4] border border-[#E8DCCF] text-xs font-semibold text-[#634E3F] tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
            <span>Small-Batch Boutique Catalog</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#1C140D]">
            The Artisanal Boutique
          </h1>
          <p className="text-sm sm:text-base text-[#634E3F] leading-relaxed">
            Single-origin dark chocolate tablettes, couture ganache truffles, and curated gifts handcrafted with terroir nuance.
          </p>
        </div>

        {/* 2. Interactive Filter & Search Controls */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-6">
          {/* Top row: Categories */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => {
                const isSelected = activeCategory === cat;
                const queryParams = new URLSearchParams();
                if (cat !== "All") queryParams.set("category", cat);
                if (searchQuery) queryParams.set("search", searchQuery);
                if (sortOption !== "newest") queryParams.set("sort", sortOption);
                if (inStockOnly) queryParams.set("inStock", "true");

                return (
                  <Link
                    key={cat}
                    href={`/shop?${queryParams.toString()}`}
                    className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      isSelected
                        ? "bg-[#1C140D] text-[#F5EDE4] shadow-xs"
                        : "bg-[#F5EDE4]/60 hover:bg-[#F5EDE4] text-[#1C140D] border border-[#E8DCCF]"
                    }`}
                  >
                    {cat}
                  </Link>
                );
              })}
            </div>

            {/* Results Counter */}
            <span className="text-xs font-medium text-[#634E3F]">
              Showing {products.length} of {totalCount} {totalCount === 1 ? "creation" : "creations"}
            </span>
          </div>

          {/* Bottom row: Search Form & Sort Options */}
          <form method="GET" action="/shop" className="flex flex-col sm:flex-row items-center gap-4">
            {activeCategory !== "All" && <input type="hidden" name="category" value={activeCategory} />}

            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#634E3F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search by flavor, origin (e.g. Madagascar, Citrus)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] text-sm text-[#1C140D] placeholder-[#634E3F]/60 focus:bg-white focus:outline-hidden focus:border-[#C45A3C] transition-colors"
              />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                name="sort"
                defaultValue={sortOption}
                className="px-3.5 py-2.5 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] text-xs font-semibold text-[#1C140D] focus:bg-white focus:outline-hidden"
              >
                <option value="newest">Sort by: Newest Releases</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#C45A3C] hover:bg-[#a8492e] text-[#FAF7F2] text-xs font-semibold rounded-xl transition-colors shadow-xs"
              >
                Filter
              </button>
            </div>
          </form>
        </div>

        {/* 3. Products Grid */}
        {products.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#E8DCCF] p-8 max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#F5EDE4] text-[#C45A3C] flex items-center justify-center mx-auto">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#1C140D]">No Chocolates Found</h3>
            <p className="text-sm text-[#634E3F] leading-relaxed">
              No artisanal confections match your active search or category filters. Try adjusting your parameters.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C140D] hover:bg-[#C45A3C] text-[#FAF7F2] text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
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
        )}

        {/* 4. Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isCurrent = pageNum === currentPage;
              const p = new URLSearchParams();
              if (activeCategory !== "All") p.set("category", activeCategory);
              if (searchQuery) p.set("search", searchQuery);
              if (sortOption !== "newest") p.set("sort", sortOption);
              p.set("page", String(pageNum));

              return (
                <Link
                  key={pageNum}
                  href={`/shop?${p.toString()}`}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                    isCurrent
                      ? "bg-[#1C140D] text-[#FAF7F2]"
                      : "bg-white border border-[#E8DCCF] text-[#1C140D] hover:bg-[#F5EDE4]"
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
