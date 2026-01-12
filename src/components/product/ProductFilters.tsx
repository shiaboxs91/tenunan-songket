"use client";

import { useState } from "react";
import { X, RotateCcw } from "lucide-react";
import { FilterState, PRODUCT_CATEGORIES } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  categories?: string[];
}

/**
 * Desktop Filter Sidebar Component
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7
 * - Category checkboxes (3.2)
 * - Price range inputs min/max (3.3)
 * - Stock availability toggle (3.4)
 * - Reset button (3.6)
 * - Active filter count badge (3.7)
 */
export function ProductFilters({
  filters,
  onFilterChange,
  onReset,
  categories = PRODUCT_CATEGORIES as unknown as string[],
}: ProductFiltersProps) {
  // Local state for price inputs (to avoid updating URL on every keystroke)
  const [minPriceInput, setMinPriceInput] = useState(
    filters.minPrice?.toString() || ""
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    filters.maxPrice?.toString() || ""
  );

  // Count active filters - Requirement 3.7
  const activeFilterCount = 
    filters.categories.length +
    (filters.minPrice !== null ? 1 : 0) +
    (filters.maxPrice !== null ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0);

  // Handle category toggle - Requirement 3.2
  const handleCategoryToggle = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter((c) => c !== category);
    
    onFilterChange({
      ...filters,
      categories: newCategories,
    });
  };

  // Handle price input blur - Requirement 3.3
  const handlePriceBlur = () => {
    const minPrice = minPriceInput ? Number(minPriceInput) : null;
    const maxPrice = maxPriceInput ? Number(maxPriceInput) : null;

    // Auto-swap if min > max
    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      setMinPriceInput(maxPriceInput);
      setMaxPriceInput(minPriceInput);
      onFilterChange({
        ...filters,
        minPrice: maxPrice,
        maxPrice: minPrice,
      });
    } else {
      onFilterChange({
        ...filters,
        minPrice,
        maxPrice,
      });
    }
  };

  // Handle stock toggle - Requirement 3.4
  const handleStockToggle = (checked: boolean) => {
    onFilterChange({
      ...filters,
      inStockOnly: checked,
    });
  };

  // Handle reset - Requirement 3.6
  const handleReset = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    onReset();
  };

  // Remove single category filter
  const removeCategory = (category: string) => {
    onFilterChange({
      ...filters,
      categories: filters.categories.filter((c) => c !== category),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with active filter count badge - Requirement 3.7 */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filter</h3>
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="rounded-full">
            {activeFilterCount} aktif
          </Badge>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="gap-1 pr-1 cursor-pointer hover:bg-destructive/10"
              onClick={() => removeCategory(category)}
            >
              {category}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {filters.minPrice !== null && (
            <Badge
              variant="outline"
              className="gap-1 pr-1 cursor-pointer hover:bg-destructive/10"
              onClick={() => {
                setMinPriceInput("");
                onFilterChange({ ...filters, minPrice: null });
              }}
            >
              Min: {formatPrice(filters.minPrice)}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {filters.maxPrice !== null && (
            <Badge
              variant="outline"
              className="gap-1 pr-1 cursor-pointer hover:bg-destructive/10"
              onClick={() => {
                setMaxPriceInput("");
                onFilterChange({ ...filters, maxPrice: null });
              }}
            >
              Max: {formatPrice(filters.maxPrice)}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {filters.inStockOnly && (
            <Badge
              variant="outline"
              className="gap-1 pr-1 cursor-pointer hover:bg-destructive/10"
              onClick={() => handleStockToggle(false)}
            >
              Tersedia
              <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Category Filter - Requirement 3.2 */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Kategori</Label>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={filters.categories.includes(category)}
                onCheckedChange={(checked) =>
                  handleCategoryToggle(category, checked as boolean)
                }
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm font-normal cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range Filter - Requirement 3.3 */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Rentang Harga</Label>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Min"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              onBlur={handlePriceBlur}
              onKeyDown={(e) => e.key === "Enter" && handlePriceBlur()}
              className="h-9"
              min={0}
            />
          </div>
          <span className="text-muted-foreground">-</span>
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Max"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              onBlur={handlePriceBlur}
              onKeyDown={(e) => e.key === "Enter" && handlePriceBlur()}
              className="h-9"
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Stock Availability Toggle - Requirement 3.4 */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="inStock"
          checked={filters.inStockOnly}
          onCheckedChange={(checked) => handleStockToggle(checked as boolean)}
        />
        <Label htmlFor="inStock" className="text-sm font-normal cursor-pointer">
          Hanya produk tersedia
        </Label>
      </div>

      {/* Reset Button - Requirement 3.6 */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="w-full gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Filter
        </Button>
      )}
    </div>
  );
}
