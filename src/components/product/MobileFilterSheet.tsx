"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, X, RotateCcw, Check } from "lucide-react";
import { FilterState, PRODUCT_CATEGORIES } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import type { ColorOption } from "./ColorFilter";

interface MobileFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
  categories?: string[];
  colors?: ColorOption[];
}

/**
 * Mobile Filter Bottom Sheet Component
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 * - Bottom sheet with filter options (4.2)
 * - Same filter options as desktop: category, price, stock (4.3)
 * - "Terapkan" (Apply) and "Reset" buttons (4.4)
 * - Close sheet and apply filters on "Terapkan" (4.5)
 * - Dismissible by swiping down or tapping outside (4.6)
 */
export function MobileFilterSheet({
  open,
  onOpenChange,
  filters,
  onApply,
  onReset,
  categories = PRODUCT_CATEGORIES as unknown as string[],
  colors = [],
}: MobileFilterSheetProps) {
  // Local state for filters (only applied when "Terapkan" is clicked)
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [minPriceInput, setMinPriceInput] = useState(
    filters.minPrice?.toString() || ""
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    filters.maxPrice?.toString() || ""
  );

  // Sync local state when sheet opens or external filters change
  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
      setMinPriceInput(filters.minPrice?.toString() || "");
      setMaxPriceInput(filters.maxPrice?.toString() || "");
    }
  }, [open, filters]);

  // Count active filters in local state
  const activeFilterCount =
    localFilters.categories.length +
    (localFilters.colors?.length || 0) +
    (localFilters.minPrice !== null ? 1 : 0) +
    (localFilters.maxPrice !== null ? 1 : 0) +
    (localFilters.inStockOnly ? 1 : 0);

  // Handle category toggle - Requirement 4.3
  const handleCategoryToggle = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...localFilters.categories, category]
      : localFilters.categories.filter((c) => c !== category);

    setLocalFilters({
      ...localFilters,
      categories: newCategories,
    });
  };

  // Handle color toggle
  const handleColorToggle = (colorSlug: string) => {
    const currentColors = localFilters.colors || [];
    const newColors = currentColors.includes(colorSlug)
      ? currentColors.filter((c) => c !== colorSlug)
      : [...currentColors, colorSlug];

    setLocalFilters({
      ...localFilters,
      colors: newColors,
    });
  };

  // Handle price input change
  const handlePriceChange = () => {
    const minPrice = minPriceInput ? Number(minPriceInput) : null;
    const maxPrice = maxPriceInput ? Number(maxPriceInput) : null;

    // Auto-swap if min > max
    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      setMinPriceInput(maxPriceInput);
      setMaxPriceInput(minPriceInput);
      setLocalFilters({
        ...localFilters,
        minPrice: maxPrice,
        maxPrice: minPrice,
      });
    } else {
      setLocalFilters({
        ...localFilters,
        minPrice,
        maxPrice,
      });
    }
  };

  // Handle stock toggle - Requirement 4.3
  const handleStockToggle = (checked: boolean) => {
    setLocalFilters({
      ...localFilters,
      inStockOnly: checked,
    });
  };

  // Handle apply - Requirement 4.5
  const handleApply = () => {
    onApply(localFilters);
    onOpenChange(false);
  };

  // Handle reset - Requirement 4.4
  const handleReset = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    setLocalFilters({
      ...localFilters,
      categories: [],
      colors: [],
      minPrice: null,
      maxPrice: null,
      inStockOnly: false,
    });
  };

  // Handle full reset and close
  const handleResetAndClose = () => {
    onReset();
    onOpenChange(false);
  };

  const isLightColor = (hexColor: string): boolean => {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] rounded-t-2xl flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              Filter Produk
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="rounded-full">
                  {activeFilterCount}
                </Badge>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Category Filter - Requirement 4.3 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Kategori</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mobile-category-${category}`}
                    checked={localFilters.categories.includes(category)}
                    onCheckedChange={(checked) =>
                      handleCategoryToggle(category, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`mobile-category-${category}`}
                    className="text-sm font-normal cursor-pointer leading-tight"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          {colors.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Warna</Label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const isSelected = (localFilters.colors || []).includes(color.slug);
                  const hexCode = color.hex_code || "#808080";
                  const isLight = isLightColor(hexCode);

                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => handleColorToggle(color.slug)}
                      title={color.name}
                      className={cn(
                        "relative w-10 h-10 rounded-full border-2 transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500",
                        isSelected
                          ? "border-amber-500 ring-2 ring-amber-500/30"
                          : "border-gray-300"
                      )}
                      style={{ backgroundColor: hexCode }}
                      aria-label={`Filter warna ${color.name}`}
                      aria-pressed={isSelected}
                    >
                      {isSelected && (
                        <Check
                          className={cn(
                            "absolute inset-0 m-auto h-5 w-5",
                            isLight ? "text-gray-800" : "text-white"
                          )}
                          strokeWidth={3}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price Range Filter - Requirement 4.3 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Rentang Harga</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  onBlur={handlePriceChange}
                  className="h-10"
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
                  onBlur={handlePriceChange}
                  className="h-10"
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* Stock Availability Toggle - Requirement 4.3 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mobile-inStock"
              checked={localFilters.inStockOnly}
              onCheckedChange={(checked) => handleStockToggle(checked as boolean)}
            />
            <Label
              htmlFor="mobile-inStock"
              className="text-sm font-normal cursor-pointer"
            >
              Hanya produk tersedia
            </Label>
          </div>

          {/* Active Filters Preview */}
          {activeFilterCount > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Filter Aktif
              </Label>
              <div className="flex flex-wrap gap-2">
                {localFilters.categories.map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="gap-1 pr-1"
                  >
                    {category}
                    <button
                      onClick={() => handleCategoryToggle(category, false)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {localFilters.minPrice !== null && (
                  <Badge variant="outline" className="gap-1 pr-1">
                    Min: {formatPrice(localFilters.minPrice)}
                    <button
                      onClick={() => {
                        setMinPriceInput("");
                        setLocalFilters({ ...localFilters, minPrice: null });
                      }}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {localFilters.maxPrice !== null && (
                  <Badge variant="outline" className="gap-1 pr-1">
                    Max: {formatPrice(localFilters.maxPrice)}
                    <button
                      onClick={() => {
                        setMaxPriceInput("");
                        setLocalFilters({ ...localFilters, maxPrice: null });
                      }}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {(localFilters.colors || []).map((colorSlug) => {
                  const color = colors.find((c) => c.slug === colorSlug);
                  if (!color) return null;
                  return (
                    <Badge
                      key={colorSlug}
                      variant="outline"
                      className="gap-1 pr-1"
                    >
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.hex_code || "#808080" }}
                      />
                      {color.name}
                      <button
                        onClick={() => handleColorToggle(colorSlug)}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
                {localFilters.inStockOnly && (
                  <Badge variant="outline" className="gap-1 pr-1">
                    Tersedia
                    <button
                      onClick={() => handleStockToggle(false)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Terapkan and Reset buttons - Requirement 4.4 */}
        <SheetFooter className="pt-4 border-t gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 gap-2"
            disabled={activeFilterCount === 0}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Terapkan
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}