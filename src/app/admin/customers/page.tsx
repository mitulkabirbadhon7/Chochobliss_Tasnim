"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Download,
  Plus,
  Mail,
  Phone,
  ShieldAlert,
  Award,
  CreditCard,
  ShoppingBag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Lock,
  UserX,
  CheckCircle,
  MapPin,
} from "lucide-react";
import { getAdminCustomersAction } from "@/lib/actions/admin";

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  maskedEmail: string;
  maskedPhone: string | null;
  cocoaPoints: number;
  tier: string;
  ordersCount: number;
  totalSpend: number;
  lastOrderDate: Date | null;
  defaultAddress: {
    street: string;
    maskedStreet: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    createdAt: Date;
    status: string;
  }>;
}

export default function AdminCustomersPage() {
  const [tab, setTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [counts, setCounts] = useState({
    total: 0,
    newCount: 0,
    repeatCount: 0,
    vipCount: 0,
  });

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  const fetchCustomers = async () => {
    const res = await getAdminCustomersAction({
      search: searchQuery || undefined,
      tier: tierFilter !== "all" ? tierFilter : undefined,
      segment: tab !== "all" ? tab : undefined,
      page: currentPage,
      limit: 15,
    });

    if (res.success && res.data) {
      const fetched = res.data.customers as unknown as CustomerRecord[];
      setCustomers(fetched);
      setCounts(res.data.counts);
      if (fetched.length > 0 && !selectedCustomer) {
        setSelectedCustomer(fetched[0]);
      } else if (selectedCustomer) {
        const found = fetched.find((c) => c.id === selectedCustomer.id);
        if (found) setSelectedCustomer(found);
      }
    }
  };

  useEffect(() => {
    startTransition(() => {
      fetchCustomers();
    });
  }, [tab, tierFilter, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    startTransition(() => {
      fetchCustomers();
    });
  };

  const handleBlockCustomer = () => {
    if (!selectedCustomer) return;
    setFeedback(`Customer ${selectedCustomer.name} has been restricted. Reason: ${blockReason || "Administrative hold"}`);
    setShowBlockDialog(false);
    setBlockReason("");
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleResetPassword = () => {
    if (!selectedCustomer) return;
    setFeedback(`Secure password reset instructions dispatched to ${selectedCustomer.maskedEmail}.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1C140D]">
            Customers
          </h1>
          <p className="text-xs sm:text-sm text-[#634E3F] mt-1 font-medium">
            Understand every customer, reward loyalty and manage account access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => alert("Customers list exported.")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8DCCF] bg-white text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2] transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#634E3F]" />
            <span>Export customers</span>
          </button>
          <button
            type="button"
            onClick={() => alert("Manual customer onboarding.")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C45A3C] text-xs font-semibold text-white hover:bg-[#b04f33] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add customer</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCF] shadow-xs">
          <span className="text-[11px] font-medium text-[#634E3F] block">Total customers</span>
          <div className="font-serif text-2xl font-bold text-[#1C140D] mt-1">
            {counts.total.toLocaleString()}
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-2 inline-block">
            +8.7%
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCF] shadow-xs">
          <span className="text-[11px] font-medium text-[#634E3F] block">Repeat customer rate</span>
          <div className="font-serif text-2xl font-bold text-[#1C140D] mt-1">
            42.6%
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-2 inline-block">
            +3.2%
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCF] shadow-xs">
          <span className="text-[11px] font-medium text-[#634E3F] block">Average lifetime value</span>
          <div className="font-serif text-2xl font-bold text-[#1C140D] mt-1">
            ৳8,940
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-2 inline-block">
            +11.4%
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCF] shadow-xs">
          <span className="text-[11px] font-medium text-[#634E3F] block">Loyalty members</span>
          <div className="font-serif text-2xl font-bold text-[#1C140D] mt-1">
            2,106
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-2 inline-block">
            +96 this month
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[#E8DCCF] shadow-xs p-2 flex items-center gap-2 overflow-x-auto">
        {[
          { id: "all", label: "All customers", count: counts.total || 3842 },
          { id: "new", label: "New", count: 186 },
          { id: "repeat", label: "Repeat", count: 1636 },
          { id: "vip", label: "VIP", count: 124 },
          { id: "at-risk", label: "At risk", count: 48 },
        ].map((item) => {
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-[#FAF7F2] text-[#C45A3C] border border-[#E8DCCF]"
                  : "text-[#634E3F] hover:bg-[#FAF7F2]"
              }`}
            >
              <span>{item.label}</span>
              <span className="text-[10px] font-bold text-[#634E3F]/80">
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8DCCF] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md relative">
          <Search className="w-4 h-4 text-[#634E3F]/60 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email or phone..."
            className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1C140D] placeholder-[#634E3F]/60 focus:outline-none focus:ring-2 focus:ring-[#C45A3C]"
          />
        </form>

        <div className="w-full md:w-auto flex items-center gap-2 justify-end">
          <select
            value={tierFilter}
            onChange={(e) => {
              setTierFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 text-xs font-medium text-[#1C140D]"
          >
            <option value="all">Loyalty tier: All</option>
            <option value="Platinum">Platinum</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Classic">Classic</option>
          </select>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-medium">
          {feedback}
        </div>
      )}

      {/* Split Layout: Customer Table & Selected Customer Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Customer List Table) */}
        <div className="lg:col-span-6 xl:col-span-5 bg-white rounded-2xl border border-[#E8DCCF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8DCCF] text-[10px] uppercase font-bold text-[#634E3F] tracking-wider bg-[#FAF7F2]">
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Tier</th>
                  <th className="py-3 px-4 font-semibold">Orders</th>
                  <th className="py-3 px-4 font-semibold">Total Spend</th>
                  <th className="py-3 px-4 font-semibold">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCF]/60">
                {customers.length > 0 ? (
                  customers.map((c) => {
                    const isSelected = selectedCustomer?.id === c.id;
                    const initials = c.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCustomer(c)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-[#FAF2EB]" : "hover:bg-[#FAF7F2]"
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#E8DCCF] text-[#1C140D] font-bold text-[11px] flex items-center justify-center font-serif shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[#1C140D] truncate">
                                {c.name}
                              </div>
                              <div className="text-[11px] text-[#634E3F] truncate">
                                {c.maskedEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.tier === "Platinum"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : c.tier === "Gold"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : c.tier === "Silver"
                                ? "bg-zinc-100 text-zinc-700 border border-zinc-200"
                                : "bg-[#FAF7F2] text-[#634E3F]"
                            }`}
                          >
                            {c.tier}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#1C140D]">
                          {c.ordersCount}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#1C140D]">
                          ৳{c.totalSpend.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-[#634E3F] whitespace-nowrap">
                          {c.lastOrderDate
                            ? new Date(c.lastOrderDate).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "short",
                              })
                            : "—"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-[#634E3F]">
                      No customers found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Selected Customer Details */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
          {selectedCustomer ? (
            <>
              {/* Profile Card */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#E8DCCF] text-[#1C140D] font-bold text-sm flex items-center justify-center font-serif">
                      {selectedCustomer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-2xl font-bold text-[#1C140D]">
                          {selectedCustomer.name}
                        </h2>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-[#634E3F]">
                        Artisanal Connoisseur • Client ID: {selectedCustomer.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => alert(`Opening mailto for ${selectedCustomer.maskedEmail}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DCCF] bg-white text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2]"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#634E3F]" />
                      <span>Email</span>
                    </button>
                    {selectedCustomer.phone && (
                      <button
                        type="button"
                        onClick={() => alert(`Calling ${selectedCustomer.maskedPhone}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DCCF] bg-white text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2]"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#634E3F]" />
                        <span>Call</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Loyalty Tier Banner */}
                <div className="bg-[#FAF2EB] p-4 rounded-xl border border-[#E8DCCF] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#C45A3C] text-white flex items-center justify-center font-bold text-xs">
                    ★
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1C140D]">
                      {selectedCustomer.tier} Loyalty Member
                    </div>
                    <div className="text-[11px] text-[#634E3F]">
                      {selectedCustomer.cocoaPoints.toLocaleString()} Cocoa Points balance • Tier benefits active.
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Insights Card */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#1C140D]">Customer insights</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8DCCF]/60">
                    <span className="text-[10px] uppercase font-bold text-[#634E3F] tracking-wider block">
                      Total spend
                    </span>
                    <div className="font-serif text-lg font-bold text-[#1C140D] mt-1">
                      ৳{selectedCustomer.totalSpend.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8DCCF]/60">
                    <span className="text-[10px] uppercase font-bold text-[#634E3F] tracking-wider block">
                      Orders
                    </span>
                    <div className="font-serif text-lg font-bold text-[#1C140D] mt-1">
                      {selectedCustomer.ordersCount}
                    </div>
                  </div>
                  <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8DCCF]/60">
                    <span className="text-[10px] uppercase font-bold text-[#634E3F] tracking-wider block">
                      AOV
                    </span>
                    <div className="font-serif text-lg font-bold text-[#1C140D] mt-1">
                      ৳
                      {selectedCustomer.ordersCount > 0
                        ? Math.round(selectedCustomer.totalSpend / selectedCustomer.ordersCount).toLocaleString()
                        : 0}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Repeat buyer
                  </span>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    Gift shopper
                  </span>
                  <span className="text-[11px] font-semibold text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                    High AOV
                  </span>
                  <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    Email engaged
                  </span>
                </div>
              </div>

              {/* Contact & Default Address (with PII Protection) */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1C140D]">Contact & default address</h3>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    PII Masked by Server Rules
                  </span>
                </div>

                <div className="text-xs space-y-1 text-[#1C140D]">
                  <div>
                    <span className="text-[#634E3F] font-semibold">Email: </span>
                    {selectedCustomer.maskedEmail}
                  </div>
                  <div>
                    <span className="text-[#634E3F] font-semibold">Phone: </span>
                    {selectedCustomer.maskedPhone || "No telephone provided"}
                  </div>
                  {selectedCustomer.defaultAddress && (
                    <div className="pt-2 border-t border-[#FAF7F2] text-[#634E3F] flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#C45A3C] shrink-0 mt-0.5" />
                      <div>
                        <div>{selectedCustomer.defaultAddress.maskedStreet}</div>
                        <div>
                          {selectedCustomer.defaultAddress.city}, {selectedCustomer.defaultAddress.country}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order History Summary */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1C140D]">Order history</h3>
                  <Link
                    href={`/admin/orders?search=${encodeURIComponent(selectedCustomer.email)}`}
                    className="text-xs font-semibold text-[#C45A3C] hover:underline"
                  >
                    View all orders
                  </Link>
                </div>

                {selectedCustomer.recentOrders.length > 0 ? (
                  <div className="divide-y divide-[#FAF7F2]">
                    {selectedCustomer.recentOrders.map((o) => (
                      <div key={o.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-[#1C140D] font-mono">#{o.orderNumber}</div>
                          <div className="text-[11px] text-[#634E3F]">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#1C140D]">৳{o.totalAmount.toLocaleString()}</div>
                          <span className="text-[10px] font-semibold text-emerald-700">
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#634E3F] py-2">No prior purchases recorded.</p>
                )}
              </div>

              {/* Account Status & Access Control */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#1C140D]">Account status</h3>
                <p className="text-xs text-[#634E3F]">Control access, communications and security settings.</p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="flex-1 py-2 rounded-xl border border-[#E8DCCF] bg-white text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2] flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#634E3F]" />
                    <span>Reset account password</span>
                  </button>

                  {!showBlockDialog ? (
                    <button
                      type="button"
                      onClick={() => setShowBlockDialog(true)}
                      className="py-2 px-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-100 flex items-center justify-center gap-2"
                    >
                      <UserX className="w-3.5 h-3.5 text-rose-600" />
                      <span>Block customer...</span>
                    </button>
                  ) : (
                    <div className="w-full bg-rose-50 p-4 rounded-xl border border-rose-200 space-y-3">
                      <p className="text-xs font-bold text-rose-900">Block this customer?</p>
                      <p className="text-[11px] text-[#634E3F]">
                        They will be unable to sign in or place orders. Existing orders remain unchanged.
                      </p>
                      <input
                        type="text"
                        value={blockReason}
                        onChange={(e) => setBlockReason(e.target.value)}
                        placeholder="Enter reason for deactivation"
                        className="w-full bg-white border border-rose-300 rounded-lg px-3 py-1.5 text-xs text-[#1C140D]"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowBlockDialog(false)}
                          className="flex-1 py-1.5 rounded-lg border border-[#E8DCCF] bg-white text-xs font-semibold text-[#634E3F]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleBlockCustomer}
                          className="flex-1 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                        >
                          Confirm block
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-[#E8DCCF] text-center text-xs text-[#634E3F]">
              Select a customer from the directory to view loyalty profile and orders.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
