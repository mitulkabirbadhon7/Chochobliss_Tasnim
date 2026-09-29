"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Megaphone,
  Users,
  Layers,
  ArrowUpRight,
  Menu,
  X,
  Radio,
} from "lucide-react";

interface AdminSidebarProps {
  ordersCount?: number;
}

export function AdminSidebar({ ordersCount = 12 }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: Package,
      exact: false,
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      badge: ordersCount > 0 ? ordersCount : undefined,
      exact: false,
    },
    {
      label: "Announcements & Offers",
      href: "/admin/announcements",
      icon: Megaphone,
      exact: false,
    },
    {
      label: "Customers",
      href: "/admin/customers",
      icon: Users,
      exact: false,
    },
    {
      label: "Site Content & Media",
      href: "/admin/cms",
      icon: Layers,
      exact: false,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1C140D] text-[#F5EDE4] p-5 justify-between select-none">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-[#634E3F]/40">
          <div className="w-10 h-10 rounded-lg bg-[#C45A3C] flex items-center justify-center font-serif text-2xl font-bold text-white shadow-md">
            C
          </div>
          <div>
            <div className="font-serif text-xl font-bold tracking-tight text-white leading-none">
              Chocobliss
            </div>
            <div className="text-[9px] uppercase tracking-[0.25em] text-[#D4A853] font-semibold mt-1">
              BY TASNIM
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5" aria-label="Admin Navigation">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#C45A3C] text-white shadow-sm font-semibold"
                    : "text-[#E8DCCF]/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-white" : "text-[#E8DCCF]/70"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? "bg-white text-[#C45A3C]"
                        : "bg-[#2D2117] text-[#D4A853] border border-[#634E3F]/50"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Store Status Card */}
      <div className="bg-[#2D2117]/80 rounded-2xl p-4 border border-[#634E3F]/40 shadow-inner">
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-white tracking-wide">
            Store is live
          </span>
        </div>
        <p className="font-serif italic text-xs text-[#E8DCCF]/70 mb-3 leading-relaxed">
          From our heart to yours.
        </p>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#D4A853] hover:text-white transition-colors group"
        >
          <span>View storefront</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header Toggle */}
      <div className="lg:hidden flex items-center justify-between bg-[#1C140D] text-white px-4 py-3 border-b border-[#634E3F]/40 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#C45A3C] flex items-center justify-center font-serif text-lg font-bold text-white">
            C
          </div>
          <span className="font-serif text-lg font-bold">Chocobliss Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-72 max-w-full z-50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 border-r border-[#634E3F]/40">
        {sidebarContent}
      </aside>
    </>
  );
}
