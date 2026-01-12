import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { filterProductsLegacy, sortProductsLegacy, filterProducts, sortProducts } from "@/lib/products";
import { parseFiltersFromURL, filtersToURLParams, DEFAULT_FILTER_STATE } from "@/hooks/useProductFilters";
import { Product, ProductFilters, FilterState, SortOption, PRODUCT_CATEGORIES } from "@/lib/types";

// Generator for valid Product
const productArb = fc.record({
  id: fc.uuid(),
  slug: fc.string({ minLength: 1, maxLength: 50 }).map((s) => s.replace(/\s/g, "-")),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ maxLength: 500 }),
  image: fc.option(fc.webUrl(), { nil: undefined }),
  price: fc.integer({ min: 100000, max: 10000000 }),
  currency: fc.constant("IDR" as const),
  category: fc.constantFrom(...PRODUCT_CATEGORIES),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
  inStock: fc.boolean(),
  rating: fc.float({ min: 0, max: 5, noNaN: true }),
  sold: fc.integer({ min: 0, max: 1000 }),
  createdAt: fc.option(
    fc.date({ min: new Date("2020-01-01"), max: new Date("2025-12-31") }).map((d) => d.toISOString()),
    { nil: undefined }
  ),
  sourceUrl: fc.webUrl(),
});

/**
 * Feature: tenunan-songket-store, Property 1: Product filtering returns matching results
 * Validates: Requirements 3.4, 3.7
 *
 * For any list of products and any combination of filter criteria (category, price range,
 * stock availability, search query), the filtered results SHALL only contain products
 * that match ALL specified criteria.
 */
