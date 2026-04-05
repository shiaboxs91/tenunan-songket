"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductSorting } from "@/components/product/ProductSorting";
import { ProductFilters } from "@/components/product/ProductFilters";
import { GridDensityToggle, useGridDensity } from "@/components/product/GridDensityToggle";
import { HorizontalCategories } from "@/components/mobile/HorizontalCategories";
import { Button } from "@/components/ui/button";
import { Product, ProductsResponse, SortOption } from "@/lib/types";
import { useProductFilters } from "@/hooks/useProductFilters";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import type { ColorOption } from "@/components/product/ColorFilter";
import type { ProductColorDot } from "@/components/product/ColorDots";
import type { CategoryWithCount } from "@/lib/supabase/categories";

interface ProductsClientProps {
  initialProducts: Product[];
  initialTotal: number;
  initialPage: number;
  initialCategories: CategoryWithCount[];
  initialColors: ColorOption[];
}

export function ProductsClient({
  initialProducts,
  initialTotal,
  initialPage,
  initialCategories,
  initialColors,
}: ProductsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize state with server-provided data (SSR hydration)
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false); // Start false since we have initial data
  const [total, setTotal] = useState(initialTotal);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [gridDensity, setGridDensity] = useGridDensity();
  const pageSize = 12;

  // Filter state management with URL sync
  const {
    filters: hookFilters,
    setFilters: setHookFilters,
    resetFilters: resetHookFilters,
    activeFilterCount,
    toggleColor,
  } = useProductFilters();

  // Categories and colors from SSR
  const [categories] = useState<CategoryWithCount[]>(initialCategories);
  const [colors] = useState<ColorOption[]>(initialColors);

  // Colors per product (for display on cards)
  const [productColors, setProductColors] = useState<Map<string, ProductColorDot[]>>(new Map());

  // Track if this is the initial render (to skip first fetch since we have SSR data)
  const [isInitialRender, setIsInitialRender] = useState(true);

  const page = useMemo(() => 
    searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    [searchParams]
  );

  // Fetch products when filters/page change (but skip initial render)
  useEffect(() => {
    // Skip fetch on initial render since we have SSR data
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }

    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (hookFilters.q) params.set("q", hookFilters.q);
        if (hookFilters.categories.length > 0) {
          params.set("category", hookFilters.categories.join(","));
        }
        if (hookFilters.colors.length > 0) {
          params.set("colors", hookFilters.colors.join(","));
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
  }, [hookFilters, page, isInitialRender]);

  // Fetch product colors for display on cards
  useEffect(() => {
    if (products.length === 0) {
      setProductColors(new Map());
      return;
    }

    async function fetchProductColors() {
      try {
        const { getProductsColorsClient } = await import("@/lib/supabase/colors.client");
        const ids = products.map((p) => p.id);
        const colorsMap = await getProductsColorsClient(ids);
        setProductColors(colorsMap);
      } catch (error) {
        console.error("Failed to fetch product colors:", error);
      }
    }

    fetchProductColors();
  }, [products]);

  // Handle sort change
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

  // Transform categories for ProductFilters component
  const categoriesForFilter = useMemo(() => 
    categories.map(c => ({
      name: c.name,
      slug: c.slug,
      count: c.product_count,
    })),
    [categories]
  );

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
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilters
                filters={hookFilters}
                onFilterChange={setHookFilters}
                onReset={resetHookFilters}
                categories={categoriesForFilter}
                colors={colors}
                onToggleColor={toggleColor}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button & Sorting Bar */}
            <div className="flex flex-col gap-4 mb-6">
              {/* Mobile Filter Button */}
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
              </div>

              {/* Sorting & Grid Density */}
              <div className="flex items-center justify-between gap-4">
                <ProductSorting
                  value={hookFilters.sort || "newest"}
                  onChange={handleSortChange}
                  totalProducts={loading ? 0 : total}
                />
                <GridDensityToggle
                  value={gridDensity}
                  onChange={setGridDensity}
                />
              </div>
            </div>

            {/* Product Grid */}
            <ProductGrid
              products={products}
              loading={loading}
              density={gridDensity}
              productColors={productColors}
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
