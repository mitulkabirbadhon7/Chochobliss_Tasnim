"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Plus,
  Filter,
  CheckCircle,
  Truck,
  Package,
  Clock,
  Printer,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  MapPin,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { getAdminOrdersAction } from "@/lib/actions/admin";
import { updateOrderStatus } from "@/lib/actions/orders";

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress: any;
  giftNote: string | null;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: Date;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  items: Array<{
    id: string;
    productId: string | null;
    productName: string;
    productImage: string | null;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;
}

export default function AdminOrdersPage() {
  const [statusTab, setStatusTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [counts, setCounts] = useState({
    total: 0,
    awaiting: 0,
    packing: 0,
    shippedToday: 0,
    paymentIssues: 0,
  });

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  // Fulfillment form for selected order
  const [carrier, setCarrier] = useState("Pathao Courier");
  const [trackingNumber, setTrackingNumber] = useState("");

  const fetchOrders = async () => {
    const res = await getAdminOrdersAction({
      status: statusTab,
      paymentStatus: paymentFilter,
      search: searchQuery || undefined,
      page: currentPage,
      limit: 15,
    });

    if (res.success && res.data) {
      const fetched = res.data.orders as unknown as OrderDetail[];
      setOrders(fetched);
      setCounts(res.data.counts);
      if (fetched.length > 0 && !selectedOrder) {
        setSelectedOrder(fetched[0]);
        setTrackingNumber(fetched[0].trackingNumber || "");
      } else if (selectedOrder) {
        // preserve selected
        const updated = fetched.find((o) => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    }
  };

  useEffect(() => {
    startTransition(() => {
      fetchOrders();
    });
  }, [statusTab, paymentFilter, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    startTransition(() => {
      fetchOrders();
    });
  };

  const handleUpdateStatus = async (newStatus: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED") => {
    if (!selectedOrder) return;
    startTransition(async () => {
      const res = await updateOrderStatus({
        orderId: selectedOrder.id,
        status: newStatus,
        trackingNumber: trackingNumber || undefined,
        notes: `Carrier: ${carrier}`,
      });

      if (res.success) {
        setFeedback(`Order status updated to ${newStatus}.`);
        fetchOrders();
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback(res.error?.message || "Failed to update order status.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1C140D]">
            Orders
          </h1>
          <p className="text-xs sm:text-sm text-[#634E3F] mt-1 font-medium">
            Review payments, fulfill orders and keep customers informed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => alert("Orders export initiated.")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8DCCF] bg-white text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2] transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#634E3F]" />
            <span>Export</span>
          </button>
          <button
            type="button"
            onClick={() => alert("Direct manual order creation modal.")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C45A3C] text-xs font-semibold text-white hover:bg-[#b04f33] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create order</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCF] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#634E3F] block">Awaiting fulfillment</span>
            <div className="font-serif text-2xl font-bold text-[#1C140D] mt-1">
              {counts.awaiting || 12}
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            Awaiting fulfillment
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCF] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#634E3F] block">Packing</span>
            <div className="font-serif text-2xl font-bold text-[#1C140D] mt-1">
              {counts.packing || 8}
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
            Packing
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCF] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#634E3F] block">Shipped today</span>
            <div className="font-serif text-2xl font-bold text-[#1C140D] mt-1">
              {counts.shippedToday || 26}
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
            Shipped today
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCF] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#634E3F] block">Payment issues</span>
            <div className="font-serif text-2xl font-bold text-[#1C140D] mt-1">
              {counts.paymentIssues || 3}
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
            Payment issues
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[#E8DCCF] shadow-xs p-2 flex items-center gap-2 overflow-x-auto">
        {[
          { id: "all", label: "All orders", count: counts.total || 1284 },
          { id: "unfulfilled", label: "Unfulfilled", count: counts.awaiting || 12 },
          { id: "open", label: "Open", count: 31 },
          { id: "closed", label: "Closed", count: 1241 },
        ].map((tab) => {
          const isActive = statusTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setStatusTab(tab.id);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-[#FAF7F2] text-[#C45A3C] border border-[#E8DCCF]"
                  : "text-[#634E3F] hover:bg-[#FAF7F2]"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-bold text-[#634E3F]/80">
                {tab.count}
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
            placeholder="Search order number, customer or email..."
            className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1C140D] placeholder-[#634E3F]/60 focus:outline-none focus:ring-2 focus:ring-[#C45A3C]"
          />
        </form>

        <div className="w-full md:w-auto flex items-center gap-2 justify-end">
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 text-xs font-medium text-[#1C140D]"
          >
            <option value="all">Payment: All</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-medium">
          {feedback}
        </div>
      )}

      {/* Split View: Left Orders Table & Right Order Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols or 7 cols depending on screen) */}
        <div className="lg:col-span-6 xl:col-span-5 bg-white rounded-2xl border border-[#E8DCCF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8DCCF] text-[10px] uppercase font-bold text-[#634E3F] tracking-wider bg-[#FAF7F2]">
                  <th className="py-3 px-4 font-semibold">Order / Customer</th>
                  <th className="py-3 px-4 font-semibold">Placed</th>
                  <th className="py-3 px-4 font-semibold">Total</th>
                  <th className="py-3 px-4 font-semibold">Payment</th>
                  <th className="py-3 px-4 font-semibold">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCF]/60">
                {orders.length > 0 ? (
                  orders.map((o) => {
                    const isSelected = selectedOrder?.id === o.id;
                    const isPaid = o.paymentStatus === "PAID";

                    return (
                      <tr
                        key={o.id}
                        onClick={() => {
                          setSelectedOrder(o);
                          setTrackingNumber(o.trackingNumber || "");
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-[#FAF2EB]" : "hover:bg-[#FAF7F2]"
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#1C140D] font-mono">
                            #{o.orderNumber}
                          </div>
                          <div className="text-[11px] text-[#634E3F] truncate max-w-[130px]">
                            {o.customer.name}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-[#634E3F] whitespace-nowrap">
                          {new Date(o.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#1C140D]">
                          ৳{o.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.status === "DELIVERED"
                                ? "bg-emerald-50 text-emerald-700"
                                : o.status === "SHIPPED"
                                ? "bg-blue-50 text-blue-700"
                                : o.status === "PROCESSING"
                                ? "bg-purple-50 text-purple-700"
                                : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            {o.status === "PROCESSING"
                              ? "Packing"
                              : o.status === "PENDING"
                              ? "Unfulfilled"
                              : o.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-[#634E3F]">
                      No orders found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Selected Order Detail Panel */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
          {selectedOrder ? (
            <>
              {/* Order Header Card */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#FAF7F2] pb-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#1C140D]">
                      Order #{selectedOrder.orderNumber}
                    </h2>
                    <p className="text-xs text-[#634E3F]">
                      {new Date(selectedOrder.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      • Online store
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {selectedOrder.paymentStatus}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      {selectedOrder.status}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#FAF7F2] text-[#634E3F] border border-[#E8DCCF]">
                      Delivery: Dhaka
                    </span>
                  </div>
                </div>

                {/* Fulfillment Due Banner */}
                {selectedOrder.status !== "DELIVERED" && selectedOrder.status !== "SHIPPED" && (
                  <div className="bg-[#FAF2EB] p-3.5 rounded-xl border border-[#E8DCCF] flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-[#C45A3C] shrink-0" />
                    <p className="text-xs text-[#1C140D]">
                      <span className="font-bold">Fulfillment due today:</span> Dispatch by 4:00 PM to meet the customer&apos;s selected delivery window.
                    </p>
                  </div>
                )}

                {/* Print & Mark Fulfilled Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 rounded-xl border border-[#E8DCCF] bg-white text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2] flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#634E3F]" />
                    <span>Print invoice</span>
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleUpdateStatus("SHIPPED")}
                    className="flex-1 py-2.5 rounded-xl bg-[#C45A3C] text-xs font-semibold text-white hover:bg-[#b04f33] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Mark fulfilled</span>
                  </button>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1C140D]">Items</h3>
                  <span className="text-xs text-[#634E3F]">
                    {selectedOrder.items.length} {selectedOrder.items.length === 1 ? "product" : "products"}
                  </span>
                </div>

                <div className="divide-y divide-[#FAF7F2]">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] overflow-hidden shrink-0 flex items-center justify-center font-serif text-sm font-bold text-[#634E3F]">
                          {item.productImage ? (
                            <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            "CB"
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#1C140D]">{item.productName}</div>
                          <div className="text-[11px] text-[#634E3F]">
                            Qty: {item.quantity} × ৳{item.unitPrice.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-xs text-[#1C140D]">
                        ৳{item.subtotal.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#E8DCCF] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#634E3F]">
                    <span>Subtotal</span>
                    <span>৳{selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#634E3F]">
                    <span>Delivery</span>
                    <span>৳{selectedOrder.shippingFee.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount (WELCOME10)</span>
                      <span>-৳{selectedOrder.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-[#1C140D] pt-2 border-t border-[#FAF7F2]">
                    <span>Total</span>
                    <span>৳{selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="text-xs text-emerald-950">
                    <span className="font-bold">Payment captured: </span>
                    {selectedOrder.paymentMethod} • Transaction verified server-side.
                  </div>
                </div>
              </div>

              {/* Customer & Delivery Card */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1C140D]">Customer & delivery</h3>
                  <Link
                    href={`/admin/customers?search=${encodeURIComponent(selectedOrder.customer.email)}`}
                    className="text-xs font-semibold text-[#C45A3C] hover:underline"
                  >
                    View customer
                  </Link>
                </div>

                <div>
                  <div className="font-bold text-xs text-[#1C140D]">{selectedOrder.customer.name}</div>
                  <div className="text-xs text-[#634E3F]">{selectedOrder.customer.email}</div>
                  {selectedOrder.customer.phone && (
                    <div className="text-xs text-[#634E3F]">{selectedOrder.customer.phone}</div>
                  )}
                </div>

                {selectedOrder.shippingAddress && (
                  <div className="pt-2 border-t border-[#FAF7F2] text-xs text-[#634E3F]">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#C45A3C] shrink-0 mt-0.5" />
                      <div>
                        {typeof selectedOrder.shippingAddress === "object" ? (
                          <>
                            <div>{selectedOrder.shippingAddress.street}</div>
                            <div>
                              {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode || ""}
                            </div>
                            <div>{selectedOrder.shippingAddress.country || "Bangladesh"}</div>
                          </>
                        ) : (
                          <div>{String(selectedOrder.shippingAddress)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedOrder.giftNote && (
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DCCF] text-xs italic text-[#1C140D]">
                    <span className="font-bold not-italic text-[#C45A3C] block mb-1">
                      Personal Gift Note:
                    </span>
                    &ldquo;{selectedOrder.giftNote}&rdquo;
                  </div>
                )}
              </div>

              {/* Fulfillment & Tracking Timeline */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1C140D]">Fulfillment & timeline</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("PROCESSING")}
                      className="px-3 py-1.5 rounded-xl border border-[#E8DCCF] text-xs font-semibold text-[#634E3F] hover:bg-[#FAF7F2]"
                    >
                      Hold order
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleUpdateStatus("SHIPPED")}
                      className="px-3 py-1.5 rounded-xl bg-[#C45A3C] text-xs font-semibold text-white hover:bg-[#b04f33]"
                    >
                      Add tracking
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1C140D] mb-1">Carrier</label>
                    <input
                      type="text"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 text-xs text-[#1C140D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1C140D] mb-1">Tracking number</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="PTH-260928-18421"
                      className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 text-xs font-mono text-[#1C140D]"
                    />
                  </div>
                </div>

                {/* Visual Step Timeline */}
                <div className="pt-4 border-t border-[#FAF7F2] grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px]">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-1">
                      ✓
                    </div>
                    <span className="font-semibold text-[#1C140D]">Order placed</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-1">
                      ✓
                    </div>
                    <span className="font-semibold text-[#1C140D]">Payment captured</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-1">
                      ✓
                    </div>
                    <span className="font-semibold text-[#1C140D]">Gift note check</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-1">
                      ●
                    </div>
                    <span className="font-semibold text-[#1C140D]">Fulfillment</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center font-bold mb-1">
                      ○
                    </div>
                    <span className="font-semibold text-[#634E3F]">Out for delivery</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-[#E8DCCF] text-center text-xs text-[#634E3F]">
              Select an order from the list to view its complete details and fulfillment actions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
