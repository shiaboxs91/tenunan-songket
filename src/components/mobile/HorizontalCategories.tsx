"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function HorizontalCategories() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || searchParams.get("q") || "";
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('categories')
          .select('name')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setCategories(data?.map(c => c.name) || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to empty array
        setCategories([]);
      }
    }

    fetchCategories();
  }, []);

  // Scroll active category into view
  useEffect(() => {
    if (scrollRef.current && currentCategory) {
      const activeEl = scrollRef.current.querySelector(`[data-category="${currentCategory}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [currentCategory]);

  return (
    <div className="md:hidden sticky top-[57px] z-30 bg-white border-b border-slate-100 shadow-sm">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* All products */}
        <Link
          href="/products"
          data-category=""
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
            "border whitespace-nowrap",
            !currentCategory
              ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/25"
              : "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-700"
          )}
        >
          Semua
        </Link>

        {/* Category pills */}
        {categories.map((category) => {
          const isActive = currentCategory.toLowerCase() === category.toLowerCase();
          return (
            <Link
              key={category}
              href={`/products?category=${encodeURIComponent(category)}`}
              data-category={category}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
                "border whitespace-nowrap",
                isActive
                  ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/25"
                  : "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-700"
              )}
            >
              {category}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
