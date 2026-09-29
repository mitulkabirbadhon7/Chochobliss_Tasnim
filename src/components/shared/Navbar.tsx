"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCartTotalQuantity, toggleCart } from "@/store/slices/cartSlice";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  clearUser,
} from "@/store/slices/userSlice";
import { signOutAction } from "@/lib/actions/auth";
import {
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const cartQuantity = useAppSelector(selectCartTotalQuantity);
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOutAction();
      dispatch(clearUser());
      setIsUserDropdownOpen(false);
      window.location.href = "/";
    } catch {
      // Graceful fallback
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Our Story", href: "/story" },
    { label: "Announcements", href: "/announcements" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* 1. Top Announcement Strip */}
      <div className="bg-[#1C140D] text-[#F5EDE4] text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-[#634E3F]/40">
        <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
        <span>Artisanal Single-Origin Chocolate • Free Delivery on Orders Over $100</span>
      </div>

      {/* 2. Main Navigation Bar */}
      <nav className="bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DCCF] transition-all duration-200">
        <div className="container-custom flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex flex-col group py-1">
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1C140D] group-hover:text-[#C45A3C] transition-colors leading-none">
              Chocobliss
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#634E3F] font-semibold mt-1">
              By Tasnim
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors py-1 border-b-2 ${
                    isActive
                      ? "text-[#C45A3C] border-[#C45A3C] font-semibold"
                      : "text-[#1C140D] border-transparent hover:text-[#C45A3C] hover:border-[#C45A3C]/40"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Admin Link (Only rendered as UI convenience when role is ADMIN) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1C140D] text-[#D4A853] hover:bg-[#C45A3C] hover:text-[#FAF7F2] transition-colors"
                title="Admin Control Panel"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin CMS
              </Link>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* User Account State */}
            {isAuthenticated && currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E8DCCF] bg-[#F5EDE4]/60 hover:bg-[#F5EDE4] text-[#1C140D] transition-colors"
                  aria-expanded={isUserDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-7 h-7 rounded-full bg-[#C45A3C] text-[#FAF7F2] flex items-center justify-center text-xs font-bold uppercase">
                    {currentUser.name ? currentUser.name[0] : currentUser.email[0]}
                  </div>
                  <span className="hidden sm:inline-block text-xs font-semibold max-w-[100px] truncate">
                    {currentUser.name?.split(" ")[0] || "Account"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#634E3F]" />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-[#E8DCCF] shadow-lg py-2 z-50 animate-in fade-in-50 zoom-in-95">
                    <div className="px-4 py-2.5 border-b border-[#E8DCCF]/60">
                      <p className="text-xs text-[#634E3F]">Signed in as</p>
                      <p className="text-sm font-bold text-[#1C140D] truncate">
                        {currentUser.email}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-[#D4A853] font-semibold">
                        <Sparkles className="w-3 h-3" />
                        <span>{currentUser.cocoaPoints} Cocoa Points</span>
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#1C140D] hover:bg-[#F5EDE4] transition-colors"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#634E3F]" />
                      Customer Dashboard
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#C45A3C] font-medium hover:bg-[#F5EDE4] transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <ShieldCheck className="w-4 h-4 text-[#C45A3C]" />
                        Admin Panel
                      </Link>
                    )}

                    <div className="border-t border-[#E8DCCF]/60 my-1" />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#C45A3C] hover:bg-[#F5EDE4] transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-[#C45A3C]" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#1C140D] hover:text-[#C45A3C] px-3 py-1.5 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => dispatch(toggleCart())}
              className="relative p-2.5 rounded-full text-[#1C140D] hover:bg-[#F5EDE4] hover:text-[#C45A3C] transition-colors"
              aria-label={`Open cart with ${cartQuantity} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartQuantity > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#C45A3C] text-[#FAF7F2] text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {cartQuantity > 99 ? "99+" : cartQuantity}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#1C140D] hover:bg-[#F5EDE4] transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 3. Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#E8DCCF] bg-[#FAF7F2] px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-base font-medium py-1.5 transition-colors ${
                      isActive ? "text-[#C45A3C] font-semibold" : "text-[#1C140D] hover:text-[#C45A3C]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-base font-semibold text-[#D4A853] bg-[#1C140D] px-4 py-2.5 rounded-xl transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-[#D4A853]" />
                  Admin CMS Panel
                </Link>
              )}
            </div>

            <div className="pt-4 border-t border-[#E8DCCF] flex flex-col gap-3">
              {!isAuthenticated && (
                <Link
                  href="/login"
                  className="w-full text-center py-2.5 px-4 rounded-xl border border-[#1C140D] text-[#1C140D] font-semibold text-sm hover:bg-[#1C140D] hover:text-[#FAF7F2] transition-colors"
                >
                  Sign In / Create Account
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
