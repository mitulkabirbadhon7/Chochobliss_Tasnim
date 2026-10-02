"use client";

import React from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF7F2] text-[#1C140D] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl border border-[#E8DCCF] shadow-sm text-center space-y-4">
          <span className="font-serif text-5xl font-bold text-[#C45A3C] block mb-1">Notice</span>
          <h2 className="font-serif text-2xl font-bold text-[#1C140D]">
            An unexpected error occurred
          </h2>
          <p className="text-sm text-[#634E3F] leading-relaxed">
            {error?.message || "Our artisanal boutique is experiencing a temporary issue. Please try reloading."}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-6 py-2.5 bg-[#C45A3C] hover:bg-[#a8492e] text-white rounded-full text-xs uppercase tracking-wider font-semibold transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-2.5 bg-[#1C140D] hover:bg-[#2A1D13] text-white rounded-full text-xs uppercase tracking-wider font-semibold transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
