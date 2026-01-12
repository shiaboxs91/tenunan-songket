"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
// Temporarily disabled due to Radix UI Dialog issue
// import { QuickViewModal } from "./QuickViewModal";
import { Skeleton } from "@/components/ui/skeleton";
import { PackageX } from "lucide-react";
import { cn } from "@/lib/utils";
import { GridDensity } from "./GridDensityToggle";
import { useCart } from "@/components/cart/CartProvider";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
  density?: GridDensity;
}

// Grid classes based on density
const gridClasses: Record<GridDensity, string> = {
  // Compact: more columns, smaller gaps
  compact: "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3",
  // Comfortable: fewer columns, larger gaps
  comfortable: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4",
};

export function ProductGrid({
  products,
  loading = false,
  emptyMessage = "Tidak ada produk ditemukan",
  density = "comfortable",
}: ProductGridProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addItem } = useCart();

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
  };

  if (loading) {
    return <ProductGridSkeleton density={density} />;
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <PackageX className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn("grid", gridClasses[density])}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            density={density}
            onQuickView={handleQuickView}
          />
        ))}
      </div>

      {/* Quick View Modal - temporarily disabled due to Radix UI Dialog issue */}
    </>
  );
}

function ProductGridSkeleton({ density = "comfortable" }: { density?: GridDensity }) {
  return (
    <div className={cn("grid", gridClasses[density])}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card overflow-hidden">
          <Skeleton className="aspect-[4/3] w-full" />
          <div className={cn("space-y-2", density === "compact" ? "p-2" : "p-3")}>
            <Skeleton className="h-2 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { ProductGridSkeleton };
