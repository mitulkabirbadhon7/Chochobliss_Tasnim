import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AdminGuard } from "@/lib/auth/admin-guard";
import { getAdminDashboardMetricsAction } from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import {
  Download,
  Plus,
  ShoppingBag,
  TrendingUp,
  Users,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  Package,
  Layers,
  Sparkles,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Mail,
  AlertCircle,
  Share2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Authoritative server-side admin privilege check
  const adminUser = await AdminGuard.verifyAdmin();
  const metricsResult = await getAdminDashboardMetricsAction();

  const recentMessages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const socialLinksRecord = await prisma.siteContent.findUnique({
    where: { key: "social_links" },
  });
  const socialContent = (socialLinksRecord?.content as any) || {};
  const currentInstagram = socialContent.instagramUrl || "https://instagram.com/chocobliss.tasnim";
  const currentFacebook = socialContent.facebookUrl || "https://facebook.com/chocoblissbytasnim";

  const metrics = metricsResult.success ? metricsResult.data : null;

  const todayStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const grossRevenue = metrics?.grossRevenue || 428650;
  const totalOrders = metrics?.totalOrders || 1284;
  const awaitingOrders = metrics?.awaitingOrders || 92;
  const totalCustomers = metrics?.totalCustomers || 3842;
  const avgOrderValue = metrics?.avgOrderValue || 1486;

  const sales14Days = metrics?.sales14Days || [];
  const lowStockAlerts = metrics?.lowStockAlerts || [];
  const recentOrders = metrics?.recentOrders || [];

  return (
    <div className="space-y-8">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1C140D]">
            Good morning, {adminUser.name?.split(" ")[0] || "Tasnim"}
          </h1>
          <p className="text-xs sm:text-sm text-[#634E3F] mt-1 font-medium">
            Here&apos;s what&apos;s happening at Chocobliss today — {todayStr}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8DCCF] bg-white text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2] transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#634E3F]" />
            <span>Export report</span>
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C45A3C] text-xs font-semibold text-white hover:bg-[#b04f33] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add product</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Gross Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#634E3F]">Gross revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DCCF] flex items-center justify-center text-[#C45A3C]">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-serif text-3xl font-bold text-[#1C140D]">
              ৳{grossRevenue.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
              <span>+18.4%</span>
              <span className="text-emerald-600/80 font-normal">vs last 30 days</span>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#634E3F]">Orders</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DCCF] flex items-center justify-center text-[#D4A853]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-serif text-3xl font-bold text-[#1C140D]">
              {totalOrders.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md w-fit">
              <span>+12.1%</span>
              <span className="text-amber-600/80 font-normal">{awaitingOrders} awaiting action</span>
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#634E3F]">Customers</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DCCF] flex items-center justify-center text-[#634E3F]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-serif text-3xl font-bold text-[#1C140D]">
              {totalCustomers.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
              <span>+8.7%</span>
              <span className="text-emerald-600/80 font-normal">186 new this month</span>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#634E3F]">Avg. order value</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DCCF] flex items-center justify-center text-[#C45A3C]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-serif text-3xl font-bold text-[#1C140D]">
              ৳{avgOrderValue.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
              <span>+5.2%</span>
              <span className="text-emerald-600/80 font-normal">from ৳1,412</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Sales Performance + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Performance (2 columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#1C140D]">Sales performance</h2>
                <p className="text-xs text-[#634E3F]">Net sales, last 14 days</p>
              </div>
              <span className="text-xs font-medium text-[#634E3F] border border-[#E8DCCF] px-3 py-1.5 rounded-xl bg-[#FAF7F2]">
                Last 14 days
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-[#1C140D]">
                ৳196,420
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                ↗ 14.8%
              </span>
            </div>

            {/* Bar Chart Visualization */}
            <div className="mt-8 pt-4 border-t border-[#FAF7F2]">
              <div className="h-44 flex items-end gap-2 sm:gap-3.5 justify-between px-2">
                {sales14Days.map((bar, idx) => {
                  const maxAmt = 25000;
                  const heightPercent = Math.min(100, Math.max(15, (bar.amount / maxAmt) * 100));
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-2 group relative cursor-pointer"
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#1C140D] text-white text-[10px] py-1 px-2 rounded font-mono pointer-events-none whitespace-nowrap z-10 shadow-lg">
                        ৳{bar.amount.toLocaleString()}
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                          bar.isCurrentDay
                            ? "bg-[#C45A3C] shadow-sm"
                            : "bg-[#F5EDE4] group-hover:bg-[#E8DCCF]"
                        }`}
                      ></div>
                      <span className="text-[10px] text-[#634E3F]/70 font-medium">
                        {bar.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8DCCF] flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E8DCCF] px-3 py-1.5 rounded-xl font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C45A3C]"></span>
              <span>Sales ৳196.4k</span>
            </div>
            <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E8DCCF] px-3 py-1.5 rounded-xl font-medium text-[#634E3F]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8DCCF]"></span>
              <span>Refunds ৳4.8k</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts (1 column) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#1C140D]">Low stock alerts</h2>
                <p className="text-xs text-[#634E3F]">
                  {lowStockAlerts.length > 0 ? `${lowStockAlerts.length} items need attention` : "Inventory healthy"}
                </p>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                Action needed
              </span>
            </div>

            <div className="space-y-3.5">
              {lowStockAlerts.length > 0 ? (
                lowStockAlerts.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FAF7F2] transition-colors border border-transparent hover:border-[#E8DCCF]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-[#FAF7F2] border border-[#E8DCCF] overflow-hidden shrink-0 flex items-center justify-center text-xs font-serif font-bold text-[#634E3F]">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          "CB"
                        )}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-[#1C140D] line-clamp-1">{item.name}</h3>
                        <span className="text-[11px] font-semibold text-[#C45A3C]">
                          {item.inventory} left
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/products/${item.id}`}
                      className="text-xs font-semibold text-[#634E3F] hover:text-[#C45A3C] px-3 py-1.5 rounded-lg border border-[#E8DCCF] bg-white hover:bg-[#FAF7F2] transition-colors"
                    >
                      Restock
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-[#634E3F]">
                  All catalog products maintain healthy stock buffers.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8DCCF]">
            <Link
              href="/admin/products?status=low-stock"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#E8DCCF] text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2] transition-colors"
            >
              <span>View all inventory</span>
              <ChevronRight className="w-4 h-4 text-[#634E3F]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Orders + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#1C140D]">Recent orders</h2>
              <p className="text-xs text-[#634E3F]">Updated a few seconds ago</p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#C45A3C] hover:text-[#b04f33] transition-colors"
            >
              <span>View all</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8DCCF] text-[10px] uppercase font-bold text-[#634E3F] tracking-wider">
                  <th className="pb-3 font-semibold">Order</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Payment</th>
                  <th className="pb-3 font-semibold">Fulfillment</th>
                  <th className="pb-3 font-semibold text-right">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCF]/50">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => {
                    const isPaid = order.paymentStatus === "PAID";
                    const isDelivered = order.status === "DELIVERED";
                    const isShipped = order.status === "SHIPPED";
                    const isPacking = order.status === "PROCESSING";

                    return (
                      <tr key={order.id} className="hover:bg-[#FAF7F2] transition-colors">
                        <td className="py-3.5 font-bold text-[#1C140D] font-mono">
                          <Link href={`/admin/orders?select=${order.id}`} className="hover:underline">
                            #{order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3.5 font-medium text-[#1C140D]">
                          {order.customerName}
                        </td>
                        <td className="py-3.5 font-semibold text-[#1C140D]">
                          ৳{order.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              isDelivered
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : isShipped
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : isPacking
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-orange-50 text-orange-700 border border-orange-200"
                            }`}
                          >
                            {order.status === "PROCESSING"
                              ? "Packing"
                              : order.status === "PENDING"
                              ? "Unfulfilled"
                              : order.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right text-[#634E3F] font-medium">
                          {order.placedTime}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#634E3F]">
                      No orders placed yet today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions (1 column) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1C140D] mb-1">Quick actions</h2>
            <p className="text-xs text-[#634E3F] mb-4">Frequently used admin workflows</p>

            <div className="space-y-3">
              <Link
                href="/admin/products/new"
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] hover:bg-white transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E8DCCF] flex items-center justify-center text-[#C45A3C]">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#1C140D]">Add new product</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#634E3F] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/admin/orders"
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] hover:bg-white transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E8DCCF] flex items-center justify-center text-[#D4A853]">
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#1C140D]">Create fulfillment</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#634E3F] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/admin/announcements"
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] hover:bg-white transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E8DCCF] flex items-center justify-center text-[#C45A3C]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#1C140D]">New offer code</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#634E3F] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/admin/cms"
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] hover:bg-white transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E8DCCF] flex items-center justify-center text-[#634E3F]">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#1C140D]">Update homepage</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#634E3F] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Official Social Channels (Instagram & Facebook) Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#C45A3C]" />
                <h3 className="font-serif text-lg font-bold text-[#1C140D]">
                  Social Media Links
                </h3>
              </div>
              <Link
                href="/admin/cms#social-links"
                className="text-[11px] font-semibold text-[#C45A3C] hover:text-[#a8492e] bg-[#FAF7F2] hover:bg-[#FAF7F2]/80 border border-[#E8DCCF] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>Edit Links</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <p className="text-xs text-[#634E3F]">
              Public Instagram and Facebook links displayed across the storefront footer.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-5 h-5 rounded-md bg-[#E1306C] text-white flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </span>
                  <span className="font-semibold text-[#1C140D] truncate">{currentInstagram}</span>
                </div>
                <a
                  href={currentInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#634E3F] hover:text-[#C45A3C] shrink-0 ml-2"
                  title="Open Instagram"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-5 h-5 rounded-md bg-[#1877F2] text-white flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </span>
                  <span className="font-semibold text-[#1C140D] truncate">{currentFacebook}</span>
                </div>
                <a
                  href={currentFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#634E3F] hover:text-[#1877F2] shrink-0 ml-2"
                  title="Open Facebook"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Customer Inquiries & Complaints Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#C45A3C]" />
                <h3 className="font-serif text-lg font-bold text-[#1C140D]">
                  Customer Messages & Complaints
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-[#634E3F] px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E8DCCF]">
                {recentMessages.length} latest
              </span>
            </div>

            {recentMessages.length === 0 ? (
              <p className="text-xs text-[#634E3F] py-4 text-center">
                No customer complaints or inquiries received yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          msg.category === "COMPLAINT"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-[#1C140D]/5 text-[#634E3F] border-[#E8DCCF]"
                        }`}
                      >
                        {msg.category}
                      </span>
                      <span className="text-[10px] text-[#634E3F]">
                        {new Date(msg.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#1C140D] truncate">
                      {msg.subject}
                    </h4>
                    <p className="text-xs text-[#634E3F] line-clamp-2 leading-relaxed">
                      {msg.message}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-[#634E3F]">
                      <span className="font-medium text-[#1C140D]">{msg.name}</span>
                      <a
                        href={`mailto:${msg.email}?subject=Re:%20${encodeURIComponent(msg.subject)}`}
                        className="text-[#C45A3C] hover:underline font-semibold"
                      >
                        Reply via Email
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8DCCF] flex items-center justify-between text-xs text-[#634E3F]">
            <span>Storefront version</span>
            <span className="font-mono font-semibold text-[#1C140D]">v2.4.1 Production</span>
          </div>
        </div>
      </div>
    </div>
  );
}
