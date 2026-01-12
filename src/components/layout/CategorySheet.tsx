"use client";

import { useRouter } from "next/navigation";
import { LayoutGrid, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface CategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  onSelectCategory: (category: string) => void;
}

export function CategorySheet({
  open,
  onOpenChange,
  categories,
  onSelectCategory,
}: CategorySheetProps) {
  const router = useRouter();

  const handleCategorySelect = (category: string) => {
    onSelectCategory(category);
    onOpenChange(false);
    // Navigate to products page with category filter
    router.push(`/products?category=${encodeURIComponent(category)}`);
  };

  const handleViewAll = () => {
    onOpenChange(false);
    router.push("/products");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-2xl pb-8">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Kategori Produk
          </SheetTitle>
          <SheetDescription>
            Pilih kategori untuk melihat produk
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-1">
          {/* View All Products */}
          <button
            onClick={handleViewAll}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-lg",
              "hover:bg-muted transition-colors text-left"
            )}
          >
            <span className="font-medium">Semua Produk</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Category List */}
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg",
                "hover:bg-muted transition-colors text-left"
              )}
            >
              <span>{category}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
