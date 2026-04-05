"use client";

import { useState } from "react";
import { FileText, Star, Package } from "lucide-react";
import { ProductReviews } from "./ProductReviews";
import { cn } from "@/lib/utils";

interface ProductDetailTabsProps {
  description: string;
  category: string;
  productId: string;
  productRating: number;
  totalReviews: number;
  details?: {
    weight?: number;
  };
}

type TabId = "description" | "reviews";

export function ProductDetailTabs({
  description,
  category,
  productId,
  productRating,
  totalReviews,
  details,
}: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");

  return (
    <div className="mt-12">
      {/* ===== TAB LIST ===== */}
      <div className="sticky top-[61px] z-10 bg-background">
        <div className="flex border-b border-border">
          {/* Tab: Deskripsi */}
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap",
              "border-b-2 transition-colors duration-200",
              activeTab === "description"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
            )}
          >
            <FileText className="h-4 w-4 flex-shrink-0" />
            <span>Deskripsi</span>
          </button>

          {/* Tab: Ulasan */}
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap",
              "border-b-2 transition-colors duration-200",
              activeTab === "reviews"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
            )}
          >
            <Star className="h-4 w-4 flex-shrink-0" />
            <span>Ulasan</span>
            {totalReviews > 0 && (
              <span
                className={cn(
                  "ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-xs font-semibold",
                  activeTab === "reviews"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary"
                )}
              >
                {totalReviews}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className="pt-6 pb-4 min-h-[120px]">
        {activeTab === "description" && (
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {description || "Tidak ada deskripsi untuk produk ini."}
            </p>
            {category && (
              <p className="text-muted-foreground mt-4">
                <span className="font-semibold text-foreground">Kategori:</span>{" "}
                {category}
              </p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <ProductReviews
            productId={productId}
            productRating={productRating}
            totalReviews={totalReviews}
          />
        )}
      </div>

      {/* ===== DETAIL PRODUK (section tersendiri di bawah tab) ===== */}
      <div className="mt-8 pt-8 border-t border-border">
        <div className="flex items-center gap-2 mb-6">
          <Package className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Detail Produk</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
          <div className="space-y-0">
            <div className="flex justify-between py-2.5 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Kategori</span>
              <span className="text-sm font-medium">{category || "-"}</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Berat</span>
              <span className="text-sm font-medium">
                {details?.weight ? `${details.weight} gram` : "-"}
              </span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Material</span>
              <span className="text-sm font-medium">Benang Sutra / Emas</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Teknik</span>
              <span className="text-sm font-medium">Tenunan Tangan</span>
            </div>
          </div>
          <div className="space-y-0">
            <div className="flex justify-between py-2.5 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Asal</span>
              <span className="text-sm font-medium">Brunei / Sambas</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Keaslian</span>
              <span className="text-sm font-medium">100% Handmade</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Pengiriman</span>
              <span className="text-sm font-medium">Indonesia, Malaysia, Brunei</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Garansi</span>
              <span className="text-sm font-medium">Keaslian Terjamin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
