import React from "react";
import { redirect } from "next/navigation";
import { SessionService } from "@/lib/auth/session";
import { signOutAction } from "@/lib/actions/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { ShieldCheck, LogOut, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Customer Dashboard | ChocoBliss by Tasnim",
  description: "Manage your orders, Cocoa Points, saved shipping addresses, and artisanal wishlist.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await SessionService.getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const handleSignOut = async () => {
    "use server";
    await signOutAction();
    redirect("/login");
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C140D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Top Header Card */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1C140D] text-[#D4A853] border-2 border-[#D4A853]/40 flex items-center justify-center font-serif text-2xl font-bold uppercase shadow-inner">
              {user.name ? user.name[0] : user.email[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C140D]">
                  {user.name || "Valued Connoisseur"}
                </h1>
                {user.role === "ADMIN" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1C140D] text-[#D4A853] border border-[#D4A853]/30">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#634E3F] mt-0.5">
                {user.email} • Member of ChocoBliss Atelier
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1C140D] text-[#D4A853] hover:bg-[#C45A3C] hover:text-[#FAF7F2] transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin CMS</span>
              </Link>
            )}

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] text-xs font-bold text-[#1C140D]">
              <Sparkles className="w-4 h-4 text-[#D4A853]" />
              <span>{user.cocoaPoints} Cocoa Points</span>
            </div>

            <form action={handleSignOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#634E3F] border border-[#E8DCCF] hover:bg-[#F5EDE4] hover:text-[#1C140D] transition-colors"
                title="Sign out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>

        {/* Navigation Tabs */}
        <DashboardNav pointsCount={user.cocoaPoints} />

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
