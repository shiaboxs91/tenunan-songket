"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductSorting } from "@/components/product/ProductSorting";
import { ProductFilters } from "@/components/product/ProductFilters";
// Temporarily disabled due to Radix UI Dialog issue
// import { MobileFilterSheet } from "@/components/product/MobileFilterSheet";
import { GridDensityToggle, useGridDensity } from "@/components/product/GridDensityToggle";
import { HorizontalCategories } from "@/components/mobile/HorizontalCategories";
import { Button } from "@/components/ui/button";
import { Product, ProductsResponse, SortOption, PRODUCT_CATEGORIES } from "@/lib/types";
import { useProductFilters } from "@/hooks/useProductFilters";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [gridDensity, setGridDensity] = useGridDensity();
  const pageSize = 12;

  // Use the useProductFilters hook for filter state management - Requirements 3.5, 4.5
  const {
    filters: hookFilters,
    setFilters: setHookFilters,
    resetFilters: resetHookFilters,
    activeFilterCount,
  } = useProductFilters();

  // Fetch categories with counts - Requirement 3.2
  const [categories, setCategories] = useState<(string | { name: string; slug: string; count: number })[]>(
    PRODUCT_CATEGORIES as unknown as string[]
  );

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }

    fetchCategories();
  }, []);

  const page = useMemo(() => 
    searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    [searchParams]
  );

  // Fetch products - uses hookFilters for URL-synced filtering
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (hookFilters.q) params.set("q", hookFilters.q);
        // Support multiple categories (comma-separated)
        if (hookFilters.categories.length > 0) {
          // If we have category objects, we might need to map them back to slugs or names depending on what filters.categories stores.
          // Currently filters.categories stores names (e.g. "Si Pugut").
          // The API expects slugs usually, but currently the frontend uses names. 
          // Let's assume names are consistent.
          params.set("category", hookFilters.categories.join(","));
        }
        if (hookFilters.minPrice !== null) params.set("min", hookFilters.minPrice.toString());
        if (hookFilters.maxPrice !== null) params.set("max", hookFilters.maxPrice.toString());
        if (hookFilters.inStockOnly) params.set("inStock", "true");
        if (hookFilters.sort) params.set("sort", hookFilters.sort);
        params.set("page", page.toString());
        params.set("pageSize", pageSize.toString());

        const response = await fetch(`/api/products?${params.toString()}`);
        const data: ProductsResponse = await response.json();

        setProducts(data.products);
        setTotal(data.total);
        setCurrentPage(data.page);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [hookFilters, page]);

  // Handle sort change - Requirement 5.3
  const handleSortChange = useCallback(
    (sort: SortOption) => {
      setHookFilters((prev) => ({ ...prev, sort }));
    },
    [setHookFilters]
  );

  const goToPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      {/* Horizontal Categories - Mobile Only */}
      <HorizontalCategories />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          {hookFilters.q ? `Hasil pencarian "${hookFilters.q}"` : "Semua Produk"}
        </h1>
      </div>

      <div className="flex gap-6 lg:gap-8">
        {/* Desktop Sidebar - Requirement 3.1: sticky filter sidebar on left (260-300px) */}
        <aside className="hidden lg:block w-[280px] flex-shrink-0">
          <div className="sticky top-24">
            <ProductFilters
              filters={hookFilters}
              onFilterChange={setHookFilters}
              onReset={resetHookFilters}
              categories={categories}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filter Button & Sorting Bar */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Mobile Filter Button - Requirement 4.1 */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileFilterOpen(true)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="ml-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              {/* MobileFilterSheet temporarily disabled due to Radix UI Dialog issue */}
            </div>

            {/* Sorting & Grid Density - Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 8.1, 8.5 */}
            <div className="flex items-center justify-between gap-4">
              <ProductSorting
                value={hookFilters.sort || "newest"}
                onChange={handleSortChange}
                totalProducts={loading ? 0 : total}
              />
              {/* Grid Density Toggle - Requirements 8.1, 8.5 */}
              <GridDensityToggle
                value={gridDensity}
                onChange={setGridDensity}
              />
            </div>
          </div>

          {/* Product Grid - Requirements 8.2, 8.3 */}
          <ProductGrid
            products={products}
            loading={loading}
            density={gridDensity}
            emptyMessage={
              hookFilters.q
                ? `Tidak ada produk yang cocok dengan "${hookFilters.q}"`
                : "Tidak ada produk ditemukan"
            }
          />

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="icon"
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
