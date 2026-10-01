"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  AlertCircle,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import {
  getAdminReviewsAction,
  approveReviewAction,
  rejectReviewAction,
} from "@/lib/actions/review";
import { ReviewStatus } from "@/lib/constants/reviews";

interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  status: ReviewStatus;
  createdAt: Date;
  productName: string;
  userName: string;
  userEmail: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [filter, setFilter] = useState<"ALL" | ReviewStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchReviews = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await getAdminReviewsAction();
      if (res.success) {
        setReviews(res.data);
      } else {
        setErrorMsg(res.error.message || "Failed to load customer reviews.");
      }
    } catch {
      setErrorMsg("An unexpected network error occurred while loading reviews.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = (id: string) => {
    startTransition(async () => {
      setErrorMsg(null);
      setSuccessMsg(null);
      const res = await approveReviewAction(id);
      if (res.success) {
        setSuccessMsg("Review approved successfully and published to storefront.");
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: ReviewStatus.APPROVED } : r))
        );
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        setErrorMsg(res.error.message || "Failed to approve review.");
      }
    });
  };

  const handleReject = (id: string) => {
    startTransition(async () => {
      setErrorMsg(null);
      setSuccessMsg(null);
      const res = await rejectReviewAction(id);
      if (res.success) {
        setSuccessMsg("Review has been marked as rejected.");
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: ReviewStatus.REJECTED } : r))
        );
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        setErrorMsg(res.error.message || "Failed to reject review.");
      }
    });
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter !== "ALL" && r.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.productName.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.userEmail.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        (r.title && r.title.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pendingCount = reviews.filter((r) => r.status === ReviewStatus.PENDING).length;
  const approvedCount = reviews.filter((r) => r.status === ReviewStatus.APPROVED).length;
  const rejectedCount = reviews.filter((r) => r.status === ReviewStatus.REJECTED).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C45A3C]">
            Quality & Moderation
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1C140D] mt-0.5">
            Customer Reviews Moderation
          </h1>
          <p className="text-xs text-[#634E3F] mt-1">
            Review and moderate connoisseur reflections submitted by verified purchasers.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReviews}
          disabled={isLoading || isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E8DCCF] text-xs font-semibold text-[#1C140D] hover:bg-[#FAF7F2] transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs">
          <span className="text-xs text-[#634E3F] font-medium">Total Reviews</span>
          <div className="text-2xl font-bold font-serif text-[#1C140D] mt-1">
            {reviews.length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs bg-amber-50/30">
          <span className="text-xs text-amber-800 font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Review
          </span>
          <div className="text-2xl font-bold font-serif text-amber-900 mt-1">
            {pendingCount}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/30">
          <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Published (Approved)
          </span>
          <div className="text-2xl font-bold font-serif text-emerald-900 mt-1">
            {approvedCount}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-2xs bg-rose-50/30">
          <span className="text-xs text-rose-800 font-bold flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected
          </span>
          <div className="text-2xl font-bold font-serif text-rose-900 mt-1">
            {rejectedCount}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 ${
              filter === "ALL"
                ? "bg-[#1C140D] text-[#FAF7F2]"
                : "bg-white text-[#634E3F] border border-[#E8DCCF] hover:bg-[#FAF7F2]"
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter(ReviewStatus.PENDING)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 ${
              filter === ReviewStatus.PENDING
                ? "bg-amber-600 text-white"
                : "bg-white text-[#634E3F] border border-[#E8DCCF] hover:bg-[#FAF7F2]"
            }`}
          >
            Pending Moderation ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter(ReviewStatus.APPROVED)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 ${
              filter === ReviewStatus.APPROVED
                ? "bg-emerald-700 text-white"
                : "bg-white text-[#634E3F] border border-[#E8DCCF] hover:bg-[#FAF7F2]"
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter(ReviewStatus.REJECTED)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 ${
              filter === ReviewStatus.REJECTED
                ? "bg-rose-700 text-white"
                : "bg-white text-[#634E3F] border border-[#E8DCCF] hover:bg-[#FAF7F2]"
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#634E3F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews, products, users..."
            className="w-full bg-white border border-[#E8DCCF] rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-[#1C140D] placeholder-[#634E3F]/60 focus:outline-hidden focus:border-[#C45A3C]"
          />
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-[#E8DCCF] shadow-xs overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-16 px-4">
            <ShieldCheck className="w-12 h-12 text-[#E8DCCF] mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#1C140D]">No Reviews Found</h3>
            <p className="text-xs text-[#634E3F] mt-1">
              {searchQuery ? "No customer reviews match your search parameters." : "Queue is currently empty."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8DCCF]">
            {filteredReviews.map((rev) => (
              <div key={rev.id} className="p-6 hover:bg-[#FAF7F2]/40 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {/* Stars */}
                    <div className="flex text-[#D4A853]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>

                    <span className="font-semibold text-xs text-[#1C140D]">
                      {rev.productName}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        rev.status === ReviewStatus.APPROVED
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : rev.status === ReviewStatus.REJECTED
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>

                  <span className="text-[11px] text-[#634E3F]">
                    {new Date(rev.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Review Content */}
                <div className="space-y-1">
                  {rev.title && (
                    <h4 className="font-serif text-sm font-bold text-[#1C140D]">
                      {rev.title}
                    </h4>
                  )}
                  <p className="text-xs text-[#634E3F] leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                {/* Author Info & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E8DCCF]/50">
                  <div className="flex items-center gap-2 text-xs text-[#634E3F]">
                    <span className="font-semibold text-[#1C140D]">{rev.userName}</span>
                    <span>({rev.userEmail})</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                      • Verified Buyer
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {rev.status !== ReviewStatus.APPROVED && (
                      <button
                        type="button"
                        onClick={() => handleApprove(rev.id)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-2xs disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {rev.status !== ReviewStatus.REJECTED && (
                      <button
                        type="button"
                        onClick={() => handleReject(rev.id)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
