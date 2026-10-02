"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCartItems,
  selectIsCartOpen,
  selectCartSubtotal,
  selectCartTotalQuantity,
  setCartOpen,
  removeItem,
  updateQuantity,
} from "@/store/slices/cartSlice";
import { X, Plus, Minus, Trash2, ShoppingBag, Sparkles, ArrowRight } from "lucide-react";

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const isOpen = useAppSelector(selectIsCartOpen);
  const subtotal = useAppSelector(selectCartSubtotal);
  const totalQuantity = useAppSelector(selectCartTotalQuantity);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        dispatch(setCartOpen(false));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, dispatch]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const freeShippingThreshold = 100;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const potentialPoints = Math.floor(subtotal);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1C140D]/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => dispatch(setCartOpen(false))}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-[#FAF7F2] text-[#1C140D] shadow-2xl flex flex-col border-l border-[#E8DCCF]">
          {/* Header */}
          <div className="p-6 border-b border-[#E8DCCF] flex items-center justify-between bg-[#F5EDE4]">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-[#C45A3C]" />
              <h2 id="cart-title" className="font-serif text-2xl font-bold tracking-tight text-[#1C140D]">
                Artisanal Bag
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1C140D] text-[#F5EDE4] font-medium">
                {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => dispatch(setCartOpen(false))}
              className="p-2 text-[#634E3F] hover:text-[#1C140D] hover:bg-[#E8DCCF]/50 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3.5 bg-[#FAF7F2] border-b border-[#E8DCCF]">
            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
              {amountToFreeShipping > 0 ? (
                <span className="text-[#634E3F]">
                  Add <strong className="text-[#C45A3C]">${amountToFreeShipping.toFixed(2)}</strong> more for free shipping
                </span>
              ) : (
                <span className="text-[#C45A3C] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" /> Complimentary shipping unlocked!
                </span>
              )}
              <span className="text-[#634E3F]">{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="w-full bg-[#E8DCCF] h-2 rounded-full overflow-hidden">
              <div
                className="bg-linear-to-r from-[#C45A3C] to-[#D4A853] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#F5EDE4] flex items-center justify-center mb-4 text-[#634E3F]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1C140D] mb-1">Your bag is empty</h3>
                <p className="text-sm text-[#634E3F] max-w-xs mb-6">
                  Discover our single-origin chocolate bars, velvety truffles, and seasonal gift sets.
                </p>
                <button
                  type="button"
                  onClick={() => dispatch(setCartOpen(false))}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C45A3C] hover:bg-[#a8492e] text-[#FAF7F2] rounded-full text-sm font-semibold transition-colors shadow-sm"
                >
                  Explore Collection <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              items.map((item) => {
                const itemPrice = item.salePrice != null ? item.salePrice : item.price;
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3.5 rounded-xl bg-white border border-[#E8DCCF] shadow-2xs transition-shadow hover:shadow-xs"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#F5EDE4] shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#634E3F]">
                          <ShoppingBag className="w-6 h-6 opacity-40" />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-serif text-base font-bold text-[#1C140D] truncate">
                            {item.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => dispatch(removeItem(item.id))}
                            className="text-[#634E3F] hover:text-[#C45A3C] p-1 transition-colors"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          {item.selectedFlavor && (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-[#F5EDE4] text-[10px] font-bold text-[#C45A3C] border border-[#E8DCCF] uppercase tracking-wider">
                              Flavor: {item.selectedFlavor}
                            </span>
                          )}
                          {item.cacaoPercentage && (
                            <span className="text-[11px] font-medium text-[#634E3F] tracking-wide uppercase">
                              {item.cacaoPercentage}% Cacao
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Price */}
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-bold text-[#1C140D]">
                            ${itemPrice.toFixed(2)}
                          </span>
                          {item.salePrice != null && (
                            <span className="text-xs text-[#634E3F] line-through">
                              ${item.price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center border border-[#E8DCCF] rounded-lg bg-[#FAF7F2] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                            className="p-1.5 text-[#634E3F] hover:bg-[#E8DCCF]/50 hover:text-[#1C140D] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-[#1C140D]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                            className="p-1.5 text-[#634E3F] hover:bg-[#E8DCCF]/50 hover:text-[#1C140D] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#E8DCCF] bg-[#F5EDE4] space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm text-[#634E3F]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#1C140D]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-[#634E3F]">
                  <span>Estimated Shipping</span>
                  <span>{amountToFreeShipping === 0 ? "Complimentary" : "$15.00"}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#D4A853] pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5" /> Loyalty Reward
                  </span>
                  <span className="font-semibold">+{potentialPoints} Cocoa Points</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8DCCF]/70 flex items-center justify-between">
                <span className="font-serif text-lg font-bold text-[#1C140D]">Total</span>
                <span className="font-serif text-xl font-bold text-[#C45A3C]">
                  ${(subtotal + (amountToFreeShipping === 0 ? 0 : 15)).toFixed(2)}
                </span>
              </div>

              <Link
                href="/checkout"
                onClick={() => dispatch(setCartOpen(false))}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#C45A3C] hover:bg-[#a8492e] text-[#FAF7F2] rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/cart"
                onClick={() => dispatch(setCartOpen(false))}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-[#E8DCCF] bg-white hover:bg-[#FAF7F2] text-[#1C140D] rounded-xl font-medium text-xs tracking-wide transition-colors"
              >
                View Full Bag
              </Link>

              <button
                type="button"
                onClick={() => dispatch(setCartOpen(false))}
                className="w-full text-center text-xs text-[#634E3F] hover:text-[#1C140D] font-medium transition-colors"
              >
                Or continue shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
