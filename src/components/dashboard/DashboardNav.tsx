"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  MapPin,
  Sparkles,
  User as UserIcon,
} from "lucide-react";

interface DashboardNavProps {
  pointsCount: number;
}

export function DashboardNav({ pointsCount }: DashboardNavProps) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/orders", label: "My Orders", icon: ShoppingBag },
    { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
    { href: "/dashboard/addresses", label: "Saved Addresses", icon: MapPin },
    {
      href: "/dashboard/points",
      label: "Cocoa Points",
      icon: Sparkles,
      badge: `${pointsCount} pts`,
    },
  ];

  return (
    <nav className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#E8DCCF]">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = link.exact
          ? pathname === link.href
          : Boolean(pathname?.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              isActive
                ? "bg-[#1C140D] text-[#FAF7F2] shadow-sm font-semibold"
                : "text-[#634E3F] hover:bg-[#F5EDE4] hover:text-[#1C140D]"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-[#D4A853]" : "text-[#634E3F]"}`} />
            <span>{link.label}</span>
            {link.badge && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive
                    ? "bg-[#D4A853] text-[#1C140D]"
                    : "bg-[#D4A853]/20 text-[#1C140D]"
                }`}
              >
                {link.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
