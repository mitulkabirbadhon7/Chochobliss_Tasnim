"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  LogOut,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";

interface AdminHeaderProps {
  user: {
    email: string;
    name?: string | null;
    role: string;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSignOut = async () => {
    await signOutAction();
    window.location.href = "/login";
  };

  const displayName = user.name || "Tasnim B.";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-[#E8DCCF] px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#634E3F]/60 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders, products or customers..."
            className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl pl-10 pr-12 py-2 text-xs text-[#1C140D] placeholder-[#634E3F]/60 focus:outline-none focus:ring-2 focus:ring-[#C45A3C] focus:bg-white transition-all shadow-sm"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[#634E3F]/70 bg-white border border-[#E8DCCF] rounded absolute right-3 pointer-events-none shadow-xs">
            ⌘ K
          </kbd>
        </div>
      </form>

      {/* Action Icons & User Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          title="Admin Help & Documentation"
          className="w-9 h-9 rounded-xl border border-[#E8DCCF] bg-white text-[#634E3F] hover:bg-[#FAF7F2] flex items-center justify-center transition-colors shadow-xs"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="Notifications"
          className="w-9 h-9 rounded-xl border border-[#E8DCCF] bg-white text-[#634E3F] hover:bg-[#FAF7F2] flex items-center justify-center relative transition-colors shadow-xs"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#C45A3C] absolute top-2 right-2 border-2 border-white"></span>
        </button>

        {/* User Pill / Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1 sm:pr-3 rounded-xl border border-[#E8DCCF] bg-white hover:bg-[#FAF7F2] transition-colors shadow-xs"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-lg bg-[#E8DCCF] text-[#1C140D] font-bold text-xs flex items-center justify-center font-serif">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-[#1C140D] leading-tight">
                {displayName}
              </div>
              <div className="text-[10px] text-[#634E3F]/70 flex items-center gap-1">
                <span>Owner</span>
                <span className="inline-block w-1 h-1 rounded-full bg-emerald-500"></span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#634E3F]/60 ml-0.5" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E8DCCF] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-[#E8DCCF]">
                <p className="text-xs font-bold text-[#1C140D]">{displayName}</p>
                <p className="text-[11px] text-[#634E3F] truncate">{user.email}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified Server Administrator
                </div>
              </div>

              <div className="p-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Sign Out of Admin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
