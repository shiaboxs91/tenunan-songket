"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { FilterState, SortOption } from "@/lib/types";

/**
 * Default filter state
 */
export const DEFAULT_FILTER_STATE: FilterState = {
  categories: [],
  minPrice: null,
  maxPrice: null,
  inStockOnly: false,
  sort: "newest",
  q: undefined,
};

/**
 * Parse URL search params to FilterState
 */
export function parseFiltersFromURL(searchParams: URLSearchParams): FilterState {
  const categoryParam = searchParams.get("category");
  const categories = categoryParam 
    ? categoryParam.split(",").filter(Boolean) 
    : [];

  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const sortParam = searchParams.get("sort") as SortOption | null;
  const inStockParam = searchParams.get("inStock");

  return {
    categories,
    minPrice: minPriceParam ? Number(minPriceParam) : null,
    maxPrice: maxPriceParam ? Number(maxPriceParam) : null,
    inStockOnly: inStockParam === "true",
    sort: sortParam && isValidSortOption(sortParam) ? sortParam : "newest",
    q: searchParams.get("q") || undefined,
  };
}

/**
 * Convert FilterState to URL search params
 */
export function filtersToURLParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.categories.length > 0) {
    params.set("category", filters.categories.join(","));
  }

  if (filters.minPrice !== null) {
    params.set("minPrice", filters.minPrice.toString());
  }

  if (filters.maxPrice !== null) {
    params.set("maxPrice", filters.maxPrice.toString());
  }

  if (filters.inStockOnly) {
    params.set("inStock", "true");
  }

  if (filters.sort && filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }

  return params;
}

/**
 * Validate sort option
 */
function isValidSortOption(value: string): value is SortOption {
  return ["newest", "price-asc", "price-desc", "bestselling", "rating"].includes(value);
}

/**
 * Hook to manage product filter state with URL sync
 * - Parses URL search params to filter state
 * - Syncs filter changes to URL
 * 
 * Requirements: 3.5, 4.5
 */
export function useProductFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse current filters from URL
  const filters = useMemo(() => {
    return parseFiltersFromURL(searchParams);
  }, [searchParams]);

  // Count active filters (excluding search query and default sort)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.minPrice !== null) count++;
    if (filters.maxPrice !== null) count++;
    if (filters.inStockOnly) count++;
    return count;
  }, [filters]);

  // Update filters and sync to URL
  const setFilters = useCallback(
    (newFilters: FilterState | ((prev: FilterState) => FilterState)) => {
      const updatedFilters = typeof newFilters === "function" 
        ? newFilters(filters) 
        : newFilters;
      
      const params = filtersToURLParams(updatedFilters);
      const queryString = params.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      
      router.push(url, { scroll: false });
    },
    [filters, pathname, router]
  );

  // Update a single filter field
  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [setFilters]
  );

  // Toggle category in filter
  const toggleCategory = useCallback(
    (category: string) => {
      setFilters((prev) => {
        const categories = prev.categories.includes(category)
          ? prev.categories.filter((c) => c !== category)
          : [...prev.categories, category];
        return { ...prev, categories };
      });
    },
    [setFilters]
  );

  // Set sort option
  const setSort = useCallback(
    (sort: SortOption) => {
      updateFilter("sort", sort);
    },
    [updateFilter]
  );

  // Set price range
  const setPriceRange = useCallback(
    (minPrice: number | null, maxPrice: number | null) => {
      setFilters((prev) => ({ ...prev, minPrice, maxPrice }));
    },
    [setFilters]
  );

  // Toggle in-stock filter
  const toggleInStock = useCallback(() => {
    setFilters((prev) => ({ ...prev, inStockOnly: !prev.inStockOnly }));
  }, [setFilters]);

  // Set search query
  const setSearchQuery = useCallback(
    (q: string | undefined) => {
      updateFilter("q", q);
    },
    [updateFilter]
  );

  // Reset all filters to default
  const resetFilters = useCallback(() => {
    // Keep search query when resetting filters
    const q = filters.q;
    setFilters({ ...DEFAULT_FILTER_STATE, q });
  }, [filters.q, setFilters]);

  // Check if any filters are active
  const hasActiveFilters = activeFilterCount > 0;

  return {
    filters,
    activeFilterCount,
    hasActiveFilters,
    setFilters,
    updateFilter,
    toggleCategory,
    setSort,
    setPriceRange,
    toggleInStock,
    setSearchQuery,
    resetFilters,
  };
}
