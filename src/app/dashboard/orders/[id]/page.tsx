import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { SessionService } from "@/lib/auth/session";
import { getOrderById } from "@/lib/actions/orders";
import { maskStreet, maskPhone } from "@/lib/utils/masking";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  Truck,
  CreditCard,
  Gift,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await SessionService.getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/dashboard/orders");
  }

  const { id } = await params;
  const result = await getOrderById(id);

  if (!result.success) {
    if (result.error.code === "FORBIDDEN") {
      return (
        <div className="bg-[#FFFFFF] rounded-2xl border border-rose-200 p-8 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[#1C140D]">Access Denied</h2>
          <p className="text-xs text-[#634E3F]">
            You do not have authorization to view this order. Customer accounts can only view their own orders.
          </p>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1C140D] text-[#FAF7F2] text-xs font-semibold hover:bg-[#C45A3C] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Orders</span>
          </Link>
        </div>
      );
    }
    notFound();
  }

  const order = result.data;
  const shipping = order.shippingAddress as Record<string, unknown> | null;
  const recipientName = shipping && typeof shipping.fullName === "string" ? shipping.fullName : "Customer";
  const street = shipping && typeof shipping.street === "string" ? shipping.street : null;
  const city = shipping && typeof shipping.city === "string" ? shipping.city : null;
  const phone = shipping && typeof shipping.phone === "string" ? shipping.phone : null;

  const orderSteps = [
    { key: "PENDING", label: "Order Placed", icon: Clock },
    { key: "PROCESSING", label: "Conching & Packing", icon: CheckCircle2 },
    { key: "SHIPPED", label: "In Transit", icon: Truck },
    { key: "DELIVERED", label: "Delivered", icon: ShieldCheck },
  ];

  const getStepStatus = (stepKey: string) => {
    const sequence = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
    if (order.status === "CANCELLED") return "cancelled";
    const currentIndex = sequence.indexOf(order.status);
    const stepIndex = sequence.indexOf(stepKey);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#634E3F] hover:text-[#1C140D] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Orders</span>
        </Link>
      </div>

      {/* Main Order Header */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DCCF] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-xl sm:text-2xl font-bold text-[#1C140D]">
                {order.orderNumber}
              </h2>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-900 border-amber-200">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-[#634E3F] mt-1 flex items-center gap-2">
              <span>Placed on {new Date(order.createdAt).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}</span>
              {order.trackingNumber && (
                <>
                  <span>•</span>
                  <span className="font-mono font-semibold text-[#1C140D]">
                    Tracking: {order.trackingNumber}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="text-right sm:self-center">
            <span className="text-xs text-[#634E3F] block">Total Amount</span>
            <span className="font-serif text-2xl font-bold text-[#1C140D]">
              ৳{order.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Status Stepper */}
        {order.status !== "CANCELLED" ? (
          <div className="py-4">
            <div className="grid grid-cols-4 gap-2 relative">
              {orderSteps.map((step) => {
                const status = getStepStatus(step.key);
                const Icon = step.icon;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        status === "completed"
                          ? "bg-emerald-600 text-white"
                          : status === "current"
                          ? "bg-[#C45A3C] text-white ring-4 ring-[#C45A3C]/20"
                          : "bg-[#FAF7F2] text-[#634E3F] border border-[#E8DCCF]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[11px] font-medium leading-tight ${
                        status === "current"
                          ? "font-bold text-[#1C140D]"
                          : status === "completed"
                          ? "text-emerald-700"
                          : "text-[#634E3F]"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            This order was cancelled. Any redeemed Cocoa Points or pre-authorizations have been returned.
          </div>
        )}
      </div>

      {/* Itemized Breakdown & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items List (Span 2) */}
        <div className="md:col-span-2 bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-[#1C140D] border-b border-[#E8DCCF] pb-3">
            Handcrafted Items ({order.items?.length || 0})
          </h3>

          <div className="divide-y divide-[#E8DCCF]/60">
            {order.items?.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E8DCCF] shrink-0">
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
                    <h4 className="font-serif text-sm font-bold text-[#1C140D]">
                      {item.productName}
                    </h4>
                    <span className="text-xs text-[#634E3F] block mt-0.5">
                      Qty: {item.quantity} × ৳{item.unitPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-sm font-bold text-[#1C140D]">
                  ৳{item.subtotal.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Personalized Gift Note */}
          {order.giftNote && (
            <div className="mt-6 p-4 rounded-xl bg-[#FAF7F2] border border-[#D4A853]/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C140D]">
                <Gift className="w-3.5 h-3.5 text-[#C45A3C]" />
                <span>Personalized Gift Card Attached</span>
              </div>
              <p className="text-xs italic text-[#634E3F] whitespace-pre-line pl-5">
                &ldquo;{order.giftNote}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Financial & Delivery Sidebar (Span 1) */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-[#1C140D] border-b border-[#E8DCCF] pb-3">
              Payment Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-[#634E3F]">
                <span>Items Subtotal</span>
                <span className="font-mono text-[#1C140D]">৳{order.subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-[#634E3F]">
                <span>Climate-Controlled Delivery</span>
                <span className="font-mono text-[#1C140D]">
                  {order.shippingFee === 0 ? "FREE" : `৳${order.shippingFee.toLocaleString()}`}
                </span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Points / Promo Discount</span>
                  <span className="font-mono">-৳{order.discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#E8DCCF] flex justify-between font-bold text-sm text-[#1C140D]">
                <span>Total Paid</span>
                <span className="font-mono font-serif text-base text-[#C45A3C]">
                  ৳{order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {order.cocoaPointsEarned > 0 && (
              <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#D4A853]/30 flex items-center gap-2 text-xs font-semibold text-[#D4A853]">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>+{order.cocoaPointsEarned} Cocoa Points credited</span>
              </div>
            )}
          </div>

          {/* Delivery Destination */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] p-6 shadow-sm space-y-3">
            <h3 className="font-serif text-sm font-bold text-[#1C140D] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C45A3C]" />
              <span>Delivery Destination</span>
            </h3>

            <div className="text-xs text-[#634E3F] space-y-1">
              <span className="font-semibold text-[#1C140D] block">{recipientName}</span>
              {street && <span>{maskStreet(street)}</span>}
              {city && <span className="block">{city}</span>}
              {phone && <span className="block font-mono pt-1 text-[#1C140D]">{maskPhone(phone)}</span>}
            </div>

            <div className="pt-3 border-t border-[#E8DCCF]/60 flex items-center gap-2 text-[11px] text-[#634E3F]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Insulated thermal packaging guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