describe("Property 1: Product filtering returns matching results", () => {
  it("should filter by category correctly", () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 20 }),
        fc.constantFrom(...PRODUCT_CATEGORIES),
        (products, category) => {
          const filters: ProductFilters = { category };
          const filtered = filterProductsLegacy(products, filters);

          // All filtered products should have the specified category
          for (const product of filtered) {
            expect(product.category).toBe(category);
          }

          // All products with matching category should be in results
          const expectedCount = products.filter((p) => p.category === category).length;
          expect(filtered.length).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should filter by price range correctly", () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 100000, max: 5000000 }),
        fc.integer({ min: 5000001, max: 10000000 }),
        (products, minPrice, maxPrice) => {
          const filters: ProductFilters = { minPrice, maxPrice };
          const filtered = filterProductsLegacy(products, filters);

          // All filtered products should be within price range
          for (const product of filtered) {
            expect(product.price).toBeGreaterThanOrEqual(minPrice);
            expect(product.price).toBeLessThanOrEqual(maxPrice);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should filter by stock availability correctly", () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 20 }),
        fc.boolean(),
        (products, inStock) => {
          const filters: ProductFilters = { inStock };
          const filtered = filterProductsLegacy(products, filters);

          // All filtered products should match stock status
          for (const product of filtered) {
            expect(product.inStock).toBe(inStock);
          }

          // Count should match
          const expectedCount = products.filter((p) => p.inStock === inStock).length;
          expect(filtered.length).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should filter by search query correctly", () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }).filter((s) => s.trim().length > 0),
        (products, query) => {
          const filters: ProductFilters = { q: query };
          const filtered = filterProductsLegacy(products, filters);

          const queryLower = query.toLowerCase();

          // All filtered products should contain query in title, description, or tags
          for (const product of filtered) {
            const matchesTitle = product.title.toLowerCase().includes(queryLower);
            const matchesDescription = product.description.toLowerCase().includes(queryLower);
            const matchesTags = product.tags.some((tag) =>
              tag.toLowerCase().includes(queryLower)
            );
            expect(matchesTitle || matchesDescription || matchesTags).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should apply multiple filters correctly (AND logic)", () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 20 }),
        fc.constantFrom(...PRODUCT_CATEGORIES),
        fc.boolean(),
        (products, category, inStock) => {
          const filters: ProductFilters = { category, inStock };
          const filtered = filterProductsLegacy(products, filters);

          // All filtered products should match ALL criteria
          for (const product of filtered) {
            expect(product.category).toBe(category);
            expect(product.inStock).toBe(inStock);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should return empty array when no products match", () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 10 }),
        (products) => {
          // Use impossibly high price range
          const filters: ProductFilters = { minPrice: 999999999 };
          const filtered = filterProductsLegacy(products, filters);
          expect(filtered.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should return all products when no filters applied", () => {
    fc.assert(
      fc.property(fc.array(productArb, { minLength: 0, maxLength: 20 }), (products) => {
        const filters: ProductFilters = {};
        const filtered = filterProductsLegacy(products, filters);
        expect(filtered.length).toBe(products.length);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: tenunan-songket-store, Property 2: Product sorting produces correct order
 * Validates: Requirements 3.5
 *
 * For any list of products and any sort option (newest, cheapest, bestselling),
 * the sorted results SHALL be ordered correctly according to the sort criteria.
 */
describe("Property 2: Product sorting produces correct order", () => {
  it("should sort by cheapest (ascending price)", () => {
    fc.assert(
      fc.property(fc.array(productArb, { minLength: 2, maxLength: 20 }), (products) => {
        const sorted = sortProductsLegacy(products, "cheapest");

        // Verify ascending order by price
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i].price).toBeGreaterThanOrEqual(sorted[i - 1].price);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should sort by bestselling (descending sold count)", () => {
    fc.assert(
      fc.property(fc.array(productArb, { minLength: 2, maxLength: 20 }), (products) => {
        const sorted = sortProductsLegacy(products, "bestselling");

        // Verify descending order by sold
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i].sold).toBeLessThanOrEqual(sorted[i - 1].sold);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should sort by newest (descending date)", () => {
    fc.assert(
      fc.property(
        fc.array(
          productArb.filter((p) => p.createdAt !== undefined),
          { minLength: 2, maxLength: 20 }
        ),
        (products) => {
          const sorted = sortProductsLegacy(products, "newest");

          // Verify descending order by date
          for (let i = 1; i < sorted.length; i++) {
            const dateA = sorted[i - 1].createdAt
              ? new Date(sorted[i - 1].createdAt!).getTime()
              : 0;
            const dateB = sorted[i].createdAt
              ? new Date(sorted[i].createdAt!).getTime()
              : 0;
            expect(dateB).toBeLessThanOrEqual(dateA);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should preserve all products after sorting", () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 20 }),
        fc.constantFrom("newest", "cheapest", "bestselling", undefined),
        (products, sort) => {
          const sorted = sortProductsLegacy(products, sort as ProductFilters["sort"]);

          // Same length
          expect(sorted.length).toBe(products.length);

          // Same products (by id)
          const originalIds = new Set(products.map((p) => p.id));
          const sortedIds = new Set(sorted.map((p) => p.id));
          expect(sortedIds).toEqual(originalIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not mutate original array", () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 20 }),
        fc.constantFrom("newest", "cheapest", "bestselling"),
        (products, sort) => {
          const originalOrder = products.map((p) => p.id);
          sortProductsLegacy(products, sort as ProductFilters["sort"]);
          const afterOrder = products.map((p) => p.id);

          expect(afterOrder).toEqual(originalOrder);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: ui-enhancement, Property 1: Filter URL Sync
 * Validates: Requirements 3.5, 4.5
 *
 * For any filter state applied by the user, the URL search params SHALL reflect
 * the current filter state, and refreshing the page SHALL restore the same filter state.
 */
describe("Property 1: Filter URL Sync (Round-trip)", () => {
  // Generator for valid FilterState
  const filterStateArb = fc.record({
    categories: fc.array(fc.constantFrom(...PRODUCT_CATEGORIES), { maxLength: 3 }),
    minPrice: fc.option(fc.integer({ min: 100000, max: 5000000 }), { nil: null }),
    maxPrice: fc.option(fc.integer({ min: 5000001, max: 10000000 }), { nil: null }),
    inStockOnly: fc.boolean(),
    sort: fc.constantFrom("newest", "price-asc", "price-desc", "bestselling", "rating") as fc.Arbitrary<SortOption>,
    q: fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0), { nil: undefined }),
  });

  it("should round-trip filter state through URL params", () => {
    fc.assert(
      fc.property(filterStateArb, (filters) => {
        // Convert to URL params
        const params = filtersToURLParams(filters);
        
        // Parse back from URL params
        const parsed = parseFiltersFromURL(params);

        // Verify round-trip preserves state
        expect(parsed.categories.sort()).toEqual(filters.categories.sort());
        expect(parsed.minPrice).toBe(filters.minPrice);
        expect(parsed.maxPrice).toBe(filters.maxPrice);
        expect(parsed.inStockOnly).toBe(filters.inStockOnly);
        expect(parsed.sort).toBe(filters.sort === "newest" ? "newest" : filters.sort);
        expect(parsed.q).toBe(filters.q);
      }),
      { numRuns: 100 }
    );
  });

  it("should handle empty/default filter state", () => {
    const params = filtersToURLParams(DEFAULT_FILTER_STATE);
    const parsed = parseFiltersFromURL(params);

    expect(parsed.categories).toEqual([]);
    expect(parsed.minPrice).toBeNull();
    expect(parsed.maxPrice).toBeNull();
    expect(parsed.inStockOnly).toBe(false);
    expect(parsed.sort).toBe("newest");
  });

  it("should handle invalid sort option in URL by defaulting to newest", () => {
    const params = new URLSearchParams();
    params.set("sort", "invalid-sort");
    
    const parsed = parseFiltersFromURL(params);
    expect(parsed.sort).toBe("newest");
  });
});

/**
 * Feature: ui-enhancement, Property 2: Sort Consistency
 * Validates: Requirements 5.3
 *
 * For any sort option selected, the product list SHALL be ordered according to
 * that criteria, and the order SHALL remain consistent until a different sort is selected.
 */
describe("Property 2: Sort Consistency (Extended Sort Options)", () => {
  it("should sort by price-asc (ascending price)", () => {
    fc.assert(
      fc.property(fc.array(productArb, { minLength: 2, maxLength: 20 }), (products) => {
        const sorted = sortProducts(products, "price-asc");

        // Verify ascending order by price
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i].price).toBeGreaterThanOrEqual(sorted[i - 1].price);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should sort by price-desc (descending price)", () => {
    fc.assert(
      fc.property(fc.array(productArb, { minLength: 2, maxLength: 20 }), (products) => {
        const sorted = sortProducts(products, "price-desc");

        // Verify descending order by price
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i].price).toBeLessThanOrEqual(sorted[i - 1].price);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should sort by rating (descending rating)", () => {
    fc.assert(
      fc.property(fc.array(productArb, { minLength: 2, maxLength: 20 }), (products) => {
        const sorted = sortProducts(products, "rating");

        // Verify descending order by rating
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i].rating).toBeLessThanOrEqual(sorted[i - 1].rating);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should sort by bestselling (descending sold count)", () => {
    fc.assert(
      fc.property(fc.array(productArb, { minLength: 2, maxLength: 20 }), (products) => {
        const sorted = sortProducts(products, "bestselling");

        // Verify descending order by sold
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i].sold).toBeLessThanOrEqual(sorted[i - 1].sold);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should sort by newest (descending date)", () => {
    fc.assert(
      fc.property(
        fc.array(
          productArb.filter((p) => p.createdAt !== undefined),
          { minLength: 2, maxLength: 20 }
        ),
        (products) => {
          const sorted = sortProducts(products, "newest");

          // Verify descending order by date
          for (let i = 1; i < sorted.length; i++) {
            const dateA = sorted[i - 1].createdAt
              ? new Date(sorted[i - 1].createdAt!).getTime()
              : 0;
            const dateB = sorted[i].createdAt
              ? new Date(sorted[i].createdAt!).getTime()
              : 0;
            expect(dateB).toBeLessThanOrEqual(dateA);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should preserve all products after sorting (no data loss)", () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 20 }),
        fc.constantFrom("newest", "price-asc", "price-desc", "bestselling", "rating") as fc.Arbitrary<SortOption>,
        (products, sort) => {
          const sorted = sortProducts(products, sort);

          // Same length
          expect(sorted.length).toBe(products.length);

          // Same products (by id)
          const originalIds = new Set(products.map((p) => p.id));
          const sortedIds = new Set(sorted.map((p) => p.id));
          expect(sortedIds).toEqual(originalIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not mutate original array", () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 20 }),
        fc.constantFrom("newest", "price-asc", "price-desc", "bestselling", "rating") as fc.Arbitrary<SortOption>,
        (products, sort) => {
          const originalOrder = products.map((p) => p.id);
          sortProducts(products, sort);
          const afterOrder = products.map((p) => p.id);

          expect(afterOrder).toEqual(originalOrder);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: ui-enhancement, Property 5: Filter Reset Completeness
 * Validates: Requirements 3.6, 4.4
 *
 * For any combination of active filters, clicking "Reset" SHALL clear all filters
 * and return the product list to its unfiltered state.
 */
describe("Property 5: Filter Reset Completeness", () => {
  it("should return all products when filters are reset to default", () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 20 }),
        (products) => {
          // Apply default (empty) filters
          const filtered = filterProducts(products, DEFAULT_FILTER_STATE);

          // Should return all products
          expect(filtered.length).toBe(products.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should filter correctly with multiple categories", () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 20 }),
        fc.array(fc.constantFrom(...PRODUCT_CATEGORIES), { minLength: 1, maxLength: 3 }),
        (products, categories) => {
          const uniqueCategories = Array.from(new Set(categories));
          const filters: FilterState = {
            ...DEFAULT_FILTER_STATE,
            categories: uniqueCategories,
          };
          const filtered = filterProducts(products, filters);

          // All filtered products should have one of the selected categories
          for (const product of filtered) {
            expect(uniqueCategories).toContain(product.category);
          }

          // All products with matching categories should be in results
          const expectedCount = products.filter((p) => uniqueCategories.includes(p.category)).length;
          expect(filtered.length).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should filter by inStockOnly correctly", () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 20 }),
        (products) => {
          const filters: FilterState = {
            ...DEFAULT_FILTER_STATE,
            inStockOnly: true,
          };
          const filtered = filterProducts(products, filters);

          // All filtered products should be in stock
          for (const product of filtered) {
            expect(product.inStock).toBe(true);
          }

          // Count should match
          const expectedCount = products.filter((p) => p.inStock).length;
          expect(filtered.length).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});
