"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { FileText, Star, Package } from "lucide-react";
import { ProductReviews } from "./ProductReviews";

interface ProductDetailTabsProps {
  description: string;
  category: string;
  productId: string;
  productRating: number;
  totalReviews: number;
  details?: {
    weight?: number;
    dimensions?: Record<string, unknown>;
    sourceUrl?: string;
  };
}

export function ProductDetailTabs({
  description,
  category,
  productId,
  productRating,
  totalReviews,
  details,
}: ProductDetailTabsProps) {
  return (
    <div>
      {/* ===== TABS: Deskripsi + Ulasan ===== */}
      <Tabs.Root defaultValue="description" className="mt-12 mb-4">
        {/* Tab List */}
        <Tabs.List className="flex border-b border-border overflow-x-auto scrollbar-none -mb-px sticky top-[61px] bg-background z-10">
          {/* Deskripsi */}
          <Tabs.Trigger
            value="description"
            className="
              flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap
              text-muted-foreground border-b-2 border-transparent
              hover:text-foreground hover:border-muted-foreground/40
              data-[state=active]:text-primary data-[state=active]:border-primary
              transition-colors duration-200 focus-visible:outline-none
            "
          >
            <FileText className="h-4 w-4 flex-shrink-0" />
            <span>Deskripsi</span>
          </Tabs.Trigger>

          {/* Ulasan */}
          <Tabs.Trigger
            value="reviews"
            className="
              flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap
              text-muted-foreground border-b-2 border-transparent
              hover:text-foreground hover:border-muted-foreground/40
              data-[state=active]:text-primary data-[state=active]:border-primary
              transition-colors duration-200 focus-visible:outline-none
            "
          >
            <Star className="h-4 w-4 flex-shrink-0" />
            <span>Ulasan</span>
            {totalReviews > 0 && (
              <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {totalReviews}
              </span>
            )}
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tab Content: Deskripsi */}
        <Tabs.Content
          value="description"
          className="pt-6 pb-4 focus-visible:outline-none"
        >
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
        </Tabs.Content>

        {/* Tab Content: Ulasan */}
        <Tabs.Content
          value="reviews"
          className="pt-6 pb-4 focus-visible:outline-none"
        >
          <ProductReviews
            productId={productId}
            productRating={productRating}
            totalReviews={totalReviews}
          />
        </Tabs.Content>
      </Tabs.Root>

      {/* ===== DETAIL PRODUK (di luar tab, section tersendiri) ===== */}
      <div className="mt-10 pt-8 border-t border-border">
        <div className="flex items-center gap-2 mb-6">
          <Package className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Detail Produk</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Kategori</span>
              <span className="text-sm font-medium">{category || "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Berat</span>
              <span className="text-sm font-medium">
                {details?.weight ? `${details.weight} gram` : "-"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Material</span>
              <span className="text-sm font-medium">Benang Sutra / Emas</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Teknik</span>
              <span className="text-sm font-medium">Tenunan Tangan</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Asal</span>
              <span className="text-sm font-medium">Brunei / Sambas</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Keaslian</span>
              <span className="text-sm font-medium">100% Handmade</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Pengiriman</span>
              <span className="text-sm font-medium">Indonesia, Malaysia, Brunei</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Garansi</span>
              <span className="text-sm font-medium">Keaslian Terjamin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
