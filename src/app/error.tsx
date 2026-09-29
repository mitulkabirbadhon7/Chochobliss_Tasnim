"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Client-side error log
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-[#E8DCCF] shadow-sm">
        <div className="w-14 h-14 rounded-full bg-[#C45A3C]/10 text-[#C45A3C] flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h2 className="font-serif text-2xl font-bold text-[#1C140D] mb-2">
          An Unexpected Interruption
        </h2>
        <p className="text-sm text-[#634E3F] mb-6">
          We encountered a temporary issue while crafting your chocolate experience. Please try refreshing or return to the storefront.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C45A3C] hover:bg-[#a8492e] text-[#FAF7F2] rounded-xl text-sm font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-[#E8DCCF] bg-[#FAF7F2] hover:bg-[#F5EDE4] text-[#1C140D] rounded-xl text-sm font-semibold transition-colors"
          >
            <Home className="w-4 h-4" /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
