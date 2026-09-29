import React from "react";
import { redirect } from "next/navigation";
import { SessionService } from "@/lib/auth/session";
import { getWishlistAction } from "@/lib/actions/wishlist";
import { WishlistView } from "@/components/dashboard/WishlistView";

export const metadata = {
  title: "My Wishlist | ChocoBliss by Tasnim",
  description: "View and manage your saved artisanal chocolate creations and seasonal reserve bars.",
};

export default async function WishlistPage() {
  const user = await SessionService.getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/dashboard/wishlist");
  }

  const result = await getWishlistAction();
  const items = result.success && result.data ? result.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#1C140D]">My Artisanal Wishlist</h2>
        <p className="text-xs sm:text-sm text-[#634E3F]">
          Curate your favorite single-origin bars and bonbon boxes for your next tasting order.
        </p>
      </div>

      <WishlistView initialItems={items} />
    </div>
  );
}
