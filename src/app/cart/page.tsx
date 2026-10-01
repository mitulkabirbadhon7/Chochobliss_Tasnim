"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartTotalQuantity,
  removeItem,
  updateQuantity,
  clearCart,
} from "@/store/slices/cartSlice";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const totalQuantity = useAppSelector(selectCartTotalQuantity);

  const freeShippingThreshold = 100;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 15;
  const potentialPoints = Math.floor(subtotal);

  return (
    <main className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#634E3F] mb-6">
          <Link href="/" className="hover:text-[#1C140D] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#1C140D] transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-[#1C140D] font-semibold">Artisanal Bag</span>
        </div>

        <div className="flex items-center justify-between pb-6 border-b border-[#E8DCCF] mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C140D] tracking-tight">
              Your Artisanal Bag
            </h1>
            <p className="text-sm text-[#634E3F] mt-1">
              Review your handcrafted selection before proceeding to secure checkout.
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => dispatch(clearCart())}
              className="text-xs text-[#634E3F] hover:text-rose-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8DCCF] bg-white hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear bag
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 sm:p-16 border border-[#E8DCCF] shadow-sm text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#F5EDE4] flex items-center justify-center mx-auto mb-6 text-[#C45A3C]">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1C140D] mb-2">
              Your bag is presently empty
            </h2>
            <p className="text-sm text-[#634E3F] max-w-md mx-auto mb-8 leading-relaxed">
              Explore our single-origin dark chocolate tablets, artisanal bonbons, and celebratory seasonal gift boxes curated with rare terroirs.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C45A3C] hover:bg-[#a8492e] text-[#FAF7F2] rounded-full text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg"
            >
              Explore Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Bag Items (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Tracker */}
              <div className="bg-white p-5 rounded-2xl border border-[#E8DCCF] shadow-xs">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  {amountToFreeShipping > 0 ? (
                    <span className="text-[#634E3F] flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#C45A3C]" />
                      Add <strong className="text-[#C45A3C]">${amountToFreeShipping.toFixed(2)}</strong> more to receive complimentary delivery
                    </span>
                  ) : (
                    <span className="text-emerald-700 flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-4 h-4 text-[#D4A853]" />
                      You have unlocked complimentary nationwide delivery!
                    </span>
                  )}
                  <span className="text-[#1C140D] font-mono">{Math.round(progressToFreeShipping)}%</span>
                </div>
                <div className="w-full bg-[#E8DCCF] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-linear-to-r from-[#C45A3C] to-[#D4A853] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div className="bg-white rounded-2xl border border-[#E8DCCF] shadow-xs divide-y divide-[#E8DCCF]">
                {items.map((item) => {
                  const effectivePrice = item.salePrice != null ? item.salePrice : item.price;
                  const itemTotal = effectivePrice * item.quantity;

                  return (
                    <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                      {/* Image Thumbnail */}
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-[#F5EDE4] shrink-0 border border-[#E8DCCF]/60">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#634E3F]">
                            <ShoppingBag className="w-8 h-8 opacity-40" />
                          </div>
                        )}
                      </div>

                      {/* Info & Metadata */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-serif text-lg font-bold text-[#1C140D]">
                              {item.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {item.selectedFlavor && (
                                <span className="inline-block text-[11px] font-bold tracking-wider text-[#C45A3C] uppercase bg-[#C45A3C]/10 px-2 py-0.5 rounded-md">
                                  Flavor: {item.selectedFlavor}
                                </span>
                              )}
                              {item.cacaoPercentage && (
                                <span className="inline-block text-[11px] font-semibold tracking-wider text-[#634E3F] uppercase bg-[#E8DCCF]/50 px-2 py-0.5 rounded-md">
                                  {item.cacaoPercentage}% Cacao
                                </span>
                              )}
                              <span className="text-xs text-[#634E3F]">
                                Unit: ${effectivePrice.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => dispatch(removeItem(item.id))}
                            className="text-[#634E3F] hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Quantity and Subtotal Row */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-[#E8DCCF] rounded-xl bg-[#FAF7F2] p-0.5">
                            <button
                              type="button"
                              onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                              className="p-1.5 text-[#634E3F] hover:text-[#1C140D] hover:bg-[#E8DCCF]/50 rounded-lg transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center text-xs font-bold text-[#1C140D]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                              className="p-1.5 text-[#634E3F] hover:text-[#1C140D] hover:bg-[#E8DCCF]/50 rounded-lg transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="font-serif text-lg font-bold text-[#1C140D]">
                              ${itemTotal.toFixed(2)}
                            </div>
                            {item.salePrice != null && (
                              <div className="text-xs text-[#634E3F] line-through">
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Back */}
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#634E3F] hover:text-[#1C140D] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Continue browsing boutique
                </Link>
              </div>
            </div>

            {/* Order Summary & Proceed (4 Cols) */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8DCCF] shadow-sm sticky top-24 space-y-6">
                <h2 className="font-serif text-xl font-bold text-[#1C140D] pb-3 border-b border-[#E8DCCF]">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-[#634E3F]">
                    <span>Items ({totalQuantity})</span>
                    <span className="font-semibold text-[#1C140D]">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#634E3F]">
                    <span>Estimated Shipping</span>
                    <span className="font-semibold text-[#1C140D]">
                      {shippingFee === 0 ? (
                        <span className="text-emerald-700 font-bold">Complimentary</span>
                      ) : (
                        `$${shippingFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#D4A853] pt-1">
                    <span className="flex items-center gap-1 font-semibold">
                      <Sparkles className="w-3.5 h-3.5" /> Loyalty Reward
                    </span>
                    <span className="font-bold">+{potentialPoints} Cocoa Points</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E8DCCF] flex items-baseline justify-between">
                  <div>
                    <span className="font-serif text-lg font-bold text-[#1C140D]">Total</span>
                    <span className="text-[11px] text-[#634E3F] block">Taxes included</span>
                  </div>
                  <div className="font-serif text-2xl font-bold text-[#C45A3C]">
                    ${(subtotal + shippingFee).toFixed(2)}
                  </div>
                </div>

                {/* Direct Checkout CTA */}
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[#C45A3C] hover:bg-[#a8492e] text-[#FAF7F2] rounded-2xl font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-[#E8DCCF]/70 grid grid-cols-2 gap-3 text-[11px] text-[#634E3F]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C45A3C] shrink-0" />
                    <span>256-Bit SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#D4A853] shrink-0" />
                    <span>Quality Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
