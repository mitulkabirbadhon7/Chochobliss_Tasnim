import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl border border-[#E8DCCF] shadow-sm">
        <span className="font-serif text-6xl font-bold text-[#C45A3C] block mb-2">404</span>
        <h2 className="font-serif text-2xl font-bold text-[#1C140D] mb-3">
          Confection Not Found
        </h2>
        <p className="text-sm text-[#634E3F] mb-8 leading-relaxed">
          The artisanal creation or destination you are searching for might have been retired or moved to another shelf in our boutique.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C45A3C] hover:bg-[#a8492e] text-[#FAF7F2] rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Storefront
        </Link>
      </div>
    </div>
  );
}
