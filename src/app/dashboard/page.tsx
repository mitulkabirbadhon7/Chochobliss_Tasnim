import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SessionService } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { maskPhone, maskEmail, maskStreet } from "@/lib/utils/masking";
import {
  ShoppingBag,
  Heart,
  MapPin,
  Sparkles,
  ArrowRight,
  Clock,
  PackageCheck,
  ChevronRight,
} from "lucide-react";

export default async function DashboardOverviewPage() {
  const user = await SessionService.getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  // Fetch recent orders
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { items: true },
  });

  const totalOrdersCount = await prisma.order.count({
    where: { userId: user.id },
  });

  // Fetch wishlist count and sample items
  const wishlistItems = await prisma.wishlistItem.findMany({
    where: {
      userId: user.id,
      product: { deletedAt: null, isPublished: true },
    },
    take: 3,
    include: { product: true },
  });

  const totalWishlistCount = await prisma.wishlistItem.count({
    where: {
      userId: user.id,
      product: { deletedAt: null, isPublished: true },
    },
  });

  // Fetch addresses count
  const addressesCount = await prisma.address.count({
    where: { userId: user.id },
  });

  // Loyalty Tier Calculation
  let tierName = "Bronze Chocolatier";
  let nextTierPoints = 500;
  if (user.cocoaPoints >= 1500) {
    tierName = "Gold Grand Cru";
    nextTierPoints = 1500;
  } else if (user.cocoaPoints >= 500) {
    tierName = "Silver Connoisseur";
    nextTierPoints = 1500;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SHIPPED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PROCESSING":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Cocoa Points */}
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8DCCF] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider text-[#634E3F] font-bold">
              Cocoa Points
            </span>
            <div className="w-8 h-8 rounded-full bg-[#D4A853]/15 text-[#D4A853] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#1C140D]">
              {user.cocoaPoints} <span className="text-sm font-sans font-normal text-[#634E3F]">pts</span>
            </div>
            <div className="text-xs text-[#D4A853] font-semibold mt-1">
              Tier: {tierName}
            </div>
          </div>
          <Link
            href="/dashboard/points"
            className="mt-4 pt-3 border-t border-[#E8DCCF]/60 text-xs font-semibold text-[#C45A3C] hover:underline flex items-center gap-1"
          >
            <span>Points benefits</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Orders */}
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8DCCF] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider text-[#634E3F] font-bold">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-full bg-[#C45A3C]/15 text-[#C45A3C] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#1C140D]">
              {totalOrdersCount}
            </div>
            <div className="text-xs text-[#634E3F] mt-1">
              {orders.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED").length} active in progress
            </div>
          </div>
          <Link
            href="/dashboard/orders"
            className="mt-4 pt-3 border-t border-[#E8DCCF]/60 text-xs font-semibold text-[#C45A3C] hover:underline flex items-center gap-1"
          >
            <span>View order history</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Wishlist */}
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8DCCF] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider text-[#634E3F] font-bold">
              Artisanal Wishlist
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#1C140D]">
              {totalWishlistCount} <span className="text-sm font-sans font-normal text-[#634E3F]">creations</span>
            </div>
            <div className="text-xs text-[#634E3F] mt-1">
              Saved for your next collection
            </div>
          </div>
          <Link
            href="/dashboard/wishlist"
            className="mt-4 pt-3 border-t border-[#E8DCCF]/60 text-xs font-semibold text-[#C45A3C] hover:underline flex items-center gap-1"
          >
            <span>Open wishlist</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Saved Addresses */}
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8DCCF] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider text-[#634E3F] font-bold">
              Shipping Destinations
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#1C140D]">
              {addressesCount} <span className="text-sm font-sans font-normal text-[#634E3F]">saved</span>
            </div>
            <div className="text-xs text-[#634E3F] mt-1">
              Climate-controlled delivery addresses
            </div>
          </div>
          <Link
            href="/dashboard/addresses"
            className="mt-4 pt-3 border-t border-[#E8DCCF]/60 text-xs font-semibold text-[#C45A3C] hover:underline flex items-center gap-1"
          >
            <span>Manage addresses</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 2. Recent Orders & Wishlist Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders List (Span 2) */}
        <div className="lg:col-span-2 bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-4">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-[#C45A3C]" />
              <h2 className="font-serif text-lg font-bold text-[#1C140D]">
                Recent Orders
              </h2>
            </div>
            <Link
              href="/dashboard/orders"
              className="text-xs font-semibold text-[#C45A3C] hover:underline flex items-center gap-1"
            >
              <span>See all ({totalOrdersCount})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#634E3F] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#1C140D]">
                No orders placed yet
              </h3>
              <p className="text-xs text-[#634E3F] max-w-sm mx-auto">
                Indulge in freshly conched single-origin bars or artisanal truffle selections from our boutique.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#1C140D] text-[#FAF7F2] text-xs font-semibold hover:bg-[#C45A3C] transition-colors"
              >
                <span>Discover Creations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2]/40 hover:bg-[#FAF7F2] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-[#1C140D]">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#634E3F]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#C45A3C]" />
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span>•</span>
                      <span>{order.items.length} items</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E8DCCF]">
                    <div className="text-right">
                      <span className="text-xs text-[#634E3F] block">Total</span>
                      <span className="font-serif text-sm font-bold text-[#1C140D]">
                        ৳{Number(order.totalAmount).toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="px-3.5 py-1.5 rounded-lg border border-[#E8DCCF] bg-[#FFFFFF] hover:bg-[#1C140D] hover:text-[#FAF7F2] text-xs font-semibold transition"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Details & Masked Info (Span 1) */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] p-6 shadow-sm space-y-6">
          <div className="border-b border-[#E8DCCF] pb-4">
            <h2 className="font-serif text-lg font-bold text-[#1C140D]">
              Account Profile
            </h2>
            <p className="text-xs text-[#634E3F]">Personal information & security</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[#634E3F] font-medium block">Full Name</span>
              <span className="font-semibold text-[#1C140D] text-sm mt-0.5 block">
                {user.name || "Valued Customer"}
              </span>
            </div>

            <div>
              <span className="text-[#634E3F] font-medium block">Email Address (Masked)</span>
              <span className="font-mono text-[#1C140D] mt-0.5 block">
                {maskEmail(user.email)}
              </span>
            </div>

            <div>
              <span className="text-[#634E3F] font-medium block">Phone Number (Masked)</span>
              <span className="font-mono text-[#1C140D] mt-0.5 block">
                {maskPhone(user.phone)}
              </span>
            </div>

            <div className="pt-2">
              <span className="text-[#634E3F] font-medium block">Membership Tier</span>
              <div className="mt-1 flex items-center gap-1.5 text-[#D4A853] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{tierName}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8DCCF]">
            <Link
              href="/dashboard/addresses"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] text-xs font-semibold text-[#1C140D] hover:bg-[#F5EDE4] transition"
            >
              <MapPin className="w-3.5 h-3.5 text-[#C45A3C]" />
              <span>Manage Saved Addresses</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
