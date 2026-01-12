"use client";

import { PageFilterState, PRODUCT_CATEGORIES } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSidebarProps {
  filters: PageFilterState;
  maxPrice?: number;
  onFilterChange: (filters: PageFilterState) => void;
  onClearFilters: () => void;
}

export function FilterSidebar({
  filters,
  maxPrice = 5000000,
  onFilterChange,
  onClearFilters,
}: FilterSidebarProps) {
  const handleCategoryChange = (category: string) => {
    onFilterChange({
      ...filters,
      category: category === "all" ? undefined : category,
    });
  };

  const handlePriceChange = (values: number[]) => {
    onFilterChange({
      ...filters,
      minPrice: values[0],
      maxPrice: values[1],
    });
  };

  const handleInStockChange = (checked: boolean) => {
    onFilterChange({
      ...filters,
      inStock: checked ? true : undefined,
    });
  };

  const handleSortChange = (sort: string) => {
    onFilterChange({
      ...filters,
      sort: sort === "default" ? undefined : (sort as PageFilterState["sort"]),
    });
  };

  const hasActiveFilters =
    filters.category ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.inStock ||
    filters.sort;

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Urutkan</Label>
        <Select
          value={filters.sort || "default"}
          onValueChange={handleSortChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih urutan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="newest">Terbaru</SelectItem>
            <SelectItem value="cheapest">Termurah</SelectItem>
            <SelectItem value="bestselling">Terlaris</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Kategori</Label>
        <Select
          value={filters.category || "all"}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {PRODUCT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium mb-4 block">Rentang Harga</Label>
        <Slider
          value={[filters.minPrice || 0, filters.maxPrice || maxPrice]}
          min={0}
          max={maxPrice}
          step={100000}
          onValueChange={handlePriceChange}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatPrice(filters.minPrice || 0)}</span>
          <span>{formatPrice(filters.maxPrice || maxPrice)}</span>
        </div>
      </div>

      {/* Stock */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="inStock"
          checked={filters.inStock || false}
          onCheckedChange={handleInStockChange}
        />
        <Label htmlFor="inStock" className="text-sm cursor-pointer">
          Hanya produk tersedia
        </Label>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="w-full"
        >
          Hapus Filter
        </Button>
      )}
    </div>
  );
}
