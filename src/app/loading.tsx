import React from "react";
import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full bg-[#F5EDE4] flex items-center justify-center animate-pulse border border-[#E8DCCF]">
          <Sparkles className="w-8 h-8 text-[#C45A3C] animate-spin duration-1000" />
        </div>
      </div>
      <h3 className="font-serif text-xl font-bold text-[#1C140D] mb-1">
        Chocobliss by Tasnim
      </h3>
      <p className="text-xs uppercase tracking-widest text-[#634E3F] font-semibold">
        Tempering Artisanal Indulgence...
      </p>
    </div>
  );
}
