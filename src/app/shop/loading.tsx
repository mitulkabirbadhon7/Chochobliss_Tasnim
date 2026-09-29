import React from "react";

export default function ShopLoading() {
  return (
    <div className="flex-1 py-12 px-6 bg-[#FAF7F2]">
      <div className="container-custom space-y-10 animate-pulse">
        {/* Header skeleton */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="h-6 w-36 bg-[#E8DCCF] rounded-full mx-auto" />
          <div className="h-10 w-64 bg-[#E8DCCF] rounded-xl mx-auto" />
          <div className="h-4 w-96 bg-[#E8DCCF] rounded-md mx-auto" />
        </div>

        {/* Filter bar skeleton */}
        <div className="h-24 bg-white rounded-2xl border border-[#E8DCCF]" />

        {/* Products grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E8DCCF] overflow-hidden p-4 space-y-4">
              <div className="aspect-4/3 w-full bg-[#E8DCCF] rounded-xl" />
              <div className="h-4 w-24 bg-[#E8DCCF] rounded" />
              <div className="h-6 w-48 bg-[#E8DCCF] rounded" />
              <div className="h-8 w-full bg-[#E8DCCF] rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
