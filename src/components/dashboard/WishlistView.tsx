"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch } from "@/store/hooks";
import { addItem, setCartOpen } from "@/store/slices/cartSlice";
import { removeFromWishlistAction, type WishlistItemDetail } from "@/lib/actions/wishlist";
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, Check } from "lucide-react";

interface WishlistViewProps {
  initialItems: WishlistItemDetail[];
}

export function WishlistView({ initialItems }: WishlistViewProps) {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<WishlistItemDetail[]>(initialItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleRemove = async (wishlistId: string) => {
    setLoadingId(wishlistId);
    try {
      const res = await removeFromWishlistAction(wishlistId);
      if (res.success) {
        setItems((prev) => prev.filter((item) => item.id !== wishlistId));
      }
    } catch {
      // ignore
    } finally {
      setLoadingId(null);
    }
  };

  const handleAddToCart = (item: WishlistItemDetail) => {
    dispatch(
      addItem({
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        salePrice: item.product.salePrice,
        image: item.product.images?.[0] || "/images/categories/bars.jpg",
        quantity: 1,
        cacaoPercentage: item.product.cacaoPercentage,
      })
    );
    dispatch(setCartOpen(true));
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] p-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <Heart className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-[#1C140D]">Your Wishlist is Empty</h3>
          <p className="text-xs text-[#634E3F] max-w-sm mx-auto mt-1">
            Save limited-edition reserves, bonbon boxes, and seasonal tablets to keep track of your desires.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C140D] text-[#FAF7F2] text-xs font-semibold hover:bg-[#C45A3C] transition shadow-md"
        >
          <span>Explore The Boutique</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#634E3F]">
          Showing {items.length} saved {items.length === 1 ? "creation" : "creations"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const isOutOfStock = item.product.inventory <= 0;
          const displayPrice = item.product.salePrice ?? item.product.price;
          const isAdded = addedIds[item.id];

          return (
            <div
              key={item.id}
              className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] overflow-hidden shadow-sm flex flex-col group hover:border-[#D4A853]/60 transition"
            >
              {/* Product Image */}
              <div className="relative aspect-square w-full bg-[#FAF7F2] overflow-hidden">
                <Link href={`/shop/${item.product.slug}`} className="block w-full h-full">
                  <Image
                    src={item.product.images?.[0] || "/images/categories/bars.jpg"}
                    alt={item.product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                {item.product.cacaoPercentage && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#1C140D]/85 backdrop-blur-sm text-[#D4A853] text-[10px] font-bold">
                    {item.product.cacaoPercentage}% Cacao
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  disabled={loadingId === item.id}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-[#634E3F] hover:text-rose-600 hover:bg-white transition shadow-sm"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Product Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4A853]">
                    {item.product.category}
                  </span>
                  <Link href={`/shop/${item.product.slug}`} className="block">
                    <h4 className="font-serif text-base font-bold text-[#1C140D] group-hover:text-[#C45A3C] transition line-clamp-1 mt-0.5">
                      {item.product.name}
                    </h4>
                  </Link>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E8DCCF]/60">
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-lg font-bold text-[#1C140D]">
                        ৳{displayPrice.toLocaleString()}
                      </span>
                      {item.product.salePrice != null && (
                        <span className="text-xs text-[#634E3F]/60 line-through">
                          ৳{item.product.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#634E3F] block">
                      {isOutOfStock ? (
                        <span className="text-rose-600 font-bold">Currently Sold Out</span>
                      ) : (
                        <span className="text-emerald-700 font-medium">In Stock</span>
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    disabled={isOutOfStock}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                      isOutOfStock
                        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                        : isAdded
                        ? "bg-emerald-600 text-white"
                        : "bg-[#1C140D] hover:bg-[#C45A3C] text-[#FAF7F2]"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
