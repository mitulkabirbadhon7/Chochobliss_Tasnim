"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch } from "@/store/hooks";
import { addItem, setCartOpen } from "@/store/slices/cartSlice";
import {
  createReview,
  checkIsVerifiedBuyerAction,
  getProductReviewsAction,
} from "@/lib/actions/review";
import {
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  Check,
  ArrowRight,
  Heart,
  Share2,
  Star,
  MessageSquareQuote,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number | string;
    salePrice?: number | string | null;
    inventory: number;
    cacaoPercentage?: number | null;
    origin?: string | null;
    flavorNotes: string[];
    ingredients?: string | null;
    allergens: string[];
    weight?: string | null;
    images: string[];
    hoverImage?: string | null;
    flavors?: string[];
    category: string;
  };
  relatedProducts: Array<{
    id: string;
    name: string;
    slug: string;
    price: number | string;
    salePrice?: number | string | null;
    inventory: number;
    cacaoPercentage?: number | null;
    images: string[];
    category: string;
  }>;
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailProps) {
  const dispatch = useAppDispatch();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "ingredients" | "shipping">("notes");

  // Effective Flavors: Use database flavors, or parse from description (e.g. 1.Dark 2.White Milk 3.Chochonut), or category default
  const effectiveFlavors = React.useMemo(() => {
    const cleanFlavorList = (list: string[]) =>
      list
        .map((f) => f.replace(/^[0-9]+[\.\)\s-]+/, "").trim())
        .filter(Boolean);

    if (product.flavors && product.flavors.length > 0) {
      const cleaned = cleanFlavorList(product.flavors);
      if (cleaned.length > 0) return cleaned;
    }
    if (product.description) {
      const match = product.description.match(/(?:[1-9][\.\)]|\b(?:flavor|flavour)s?[:\s]*)([^,\n\r]+)/gi);
      if (match && match.length > 1) {
        const parsed = cleanFlavorList(
          match.map((m) => m.replace(/^[1-9][\.\)]\s*|(?:flavor|flavour)s?[:\s]*/i, "").trim())
        );
        if (parsed.length > 0) return parsed;
      }
    }
    if (product.category === "Bar" || product.name.toLowerCase().includes("bar")) {
      return ["Dark", "White Milk", "Chochonut"];
    }
    if (product.category === "mini" || product.name.toLowerCase().includes("mini")) {
      return ["Dark", "White", "Chochonut"];
    }
    if (product.category === "Customized Bar") {
      return ["Dark 72%", "White Milk", "Roasted Pistachio Slab", "Custom Blend"];
    }
    return [];
  }, [product.flavors, product.description, product.category, product.name]);

  // Task 4: Mandatory Flavor Selection
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(
    effectiveFlavors.length > 0 ? effectiveFlavors[0] : null
  );

  // Sync selectedFlavor when effectiveFlavors changes
  useEffect(() => {
    if (!selectedFlavor && effectiveFlavors.length > 0) {
      setSelectedFlavor(effectiveFlavors[0]);
    }
  }, [effectiveFlavors, selectedFlavor]);

  // Task 5: Verified Customer Reviews State
  const [reviews, setReviews] = useState<
    Array<{
      id: string;
      rating: number;
      title: string | null;
      comment: string;
      createdAt: Date;
      user: { name: string | null; email: string };
    }>
  >([]);
  const [isVerifiedBuyer, setIsVerifiedBuyer] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);
  const [reviewErrorMsg, setReviewErrorMsg] = useState<string | null>(null);

  const numericPrice = Number(product.price);
  const numericSalePrice = product.salePrice != null ? Number(product.salePrice) : null;
  const effectivePrice = numericSalePrice ?? numericPrice;
  const isOutOfStock = product.inventory <= 0;
  const isLowStock = product.inventory > 0 && product.inventory <= 5;
  const discountPercent = numericSalePrice
    ? Math.round(((numericPrice - numericSalePrice) / numericPrice) * 100)
    : 0;

  const currentImage =
    product.images[selectedImageIndex] ||
    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1200&q=80";

  const requiresFlavor = effectiveFlavors.length > 0;
  const isFlavorMissing = requiresFlavor && !selectedFlavor;

  // Fetch approved reviews and buyer verification on mount
  useEffect(() => {
    let isMounted = true;
    getProductReviewsAction(product.id).then((res) => {
      if (isMounted && res.success) {
        setReviews(res.data);
      }
    });

    checkIsVerifiedBuyerAction(product.id).then((res) => {
      if (isMounted && res.success) {
        setIsVerifiedBuyer(res.data.isVerified);
        setIsAuthenticated(res.data.isAuthenticated);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [product.id]);

  const handleAddToCart = () => {
    if (isOutOfStock || isFlavorMissing) return;

    dispatch(
      addItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: numericPrice,
        salePrice: numericSalePrice,
        image: currentImage,
        cacaoPercentage: product.cacaoPercentage,
        weight: product.weight,
        selectedFlavor: selectedFlavor || null,
        quantity,
      })
    );

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
    dispatch(setCartOpen(true));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSuccessMsg(null);
    setReviewErrorMsg(null);

    if (!reviewComment.trim()) {
      setReviewErrorMsg("Please enter your reflection or comment.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await createReview({
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle.trim() || null,
        comment: reviewComment.trim(),
      });

      if (res.success) {
        setReviewSuccessMsg(res.data.message);
        setReviewTitle("");
        setReviewComment("");
      } else {
        setReviewErrorMsg(res.error.message || "Failed to submit review.");
      }
    } catch {
      setReviewErrorMsg("An unexpected error occurred while submitting your review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const potentialPoints = Math.floor(effectivePrice * quantity);
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  return (
    <div className="space-y-16">
      {/* 1. Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Gallery Column */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#F5EDE4] border border-[#E8DCCF] shadow-sm">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />

            {/* Floating Cacao Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {product.cacaoPercentage && (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-[#1C140D]/85 text-[#F5EDE4] backdrop-blur-md shadow-xs">
                  {product.cacaoPercentage}% Cacao
                </span>
              )}
              {numericSalePrice && (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-[#C45A3C] text-[#FAF7F2] shadow-xs">
                  Save {discountPercent}%
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImageIndex === idx
                      ? "border-[#C45A3C] shadow-sm"
                      : "border-[#E8DCCF] opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions Column */}
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-[#634E3F]">
              <span className="text-[#C45A3C]">{product.category}</span>
              {product.origin && (
                <>
                  <span>•</span>
                  <span>{product.origin}</span>
                </>
              )}
              {product.weight && (
                <>
                  <span>•</span>
                  <span>{product.weight}</span>
                </>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1C140D] leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars Summary */}
            <div className="flex items-center gap-2 pt-1 text-xs text-[#634E3F]">
              <div className="flex text-[#D4A853]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="font-bold text-[#1C140D]">{averageRating}</span>
              <span>({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="font-serif text-3xl font-bold text-[#1C140D]">
                ${effectivePrice.toFixed(2)}
              </span>
              {numericSalePrice && (
                <span className="text-lg text-[#634E3F] line-through font-medium">
                  ${numericPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-base text-[#634E3F] leading-relaxed">
            {product.description}
          </p>

          {/* Flavor Notes Tags */}
          {product.flavorNotes.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#1C140D] block">
                Tasting Notes:
              </span>
              <div className="flex flex-wrap gap-2">
                {product.flavorNotes.map((note) => (
                  <span
                    key={note}
                    className="px-3 py-1 rounded-full bg-[#F5EDE4] text-xs font-medium text-[#1C140D] border border-[#E8DCCF]"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Task 4: Mandatory Flavor Selection UI */}
          {effectiveFlavors.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider font-bold text-[#1C140D] flex items-center gap-1.5">
                  <span>Select Flavor / Confection Type</span>
                  <span className="text-red-500">*</span>
                </label>
                {selectedFlavor && (
                  <span className="text-xs font-semibold text-[#C45A3C]">
                    Chosen: {selectedFlavor}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5">
                {effectiveFlavors.map((flavor) => {
                  const isSelected = selectedFlavor === flavor;
                  return (
                    <button
                      key={flavor}
                      type="button"
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? "bg-[#1C140D] text-[#FAF7F2] border-[#1C140D] shadow-sm scale-102"
                          : "bg-white text-[#634E3F] border-[#E8DCCF] hover:border-[#1C140D] hover:text-[#1C140D]"
                      }`}
                    >
                      {flavor}
                    </button>
                  );
                })}
              </div>

              {isFlavorMissing && (
                <p className="text-xs text-[#C45A3C] font-semibold">
                  Please select an available flavor above to enable adding to your bag.
                </p>
              )}
            </div>
          )}

          {/* Stock Availability Indicator */}
          <div>
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C45A3C]">
                ● Currently Sold Out
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4A853]">
                ● Micro-Batch: Only {product.inventory} units available
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800">
                ● In Stock & Ready for Temperature-Controlled Dispatch
              </span>
            )}
          </div>

          {/* Quantity & Add to Cart Controls */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center border border-[#E8DCCF] rounded-full bg-white px-3 py-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-1.5 text-[#634E3F] hover:text-[#1C140D] disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-sm text-[#1C140D]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                  disabled={quantity >= product.inventory || isOutOfStock}
                  className="p-1.5 text-[#634E3F] hover:text-[#1C140D] disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isFlavorMissing}
                className={`flex-1 w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm transition-all shadow-md ${
                  isOutOfStock || isFlavorMissing
                    ? "bg-[#E8DCCF] text-[#634E3F] cursor-not-allowed"
                    : isAdded
                    ? "bg-[#D4A853] text-[#1C140D]"
                    : "bg-[#1C140D] hover:bg-[#C45A3C] text-[#FAF7F2] hover:shadow-lg"
                }`}
              >
                {isOutOfStock ? (
                  "Sold Out"
                ) : isFlavorMissing ? (
                  "Choose a Flavor to Add"
                ) : isAdded ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Your Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Artisanal Bag • ${(effectivePrice * quantity).toFixed(2)}
                  </>
                )}
              </button>
            </div>

            {/* Loyalty Points Reminder */}
            <div className="flex items-center gap-2 text-xs text-[#D4A853] font-semibold pt-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Earn +{potentialPoints} Cocoa Points on this order</span>
            </div>
          </div>

          {/* Guarantees Strip */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#E8DCCF]">
            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-[#C45A3C] shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="block text-[#1C140D]">Thermal Foil Packaging</strong>
                <span className="text-[#634E3F]">Guaranteed to arrive unmelted.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#D4A853] shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="block text-[#1C140D]">Ethical Cacao</strong>
                <span className="text-[#634E3F]">100% direct-trade sourced.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Ingredient & Sourcing Tabs */}
      <div className="bg-white rounded-3xl border border-[#E8DCCF] p-8 sm:p-10 shadow-xs space-y-6">
        <div className="flex border-b border-[#E8DCCF] gap-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`pb-3 transition-colors border-b-2 ${
              activeTab === "notes" ? "border-[#C45A3C] text-[#C45A3C]" : "border-transparent text-[#634E3F] hover:text-[#1C140D]"
            }`}
          >
            Tasting & Origin
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ingredients")}
            className={`pb-3 transition-colors border-b-2 ${
              activeTab === "ingredients" ? "border-[#C45A3C] text-[#C45A3C]" : "border-transparent text-[#634E3F] hover:text-[#1C140D]"
            }`}
          >
            Ingredients & Allergens
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("shipping")}
            className={`pb-3 transition-colors border-b-2 ${
              activeTab === "shipping" ? "border-[#C45A3C] text-[#C45A3C]" : "border-transparent text-[#634E3F] hover:text-[#1C140D]"
            }`}
          >
            Delivery & Storage
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "notes" && (
          <div className="space-y-4 text-sm text-[#634E3F] leading-relaxed">
            <h4 className="font-serif text-lg font-bold text-[#1C140D]">Terroir Profile</h4>
            <p>
              Sourced directly from certified heritage micro-lots. Our beans undergo controlled wooden-box fermentation and sun-drying on raised beds before small-batch roasting in our Dhaka atelier.
            </p>
            {product.origin && (
              <p>
                <strong>Geographical Origin:</strong> {product.origin}
              </p>
            )}
          </div>
        )}

        {activeTab === "ingredients" && (
          <div className="space-y-4 text-sm text-[#634E3F] leading-relaxed">
            <h4 className="font-serif text-lg font-bold text-[#1C140D]">Purity Guarantee</h4>
            <p>
              {product.ingredients || "Direct-trade cacao beans, organic cane sugar, pure cocoa butter."}
            </p>
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF]">
              <strong className="block text-xs uppercase tracking-wider text-[#1C140D] mb-1">
                Allergen Statement:
              </strong>
              <p className="text-xs text-[#634E3F]">
                {product.allergens.length > 0
                  ? `Contains: ${product.allergens.join(", ")}. Handcrafted in an artisanal kitchen handling tree nuts, dairy, and sesame.`
                  : "Naturally dairy-free, vegan-friendly, and gluten-free. Handcrafted in a facility that also processes tree nuts."}
              </p>
            </div>
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="space-y-4 text-sm text-[#634E3F] leading-relaxed">
            <h4 className="font-serif text-lg font-bold text-[#1C140D]">Artisanal Preservation</h4>
            <p>
              Store between 15°C and 18°C (59°F – 64°F) in a cool, odor-free dry pantry away from direct sunlight. Do not refrigerate unsealed bars to prevent condensation blooming.
            </p>
            <p>
              Every order is shipped in insulated thermal envelopes with food-safe cooling packs, ensuring impeccable snap and gloss upon arrival.
            </p>
          </div>
        )}
      </div>

      {/* 3. Verified Customer Reviews Section (Task 5) */}
      <section className="bg-white rounded-3xl border border-[#E8DCCF] p-8 sm:p-10 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8DCCF]">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#C45A3C] font-bold block mb-1">
              Verified Impressions
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C140D]">
              Customer Reviews
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex text-[#D4A853]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <span className="font-serif text-2xl font-bold text-[#1C140D]">{averageRating}</span>
            <span className="text-xs text-[#634E3F]">({reviews.length} approved)</span>
          </div>
        </div>

        {/* Write a Review Section (Verified Buyers Only) */}
        <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E8DCCF] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-lg font-bold text-[#1C140D]">
              Share Your Connoisseur Reflection
            </h4>
            {isVerifiedBuyer && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Buyer
              </span>
            )}
          </div>

          {isVerifiedBuyer ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {reviewSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
                  {reviewSuccessMsg}
                </div>
              )}
              {reviewErrorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium">
                  {reviewErrorMsg}
                </div>
              )}

              {/* Star Rating Picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#1C140D]">Rating:</span>
                <div className="flex gap-1 text-[#D4A853]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= reviewRating ? "fill-current" : "text-[#E8DCCF]"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Review title (e.g. Exceptional depth of cacao)"
                  className="w-full bg-white border border-[#E8DCCF] rounded-xl px-4 py-2.5 text-xs text-[#1C140D] focus:outline-hidden focus:border-[#C45A3C]"
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe your tasting experience, snap, aroma, and finish..."
                  className="w-full bg-white border border-[#E8DCCF] rounded-xl p-3.5 text-xs text-[#1C140D] focus:outline-hidden focus:border-[#C45A3C]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-6 py-2.5 rounded-full bg-[#1C140D] hover:bg-[#C45A3C] text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isSubmittingReview ? "Submitting..." : "Submit Review for Moderation"}
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-[#E8DCCF]">
              <ShieldCheck className="w-5 h-5 text-[#D4A853] shrink-0" />
              <p className="text-xs text-[#634E3F]">
                {isAuthenticated
                  ? "Only verified buyers who have received a delivered order of this product can submit a review."
                  : "Only verified buyers can review this product. Please sign in with your customer account."}
              </p>
            </div>
          )}
        </div>

        {/* Approved Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#634E3F] italic">
              No customer reviews published yet. Be the first verified buyer to share your thoughts!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8DCCF] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex text-[#D4A853]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] text-[#634E3F]">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {rev.title && (
                    <h5 className="font-serif text-sm font-bold text-[#1C140D]">
                      {rev.title}
                    </h5>
                  )}

                  <p className="text-xs text-[#634E3F] leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-[#1C140D] font-medium">
                    <span>{rev.user.name || "Customer"}</span>
                    <span className="text-emerald-700 font-semibold">• Verified Buyer</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Related Artisanal Creations */}
      {relatedProducts.length > 0 && (
        <div className="space-y-8 pt-8">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C140D]">
              You May Also Savor
            </h3>
            <Link href="/shop" className="text-xs font-semibold text-[#C45A3C] hover:underline flex items-center gap-1">
              View Boutique <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                className="bg-white rounded-2xl border border-[#E8DCCF] overflow-hidden p-4 space-y-3 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <Link href={`/shop/${rel.slug}`} className="relative aspect-4/3 rounded-xl overflow-hidden bg-[#F5EDE4] block">
                  <Image
                    src={rel.images[0] || "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80"}
                    alt={rel.name}
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                </Link>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#634E3F] font-semibold">
                    {rel.category}
                  </span>
                  <Link href={`/shop/${rel.slug}`} className="block hover:text-[#C45A3C]">
                    <h4 className="font-serif text-base font-bold text-[#1C140D] truncate">
                      {rel.name}
                    </h4>
                  </Link>
                  <span className="text-sm font-bold text-[#1C140D] mt-1 block">
                    ${Number(rel.salePrice ?? rel.price).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
