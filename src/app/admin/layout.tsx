import React from "react";
import { redirect } from "next/navigation";
import { AdminGuard } from "@/lib/auth/admin-guard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let adminUser;

  try {
    // 1. Strict Server-Side Authorization: Must have valid session & role === 'ADMIN'
    adminUser = await AdminGuard.verifyAdmin();
  } catch {
    redirect("/login?redirect=/admin&error=unauthorized");
  }

  // Count pending/processing orders for the sidebar notification pill
  let pendingOrdersCount = 0;
  try {
    pendingOrdersCount = await prisma.order.count({
      where: { status: { in: ["PENDING", "PROCESSING"] } },
    });
  } catch {
    // Graceful fallback
  }

  return (
    <div className="min-h-screen bg-[#F7F4F0] text-[#1C140D] flex flex-col lg:flex-row antialiased">
      {/* Executive Dark Left Sidebar */}
      <AdminSidebar ordersCount={pendingOrdersCount} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          user={{
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
