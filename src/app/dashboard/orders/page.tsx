import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { SessionService } from "@/lib/auth/session";
import { getUserOrders } from "@/lib/actions/orders";
import { maskStreet } from "@/lib/utils/masking";
import {
  ShoppingBag,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  ExternalLink,
  CreditCard,
  Truck,
} from "lucide-react";

export const metadata = {
  title: "Order History | ChocoBliss by Tasnim",
  description: "View your past and active artisanal chocolate orders with tracking updates.",
};

interface OrdersPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function OrdersHistoryPage({ searchParams }: OrdersPageProps) {
  const user = await SessionService.getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/dashboard/orders");
  }

  const { status: statusFilter } = await searchParams;
  const result = await getUserOrders();
  const allOrders = result.success && result.data ? result.data : [];

  const filteredOrders = statusFilter && statusFilter !== "ALL"
    ? allOrders.filter((o) => o.status === statusFilter)
    : allOrders;

  const statuses = [
    { label: "All Orders", value: "ALL", count: allOrders.length },
    { label: "Pending", value: "PENDING", count: allOrders.filter((o) => o.status === "PENDING").length },
    { label: "Processing", value: "PROCESSING", count: allOrders.filter((o) => o.status === "PROCESSING").length },
    { label: "Shipped", value: "SHIPPED", count: allOrders.filter((o) => o.status === "SHIPPED").length },
    { label: "Delivered", value: "DELIVERED", count: allOrders.filter((o) => o.status === "DELIVERED").length },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SHIPPED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PROCESSING":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1C140D]">Order History</h2>
          <p className="text-xs sm:text-sm text-[#634E3F]">
            Track status, view receipts, and re-order your favorite micro-batch creations.
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C140D] text-[#FAF7F2] text-xs font-semibold hover:bg-[#C45A3C] transition-colors self-start sm:self-auto"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Shop New Drops</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {statuses.map((s) => {
          const isActive = (statusFilter || "ALL") === s.value;
          return (
            <Link
              key={s.value}
              href={s.value === "ALL" ? "/dashboard/orders" : `/dashboard/orders?status=${s.value}`}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? "bg-[#1C140D] text-[#FAF7F2] font-semibold"
                  : "bg-[#FFFFFF] border border-[#E8DCCF] text-[#634E3F] hover:bg-[#FAF7F2]"
              }`}
            >
              <span>{s.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? "bg-[#D4A853] text-[#1C140D]" : "bg-[#FAF7F2] text-[#634E3F]"
                }`}
              >
                {s.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FAF7F2] text-[#634E3F] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1C140D]">No Orders Found</h3>
            <p className="text-xs text-[#634E3F] max-w-sm mx-auto mt-1">
              {statusFilter
                ? `You have no orders currently in "${statusFilter}" status.`
                : "You haven't placed any orders yet. Visit our shop to experience pure single-origin indulgence."}
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C45A3C] text-[#FAF7F2] text-xs font-semibold hover:bg-[#a8492f] transition shadow-md"
          >
            <span>Explore Boutique</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const shipping = order.shippingAddress as Record<string, unknown> | null;
            const street = shipping && typeof shipping.street === "string" ? shipping.street : null;
            const city = shipping && typeof shipping.city === "string" ? shipping.city : null;

            return (
              <div
                key={order.id}
                className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] shadow-sm overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="bg-[#FAF7F2]/60 px-6 py-4 border-b border-[#E8DCCF] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[#1C140D]">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#634E3F]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C45A3C]" />
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="font-semibold text-[#1C140D]">
                      Total: ৳{order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Items & Details */}
                <div className="p-6 space-y-4">
                  <div className="divide-y divide-[#E8DCCF]/60">
                    {order.items?.map((item) => (
                      <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#FAF7F2] border border-[#E8DCCF] shrink-0">
                            {item.productImage ? (
                              <Image
                                src={item.productImage}
                                alt={item.productName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#634E3F]">
                                CB
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-serif text-sm font-bold text-[#1C140D] block">
                              {item.productName}
                            </span>
                            <span className="text-xs text-[#634E3F]">
                              Qty: {item.quantity} × ৳{item.unitPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <span className="font-mono text-xs font-bold text-[#1C140D]">
                          ৳{item.subtotal.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary Bar */}
                  <div className="pt-4 border-t border-[#E8DCCF] flex flex-wrap items-center justify-between gap-4 text-xs text-[#634E3F]">
                    <div className="flex items-center gap-4">
                      {street && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#C45A3C]" />
                          <span>Delivering to {maskStreet(street)}{city ? `, ${city}` : ""}</span>
                        </div>
                      )}
                      {order.trackingNumber && (
                        <div className="flex items-center gap-1.5 font-mono text-[#1C140D]">
                          <Truck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Tracking: {order.trackingNumber}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {order.cocoaPointsEarned > 0 && (
                        <span className="inline-flex items-center gap-1 text-[#D4A853] font-bold">
                          <Sparkles className="w-3.5 h-3.5" />
                          +{order.cocoaPointsEarned} pts earned
                        </span>
                      )}

                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg border border-[#E8DCCF] bg-[#FAF7F2] hover:bg-[#1C140D] hover:text-[#FAF7F2] text-xs font-semibold text-[#1C140D] transition"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
