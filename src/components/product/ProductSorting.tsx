"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortOption } from "@/lib/types";

/**
 * Sort option labels in Indonesian
 */
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Terbaru" },
  { value: "price-asc", label: "Harga Terendah" },
  { value: "price-desc", label: "Harga Tertinggi" },
  { value: "bestselling", label: "Terlaris" },
  { value: "rating", label: "Rating Tertinggi" },
];

interface ProductSortingProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  totalProducts: number;
}

/**
 * ProductSorting component with dropdown for sort options
 * Shows total products count and current sort selection
 * 
 * Requirements: 5.1, 5.2, 5.4, 5.5
 */
export function ProductSorting({
  value,
  onChange,
  totalProducts,
}: ProductSortingProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Total products count - Requirement 5.5 */}
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{totalProducts}</span> produk ditemukan
      </p>

      {/* Sort dropdown - Requirements 5.1, 5.2, 5.4 */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden sm:inline">Urutkan:</span>
        <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
