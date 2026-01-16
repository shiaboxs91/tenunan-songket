"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { LayoutGrid, X, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoriesWithProductCount, getTotalProductCount } from "@/lib/supabase/categories-client";
import type { Category } from "@/lib/supabase/categories-client";

interface CategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategorySheet({ open, onOpenChange }: CategorySheetProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<(Category & { product_count: number })[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  async function loadCategories() {
    setLoading(true);
    try {
      const [categoriesData, total] = await Promise.all([
        getCategoriesWithProductCount(),
        getTotalProductCount(),
      ]);
      setCategories(categoriesData);
      setTotalProducts(total);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleCategorySelect = (category: string) => {
    onOpenChange(false);
    router.push(`/products?category=${encodeURIComponent(category)}`);
  };

  const handleViewAll = () => {
    onOpenChange(false);
    router.push("/products");
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 md:hidden animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet */}
      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden",
          "bg-white rounded-t-3xl shadow-2xl",
          "animate-in slide-in-from-bottom duration-300",
          "max-h-[85vh] overflow-hidden flex flex-col"
        )}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Kategori</h2>
              <p className="text-xs text-slate-500">Pilih corak kegemaran anda</p>
            </div>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {/* View All Button */}
          <button
            onClick={handleViewAll}
            className="w-full mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 flex items-center justify-between group hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <Sparkles className="h-6 w-6 text-amber-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-800">Semua Produk</p>
                <p className="text-xs text-slate-500">{totalProducts} produk tersedia</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Category Grid */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.name)}
                  className={cn(
                    "relative overflow-hidden rounded-2xl aspect-[4/3] group",
                    "animate-in fade-in slide-in-from-bottom-2",
                    "hover:shadow-xl transition-all duration-300"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Background Image */}
                  <Image
                    src={category.image_url || '/images/placeholder-product.svg'}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 200px"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 p-3 flex flex-col justify-end">
                    <h3 className="text-white font-bold text-sm leading-tight drop-shadow-lg">
                      {category.name}
                    </h3>
                    <p className="text-white/80 text-[10px] mt-0.5">
                      {category.product_count} produk
                    </p>
                  </div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-amber-500/20 to-transparent" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Safe area for iOS */}
        <div className="h-safe-area-inset-bottom bg-white" />
      </div>
    </>
  );
}
