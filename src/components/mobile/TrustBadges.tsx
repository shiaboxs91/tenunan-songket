"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const badges = [
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "100% Asli",
    desc: "Produk Original",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    icon: "M5 13l4 4L19 7",
    title: "Handmade",
    desc: "Buatan Tangan",
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    title: "Pengiriman Aman",
    desc: "Packing Rapi",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Harga Terbaik",
    desc: "Langsung Pengrajin",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    title: "Garansi Kualitas",
    desc: "Jaminan Mutu",
    color: "from-rose-500 to-rose-600",
    bgColor: "bg-rose-50",
  },
];

export function TrustBadges() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, []);

  return (
    <div className="relative md:hidden py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50">
      {/* Scroll indicators */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {badges.map((badge, index) => (
          <div
            key={index}
            className={cn(
              "flex-shrink-0 snap-start",
              "flex items-center gap-2.5 px-3 py-2.5 rounded-xl",
              "border border-slate-100 shadow-sm",
              badge.bgColor
            )}
          >
            {/* Icon */}
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center",
              "bg-gradient-to-br shadow-sm",
              badge.color
            )}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={badge.icon} />
              </svg>
            </div>

            {/* Text */}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">{badge.title}</p>
              <p className="text-[10px] text-slate-500 whitespace-nowrap">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
