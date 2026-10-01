"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartTotalQuantity,
  clearCart,
} from "@/store/slices/cartSlice";
import { getCurrentUserAction } from "@/lib/actions/auth";
import { getUserAddressesAction } from "@/lib/actions/users";
import { createOrder } from "@/lib/actions/orders";
import {
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  Truck,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  PlusCircle,
  MapPin,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const totalQuantity = useAppSelector(selectCartTotalQuantity);

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [user, setUser] = useState<{ id: string; name: string | null; email: string; cocoaPoints: number } | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("NEW");

  // Form Fields for shipping address
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "Dhaka",
    state: "Dhaka",
    postalCode: "",
    country: "Bangladesh",
  });

  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "COD" | "BKASH" | "NAGAD">("COD");
  const [giftNote, setGiftNote] = useState("");
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderId: string;
    orderNumber: string;
    totalAmount: number;
  } | null>(null);

  // Load auth state & addresses
  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await getCurrentUserAction();
        if (userRes.success && userRes.data) {
          setUser(userRes.data);
          // Prefill name if available
          if (userRes.data.name) {
            setAddressForm((prev) => ({ ...prev, fullName: userRes.data?.name || "" }));
          }

          const addrRes = await getUserAddressesAction();
          if (addrRes.success && addrRes.data && addrRes.data.length > 0) {
            setSavedAddresses(addrRes.data);
            const defaultAddr = addrRes.data.find((a) => a.isDefault) || addrRes.data[0];
            setSelectedAddressId(defaultAddr.id);
            setAddressForm({
              fullName: defaultAddr.fullName,
              phone: defaultAddr.phone,
              street: defaultAddr.street,
              city: defaultAddr.city,
              state: defaultAddr.state,
              postalCode: defaultAddr.postalCode,
              country: defaultAddr.country,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load user or addresses:", err);
      } finally {
        setIsLoadingAuth(false);
      }
    }
    loadData();
  }, []);

  const handleSelectAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (addrId === "NEW") {
      setAddressForm({
        fullName: user?.name || "",
        phone: "",
        street: "",
        city: "Dhaka",
        state: "Dhaka",
        postalCode: "",
        country: "Bangladesh",
      });
    } else {
      const match = savedAddresses.find((a) => a.id === addrId);
      if (match) {
        setAddressForm({
          fullName: match.fullName,
          phone: match.phone,
          street: match.street,
          city: match.city,
          state: match.state,
          postalCode: match.postalCode,
          country: match.country,
        });
      }
    }
  };

  const freeShippingThreshold = 100;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 15;
  const maxRedeemablePoints = user ? Math.min(user.cocoaPoints, Math.floor(subtotal)) : 0;
  const pointsDiscount = Math.min(pointsToRedeem, maxRedeemablePoints);
  const totalAmount = Math.max(0, subtotal + shippingFee - pointsDiscount);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage("Your bag is currently empty.");
      return;
    }

    if (!user) {
      router.push(`/login?redirect=/checkout`);
      return;
    }

    // Basic address validations
    if (!addressForm.fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!addressForm.phone.trim()) {
      setErrorMessage("Please enter your phone number.");
      return;
    }
    if (!addressForm.street.trim() || addressForm.street.trim().length < 5) {
      setErrorMessage("Please enter your complete street address (minimum 5 characters).");
      return;
    }
    if (!addressForm.city.trim()) {
      setErrorMessage("Please enter your city.");
      return;
    }
    if (!addressForm.state.trim()) {
      setErrorMessage("Please enter your state or division.");
      return;
    }
    if (!addressForm.postalCode.trim()) {
      setErrorMessage("Please enter your postal code.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.productId || (i.selectedFlavor ? i.id.slice(0, -(i.selectedFlavor.length + 1)) : i.id),
          selectedFlavor: i.selectedFlavor || null,
          quantity: i.quantity,
        })),
        shippingAddress: {
          fullName: addressForm.fullName.trim(),
          phone: addressForm.phone.trim(),
          street: addressForm.street.trim(),
          city: addressForm.city.trim(),
          state: addressForm.state.trim(),
          postalCode: addressForm.postalCode.trim(),
          country: addressForm.country.trim() || "Bangladesh",
        },
        paymentMethod,
        giftNote: giftNote.trim() ? giftNote.trim() : null,
        cocoaPointsToRedeem: pointsDiscount,
      };

      const result = await createOrder(orderPayload);

      if (!result.success) {
        setErrorMessage(result.error.message || "Failed to process order.");
        setIsSubmitting(false);
        return;
      }

      // Order created successfully!
      dispatch(clearCart());
      setOrderSuccess(result.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred while placing order.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (orderSuccess) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-[#E8DCCF] shadow-md text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6 text-emerald-600">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <span className="text-xs font-bold tracking-widest uppercase text-[#C45A3C] bg-[#C45A3C]/10 px-3 py-1 rounded-full">
            Order Confirmed
          </span>

          <h1 className="font-serif text-3xl font-bold text-[#1C140D] mt-4 mb-2">
            Thank You For Your Order!
          </h1>
          <p className="text-sm text-[#634E3F] max-w-md mx-auto mb-8">
            Your artisanal chocolate order has been accepted and sent to our master chocolatiers for handcrafted preparation.
          </p>

          <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E8DCCF] text-left space-y-3 mb-8">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#634E3F]">Order Reference</span>
              <span className="font-mono font-bold text-[#1C140D] text-base">{orderSuccess.orderNumber}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#634E3F]">Total Amount</span>
              <span className="font-serif font-bold text-[#C45A3C] text-lg">${orderSuccess.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#634E3F]">Payment Method</span>
              <span className="font-medium text-[#1C140D]">{paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#634E3F]">Shipping Destination</span>
              <span className="font-medium text-[#1C140D] text-right truncate max-w-xs">{addressForm.street}, {addressForm.city}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/dashboard/orders/${orderSuccess.orderId}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#C45A3C] hover:bg-[#a8492e] text-[#FAF7F2] rounded-xl font-bold text-sm transition-colors shadow-sm"
            >
              View Order Details <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-[#E8DCCF] bg-white hover:bg-[#FAF7F2] text-[#1C140D] rounded-xl font-semibold text-sm transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // EMPTY BAG STATE
  if (items.length === 0 && !orderSuccess) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-10 border border-[#E8DCCF] shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-[#F5EDE4] flex items-center justify-center mx-auto mb-4 text-[#634E3F]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#1C140D] mb-2">Your bag is empty</h1>
          <p className="text-sm text-[#634E3F] mb-6">
            Please add your favorite single-origin chocolates and confectioneries to your bag before checking out.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C45A3C] hover:bg-[#a8492e] text-[#FAF7F2] rounded-full text-sm font-semibold transition-colors"
          >
            Return to Boutique <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#634E3F] mb-6">
          <Link href="/" className="hover:text-[#1C140D] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-[#1C140D] transition-colors">
            Bag
          </Link>
          <span>/</span>
          <span className="text-[#1C140D] font-semibold">Secure Checkout</span>
        </div>

        <div className="pb-6 border-b border-[#E8DCCF] mb-8">
          <div className="flex items-center gap-2 text-[#C45A3C] text-xs font-bold uppercase tracking-widest mb-1">
            <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted Checkout
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C140D] tracking-tight">
            Checkout & Delivery
          </h1>
        </div>

        {/* Guest Warning / Sign-In Notice */}
        {!isLoadingAuth && !user && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-900">Sign in to complete your checkout</p>
                <p className="text-xs text-amber-700">
                  Earn Cocoa Points, save shipping addresses, and track real-time chocolate tempering and dispatch.
                </p>
              </div>
            </div>
            <Link
              href="/login?redirect=/checkout"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1C140D] hover:bg-[#38281B] text-[#FAF7F2] rounded-xl text-xs font-semibold shrink-0 transition-colors"
            >
              Sign In Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Delivery & Payment Details (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Shipping Address Selection */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCCF] shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8DCCF]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#F5EDE4] text-[#C45A3C] font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <h2 className="font-serif text-xl font-bold text-[#1C140D]">Shipping Address</h2>
                </div>
              </div>

              {/* Saved Addresses Picker (if any) */}
              {savedAddresses.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-[#634E3F] uppercase tracking-wider">
                    Select a saved destination
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? "border-[#C45A3C] bg-[#FAF7F2] ring-1 ring-[#C45A3C]"
                            : "border-[#E8DCCF] bg-white hover:border-[#634E3F]/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#1C140D] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#C45A3C]" /> {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-[#E8DCCF] text-[#634E3F] px-1.5 py-0.5 rounded font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-[#1C140D]">{addr.fullName}</p>
                        <p className="text-xs text-[#634E3F] truncate">{addr.street}</p>
                        <p className="text-xs text-[#634E3F]">{addr.city}, {addr.postalCode}</p>
                        <p className="text-[11px] text-[#634E3F] mt-1">{addr.phone}</p>
                      </div>
                    ))}

                    <div
                      onClick={() => handleSelectAddress("NEW")}
                      className={`p-4 rounded-2xl border cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
                        selectedAddressId === "NEW"
                          ? "border-[#C45A3C] bg-[#FAF7F2] ring-1 ring-[#C45A3C]"
                          : "border-dashed border-[#E8DCCF] bg-white hover:border-[#634E3F]/40"
                      }`}
                    >
                      <PlusCircle className="w-5 h-5 text-[#C45A3C] mb-1" />
                      <span className="text-xs font-bold text-[#1C140D]">Enter New Address</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Form Inputs */}
              {(selectedAddressId === "NEW" || savedAddresses.length === 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-[#1C140D] mb-1.5">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] text-sm text-[#1C140D] focus:bg-white focus:outline-hidden focus:border-[#C45A3C] transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-[#1C140D] mb-1.5">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] text-sm text-[#1C140D] focus:bg-white focus:outline-hidden focus:border-[#C45A3C] transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#1C140D] mb-1.5">
                      Street Address & Apartment *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      placeholder="Enter your street address and house or apartment details"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] text-sm text-[#1C140D] focus:bg-white focus:outline-hidden focus:border-[#C45A3C] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C140D] mb-1.5">City *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="Enter your city"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] text-sm text-[#1C140D] focus:bg-white focus:outline-hidden focus:border-[#C45A3C] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C140D] mb-1.5">
                      State / Division *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      placeholder="Enter your state or division"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] text-sm text-[#1C140D] focus:bg-white focus:outline-hidden focus:border-[#C45A3C] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C140D] mb-1.5">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      placeholder="Enter your postal code"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] text-sm text-[#1C140D] focus:bg-white focus:outline-hidden focus:border-[#C45A3C] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C140D] mb-1.5">Country</label>
                    <input
                      type="text"
                      disabled
                      value={addressForm.country}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCCF] bg-[#F5EDE4]/60 text-sm text-[#634E3F] cursor-not-allowed"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCCF] shadow-xs space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#E8DCCF]">
                <div className="w-7 h-7 rounded-full bg-[#F5EDE4] text-[#C45A3C] font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h2 className="font-serif text-xl font-bold text-[#1C140D]">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cash on Delivery */}
                <label
                  className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                    paymentMethod === "COD"
                      ? "border-[#C45A3C] bg-[#FAF7F2] ring-1 ring-[#C45A3C]"
                      : "border-[#E8DCCF] bg-white hover:border-[#634E3F]/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="mt-1 accent-[#C45A3C]"
                  />
                  <div>
                    <span className="block text-sm font-bold text-[#1C140D]">Cash on Delivery</span>
                    <span className="block text-xs text-[#634E3F] mt-0.5">
                      Pay with cash or mobile money upon receiving your package at your doorstep.
                    </span>
                  </div>
                </label>

                {/* Card */}
                <label
                  className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                    paymentMethod === "CARD"
                      ? "border-[#C45A3C] bg-[#FAF7F2] ring-1 ring-[#C45A3C]"
                      : "border-[#E8DCCF] bg-white hover:border-[#634E3F]/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === "CARD"}
                    onChange={() => setPaymentMethod("CARD")}
                    className="mt-1 accent-[#C45A3C]"
                  />
                  <div>
                    <span className="block text-sm font-bold text-[#1C140D] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#C45A3C]" /> Card Payment
                    </span>
                    <span className="block text-xs text-[#634E3F] mt-0.5">
                      Secure payment with Visa, MasterCard, or American Express.
                    </span>
                  </div>
                </label>

                {/* bKash */}
                <label
                  className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                    paymentMethod === "BKASH"
                      ? "border-[#C45A3C] bg-[#FAF7F2] ring-1 ring-[#C45A3C]"
                      : "border-[#E8DCCF] bg-white hover:border-[#634E3F]/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BKASH"
                    checked={paymentMethod === "BKASH"}
                    onChange={() => setPaymentMethod("BKASH")}
                    className="mt-1 accent-[#C45A3C]"
                  />
                  <div>
                    <span className="block text-sm font-bold text-[#D12053]">bKash Direct</span>
                    <span className="block text-xs text-[#634E3F] mt-0.5">
                      Instant mobile checkout through Bangladesh bKash gateway.
                    </span>
                  </div>
                </label>

                {/* Nagad */}
                <label
                  className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                    paymentMethod === "NAGAD"
                      ? "border-[#C45A3C] bg-[#FAF7F2] ring-1 ring-[#C45A3C]"
                      : "border-[#E8DCCF] bg-white hover:border-[#634E3F]/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="NAGAD"
                    checked={paymentMethod === "NAGAD"}
                    onChange={() => setPaymentMethod("NAGAD")}
                    className="mt-1 accent-[#C45A3C]"
                  />
                  <div>
                    <span className="block text-sm font-bold text-[#F7931E]">Nagad Wallet</span>
                    <span className="block text-xs text-[#634E3F] mt-0.5">
                      Fast and secure mobile payment via Nagad.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* 3. Gift Note & Instructions */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCCF] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2">
                <div className="w-7 h-7 rounded-full bg-[#F5EDE4] text-[#C45A3C] font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h2 className="font-serif text-xl font-bold text-[#1C140D]">
                  Artisanal Gifting & Notes
                </h2>
              </div>
              <p className="text-xs text-[#634E3F]">
                Sending this as a luxurious present? Include a personalized handwritten note card on textured parchment.
              </p>
              <textarea
                rows={3}
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                placeholder="Enter your personal gift message or delivery instructions..."
                className="w-full px-4 py-3 rounded-xl border border-[#E8DCCF] bg-[#FAF7F2] text-sm text-[#1C140D] placeholder-[#634E3F]/60 focus:bg-white focus:outline-hidden focus:border-[#C45A3C] transition-colors"
              />
            </div>
          </div>

          {/* Right Column: Order Summary & Placement (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8DCCF] shadow-sm sticky top-24 space-y-6">
              <h2 className="font-serif text-xl font-bold text-[#1C140D] pb-3 border-b border-[#E8DCCF]">
                Order Items ({totalQuantity})
              </h2>

              {/* Items List Preview */}
              <div className="max-h-60 overflow-y-auto divide-y divide-[#E8DCCF] pr-1 space-y-3">
                {items.map((item) => {
                  const effectivePrice = item.salePrice != null ? item.salePrice : item.price;
                  return (
                    <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg bg-[#F5EDE4] overflow-hidden shrink-0 border border-[#E8DCCF]/50">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-[#634E3F] m-auto" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#1C140D] truncate">{item.name}</p>
                        {item.selectedFlavor && (
                          <p className="text-[10px] font-semibold text-[#C45A3C] uppercase tracking-wider">
                            Flavor: {item.selectedFlavor}
                          </p>
                        )}
                        <p className="text-[11px] text-[#634E3F]">
                          Qty: {item.quantity} × ${effectivePrice.toFixed(2)}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#1C140D]">
                        ${(effectivePrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Loyalty Points Redemption (if logged in) */}
              {user && user.cocoaPoints > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#F5EDE4]/70 border border-[#E8DCCF] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1C140D] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" /> Cocoa Points Balance
                    </span>
                    <span className="font-bold text-[#C45A3C]">{user.cocoaPoints} pts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={maxRedeemablePoints}
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(Math.min(maxRedeemablePoints, Math.max(0, parseInt(e.target.value) || 0)))}
                      placeholder="0"
                      className="w-20 px-2.5 py-1.5 bg-white border border-[#E8DCCF] rounded-lg text-xs font-bold text-center text-[#1C140D]"
                    />
                    <span className="text-[11px] text-[#634E3F]">
                      Redeem points ($1 discount per point)
                    </span>
                  </div>
                </div>
              )}

              {/* Price Calculation Breakdown */}
              <div className="space-y-2.5 text-sm pt-2 border-t border-[#E8DCCF]">
                <div className="flex items-center justify-between text-[#634E3F]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1C140D]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-[#634E3F]">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Shipping
                  </span>
                  <span className="font-semibold text-[#1C140D]">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold">Complimentary</span>
                    ) : (
                      `$${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                {pointsDiscount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-semibold text-xs">
                    <span>Points Redemption Discount</span>
                    <span>-${pointsDiscount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t border-[#E8DCCF] flex items-baseline justify-between">
                <div>
                  <span className="font-serif text-lg font-bold text-[#1C140D]">Total</span>
                  <span className="text-[11px] text-[#634E3F] block">Taxes included</span>
                </div>
                <div className="font-serif text-2xl font-bold text-[#C45A3C]">
                  ${totalAmount.toFixed(2)}
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[#C45A3C] hover:bg-[#a8492e] disabled:opacity-60 disabled:cursor-not-allowed text-[#FAF7F2] rounded-2xl font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Authorizing Order...
                  </>
                ) : (
                  <>
                    Place Order · ${totalAmount.toFixed(2)} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-[#634E3F] flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Guaranteed fresh, temperature-controlled packaging
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
