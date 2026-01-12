"use client";

import { SlidersHorizontal } from "lucide-react";
import { PageFilterState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterSidebar } from "./FilterSidebar";

interface FilterSheetMobileProps {
  filters: PageFilterState;
  maxPrice?: number;
  onFilterChange: (filters: PageFilterState) => void;
  onClearFilters: () => void;
  activeFilterCount?: number;
}

export function FilterSheetMobile({
  filters,
  maxPrice,
  onFilterChange,
  onClearFilters,
  activeFilterCount = 0,
}: FilterSheetMobileProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {activeFilterCount > 0 && (
            <span className="ml-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Produk</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <FilterSidebar
            filters={filters}
            maxPrice={maxPrice}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
