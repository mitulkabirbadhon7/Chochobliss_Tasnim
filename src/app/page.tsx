import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center py-20 px-6 text-center">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5EDE4] border border-[#E8DCCF] text-xs font-semibold text-[#634E3F] tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
          <span>Small-Batch Artisanal Confectionery</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1C140D] leading-[1.15]">
          Pure Indulgence, Handcrafted with Cacao Nuance.
        </h1>

        <p className="text-base sm:text-lg text-[#634E3F] max-w-2xl mx-auto leading-relaxed">
          Celebrating rare, single-origin cacao from Madagascar, Ecuador, and Colombia, tempered to silk perfection by Tasnim in Dhaka.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#C45A3C] hover:bg-[#a8492e] text-[#FAF7F2] rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg"
          >
            Explore The Collection <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/story"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-[#E8DCCF] bg-[#F5EDE4]/50 hover:bg-[#F5EDE4] text-[#1C140D] rounded-full text-sm font-semibold transition-all"
          >
            Our Story & Craft
          </Link>
        </div>
      </div>
    </div>
  );
}
