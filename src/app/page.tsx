import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, Award } from "lucide-react";
import { HeroCanvas } from "@/components/canvas/HeroCanvas";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* 1. Hero Canvas Scroll Sequence */}
      <HeroCanvas totalFrames={120} framePrefix="/frames/ezgif-frame-" frameExtension=".jpg" />

      {/* 2. Brand Teaser & Pillars Section */}
      <section className="py-24 px-6 bg-[#FAF7F2] border-t border-[#E8DCCF]">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5EDE4] border border-[#E8DCCF] text-xs font-semibold text-[#634E3F] tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
              <span>Small-Batch Confectionery Craft</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1C140D]">
              Artisanal Dedication in Every Batch
            </h2>

            <p className="text-base sm:text-lg text-[#634E3F] leading-relaxed">
              Every bar and truffle created by Tasnim begins with direct-trade single-origin cacao, roasted with precision and conched slowly to preserve terroir-driven flavors.
            </p>
          </div>

          {/* Three Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="p-8 rounded-2xl bg-white border border-[#E8DCCF] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F5EDE4] text-[#C45A3C] flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1C140D]">Single-Origin Cacao</h3>
              <p className="text-sm text-[#634E3F] leading-relaxed">
                Directly harvested beans from Madagascar (72%), Ecuador (85%), and Colombia. Pure terroir without synthetic vanilla or filler oils.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#E8DCCF] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F5EDE4] text-[#D4A853] flex items-center justify-center font-bold">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1C140D]">Micro-Batch Tempering</h3>
              <p className="text-sm text-[#634E3F] leading-relaxed">
                Hand-poured and tempered in controlled micro-batches to guarantee a crystalline snap and a velvety melt-in-mouth texture.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#E8DCCF] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F5EDE4] text-[#C45A3C] flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1C140D]">Ethical Sourcing</h3>
              <p className="text-sm text-[#634E3F] leading-relaxed">
                Fair farmer premiums, biodegradable protective wrapping, and complete transparency from farm to foil.
              </p>
            </div>
          </div>

          {/* CTA Link */}
          <div className="text-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#C45A3C] hover:bg-[#a8492e] text-[#FAF7F2] rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Explore The Chocolate Shop <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
