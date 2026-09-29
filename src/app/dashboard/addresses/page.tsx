import React from "react";
import { redirect } from "next/navigation";
import { SessionService } from "@/lib/auth/session";
import { getUserAddressesAction } from "@/lib/actions/users";
import { AddressManager } from "@/components/dashboard/AddressManager";

export const metadata = {
  title: "Saved Addresses | ChocoBliss by Tasnim",
  description: "Manage your saved delivery destinations for insulated climate-controlled shipments.",
};

export default async function AddressesPage() {
  const user = await SessionService.getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/dashboard/addresses");
  }

  const result = await getUserAddressesAction();
  const addresses = result.success && result.data ? result.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#1C140D]">Shipping Destinations</h2>
        <p className="text-xs sm:text-sm text-[#634E3F]">
          Save and manage delivery locations for fast, insulated delivery across Dhaka metro and beyond.
        </p>
      </div>

      <AddressManager initialAddresses={addresses} />
    </div>
  );
}
