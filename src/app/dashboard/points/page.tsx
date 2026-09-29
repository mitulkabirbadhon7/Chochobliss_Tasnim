import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SessionService } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  Sparkles,
  Award,
  Gift,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Clock,
} from "lucide-react";

export const metadata = {
  title: "Cocoa Points & Rewards | ChocoBliss by Tasnim",
  description: "View your Cocoa Points balance, tier rewards, and redemption history.",
};

export default async function CocoaPointsPage() {
  const user = await SessionService.getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/dashboard/points");
  }

  // Fetch orders involving points
  const pointsOrders = await prisma.order.findMany({
    where: {
      userId: user.id,
      OR: [
        { cocoaPointsEarned: { gt: 0 } },
        { cocoaPointsRedeemed: { gt: 0 } },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      cocoaPointsEarned: true,
      cocoaPointsRedeemed: true,
      createdAt: true,
    },
  });

  const points = user.cocoaPoints;
  let tier = {
    name: "Bronze Chocolatier",
    min: 0,
    max: 500,
    perk: "Earn 1 pt per ৳100 spent • Seasonal drop previews",
  };
  let progress = Math.min(100, Math.floor((points / 500) * 100));

  if (points >= 1500) {
    tier = {
      name: "Gold Grand Cru",
      min: 1500,
      max: 1500,
      perk: "Earn 2 pts per ৳100 • Complimentary shipping • Private batch reservations",
    };
    progress = 100;
  } else if (points >= 500) {
    tier = {
      name: "Silver Connoisseur",
      min: 500,
      max: 1500,
      perk: "Earn 1.5 pts per ৳100 • 24hr priority booking on limited drops",
    };
    progress = Math.min(100, Math.floor(((points - 500) / 1000) * 100));
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#1C140D]">
          Cocoa Points Loyalty Atelier
        </h2>
        <p className="text-xs sm:text-sm text-[#634E3F]">
          Our way of honoring your appreciation for artisanal bean-to-bar chocolate craftsmanship.
        </p>
      </div>

      {/* Main Loyalty Card */}
      <div className="bg-gradient-to-br from-[#1C140D] via-[#2A1E14] to-[#150E08] text-[#FAF7F2] rounded-3xl p-6 sm:p-10 shadow-xl border border-[#D4A853]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A853]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A853]/20 border border-[#D4A853]/40 text-[#D4A853] text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>Current Status: {tier.name}</span>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-serif font-bold text-[#FAF7F2]">
                {points}{" "}
                <span className="text-xl sm:text-2xl font-sans text-[#D4A853] font-normal">
                  Cocoa Points
                </span>
              </div>
              <p className="text-xs text-[#E8DCCF]/80 mt-1 max-w-lg">
                {tier.perk}
              </p>
            </div>

            {/* Progress to Next Tier */}
            {points < 1500 && (
              <div className="space-y-2 pt-2 max-w-md">
                <div className="flex justify-between text-xs text-[#E8DCCF]">
                  <span>Tier Progress</span>
                  <span>{tier.max - points} pts to {points < 500 ? "Silver" : "Gold"}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4A853] to-[#C45A3C] transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#FFFFFF]/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center space-y-3">
            <Gift className="w-8 h-8 text-[#D4A853] mx-auto" />
            <h4 className="font-serif text-base font-bold text-[#FAF7F2]">
              Redeem at Checkout
            </h4>
            <p className="text-xs text-[#E8DCCF]/70">
              Apply Cocoa Points directly at checkout to enjoy discounts or redeem complimentary bonbon boxes.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#D4A853] text-[#1C140D] font-bold text-xs hover:bg-[#FAF7F2] transition"
            >
              <span>Explore Boutique</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* How to Earn & Redeem Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8DCCF] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#C45A3C]/15 text-[#C45A3C] flex items-center justify-center font-bold text-sm">
            01
          </div>
          <h4 className="font-serif text-base font-bold text-[#1C140D]">
            Earn on Every Bar
          </h4>
          <p className="text-xs text-[#634E3F] leading-relaxed">
            Every ৳100 spent automatically credits 1 Cocoa Point to your balance when your order confirms.
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8DCCF] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4A853]/15 text-[#D4A853] flex items-center justify-center font-bold text-sm">
            02
          </div>
          <h4 className="font-serif text-base font-bold text-[#1C140D]">
            Unlock Grand Cru Status
          </h4>
          <p className="text-xs text-[#634E3F] leading-relaxed">
            Accumulate 500+ points to elevate into Silver Connoisseur and Gold tiers for accelerated reward rates.
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8DCCF] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
            03
          </div>
          <h4 className="font-serif text-base font-bold text-[#1C140D]">
            Instant Redemption
          </h4>
          <p className="text-xs text-[#634E3F] leading-relaxed">
            During checkout, toggle your points to redeem up to 50% discount against handcrafted confections.
          </p>
        </div>
      </div>

      {/* Points History */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] p-6 shadow-sm space-y-4">
        <h3 className="font-serif text-base font-bold text-[#1C140D] border-b border-[#E8DCCF] pb-3">
          Points Activity History
        </h3>

        {pointsOrders.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#634E3F]">
            No points activity recorded yet. Place an order to start accumulating points!
          </div>
        ) : (
          <div className="divide-y divide-[#E8DCCF]/60">
            {pointsOrders.map((ord) => (
              <div
                key={ord.id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-mono font-bold text-[#1C140D] block">
                    Order {ord.orderNumber}
                  </span>
                  <span className="text-[#634E3F]">
                    {new Date(ord.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {ord.cocoaPointsEarned > 0 && (
                    <span className="font-bold text-emerald-700">
                      +{ord.cocoaPointsEarned} pts earned
                    </span>
                  )}
                  {ord.cocoaPointsRedeemed > 0 && (
                    <span className="font-bold text-[#C45A3C]">
                      -{ord.cocoaPointsRedeemed} pts redeemed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
