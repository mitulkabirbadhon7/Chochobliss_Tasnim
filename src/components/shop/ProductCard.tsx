"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch } from "@/store/hooks";
import { addItem, setCartOpen } from "@/store/slices/cartSlice";
import { ShoppingBag, Sparkles, Check } from "lucide-react";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number | string;
    salePrice?: number | string | null;
    inventory: number;
    cacaoPercentage?: number | null;
    origin?: string | null;
    flavorNotes?: string[];
    images: string[];
    category: string;
    weight?: string | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const [isAdded, setIsAdded] = React.useState(false);

  const numericPrice = Number(product.price);
  const numericSalePrice = product.salePrice != null ? Number(product.salePrice) : null;
  const effectivePrice = numericSalePrice ?? numericPrice;
  const isOutOfStock = product.inventory <= 0;
  const isLowStock = product.inventory > 0 && product.inventory <= 5;
  const primaryImage = product.images[0] || "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: numericPrice,
        salePrice: numericSalePrice,
        image: primaryImage,
        cacaoPercentage: product.cacaoPercentage,
        weight: product.weight,
        quantity: 1,
      })
    );

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
    dispatch(setCartOpen(true));
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-[#E8DCCF] overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300">
      {/* 1. Image Container */}
      <Link href={`/shop/${product.slug}`} className="relative aspect-4/3 w-full overflow-hidden bg-[#F5EDE4] block">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.cacaoPercentage && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#1C140D]/85 text-[#F5EDE4] backdrop-blur-xs">
              {product.cacaoPercentage}% Cacao
            </span>
          )}
          {numericSalePrice && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#C45A3C] text-[#FAF7F2] shadow-xs">
              Sale
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-[#1C140D]/60 backdrop-blur-2xs flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-full bg-[#1C140D] text-[#E8DCCF] text-xs font-bold uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        ) : isLowStock ? (
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#D4A853]/90 text-[#1C140D] text-[10px] font-bold tracking-wider uppercase">
              Only {product.inventory} Left
            </span>
          </div>
        ) : null}
      </Link>

      {/* 2. Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Origin */}
          <div className="flex items-center justify-between text-xs text-[#634E3F] font-medium mb-1.5">
            <span className="uppercase tracking-wider">{product.category}</span>
            {product.origin && <span className="truncate max-w-[120px]">{product.origin}</span>}
          </div>

          {/* Title */}
          <Link href={`/shop/${product.slug}`} className="block group-hover:text-[#C45A3C] transition-colors">
            <h3 className="font-serif text-lg font-bold text-[#1C140D] leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Tasting Notes */}
          {product.flavorNotes && product.flavorNotes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {product.flavorNotes.slice(0, 3).map((note) => (
                <span
                  key={note}
                  className="px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E8DCCF] text-[11px] text-[#634E3F]"
                >
                  {note}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3. Pricing & Add To Bag */}
        <div className="pt-4 mt-4 border-t border-[#E8DCCF]/60 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-lg font-bold text-[#1C140D]">
              ${effectivePrice.toFixed(2)}
            </span>
            {numericSalePrice && (
              <span className="text-xs text-[#634E3F] line-through">
                ${numericPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              isOutOfStock
                ? "bg-[#E8DCCF] text-[#634E3F] cursor-not-allowed"
                : isAdded
                ? "bg-[#D4A853] text-[#1C140D]"
                : "bg-[#1C140D] hover:bg-[#C45A3C] text-[#FAF7F2] shadow-xs hover:shadow-sm"
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Bag
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
