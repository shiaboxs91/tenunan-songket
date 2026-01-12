import { Product, ProductFilters, ProductsResponse, FilterState, SortOption } from "./types";

/**
 * Filter products based on filter criteria (legacy API filters)
 */
export function filterProductsLegacy(products: Product[], filters: ProductFilters): Product[] {
  return products.filter((product) => {
    // Search query filter
    if (filters.q) {
      const query = filters.q.toLowerCase();
      const matchesTitle = product.title.toLowerCase().includes(query);
      const matchesDescription = product.description.toLowerCase().includes(query);
      const matchesTags = product.tags.some((tag) => tag.toLowerCase().includes(query));
      if (!matchesTitle && !matchesDescription && !matchesTags) {
        return false;
      }
    }

    // Category filter
    if (filters.category && product.category !== filters.category) {
      return false;
    }

    // Price range filter
    if (filters.minPrice !== undefined && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
      return false;
    }

    // Stock filter
    if (filters.inStock !== undefined && product.inStock !== filters.inStock) {
      return false;
    }

    return true;
  });
}

/**
 * Filter products based on UI FilterState
 * Requirements: 5.3
 */
export function filterProducts(products: Product[], filters: FilterState): Product[] {
  return products.filter((product) => {
    // Search query filter
    if (filters.q) {
      const query = filters.q.toLowerCase();
      const matchesTitle = product.title.toLowerCase().includes(query);
      const matchesDescription = product.description.toLowerCase().includes(query);
      const matchesTags = product.tags.some((tag) => tag.toLowerCase().includes(query));
      if (!matchesTitle && !matchesDescription && !matchesTags) {
        return false;
      }
    }

    // Category filter (supports multiple categories)
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false;
    }

    // Price range filter
    if (filters.minPrice !== null && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== null && product.price > filters.maxPrice) {
      return false;
    }

    // Stock filter
    if (filters.inStockOnly && !product.inStock) {
      return false;
    }

    return true;
  });
}

/**
 * Sort products based on sort option
 * Requirements: 5.3
 * 
 * Sort options:
 * - newest: Sort by creation date (newest first)
 * - price-asc: Sort by price (lowest first)
 * - price-desc: Sort by price (highest first)
 * - bestselling: Sort by sold count (highest first)
 * - rating: Sort by rating (highest first)
 */
export function sortProducts(products: Product[], sortOption: SortOption): Product[] {
  const sorted = [...products];

  switch (sortOption) {
    case "newest":
      return sorted.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "bestselling":
      return sorted.sort((a, b) => b.sold - a.sold);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    default:
      return sorted;
  }
}

/**
 * Sort products based on legacy sort criteria (for API compatibility)
 */
export function sortProductsLegacy(
  products: Product[],
  sort?: "newest" | "cheapest" | "bestselling"
): Product[] {
  const sorted = [...products];

  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    case "cheapest":
      return sorted.sort((a, b) => a.price - b.price);
    case "bestselling":
      return sorted.sort((a, b) => b.sold - a.sold);
    default:
      return sorted;
  }
}

/**
 * Paginate products
 */
export function paginateProducts(
  products: Product[],
  page: number,
  pageSize: number
): Product[] {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return products.slice(start, end);
}

/**
 * Get products from API
 */
export async function getProducts(
  filters?: ProductFilters,
  baseUrl?: string
): Promise<ProductsResponse> {
  const params = new URLSearchParams();

  if (filters?.q) params.set("q", filters.q);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.minPrice !== undefined) params.set("min", filters.minPrice.toString());
  if (filters?.maxPrice !== undefined) params.set("max", filters.maxPrice.toString());
  if (filters?.inStock !== undefined) params.set("inStock", filters.inStock.toString());
  if (filters?.sort) params.set("sort", filters.sort);
  if (filters?.page) params.set("page", filters.page.toString());
  if (filters?.pageSize) params.set("pageSize", filters.pageSize.toString());

  const url = baseUrl
    ? `${baseUrl}/api/products?${params.toString()}`
    : `/api/products?${params.toString()}`;

  const response = await fetch(url, {
    next: { revalidate: 60 }, // Cache for 1 minute
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  return response.json();
}

/**
 * Get single product by slug
 */
export async function getProductBySlug(
  slug: string,
  baseUrl?: string
): Promise<Product | null> {
  const { products } = await getProducts(undefined, baseUrl);
  return products.find((p) => p.slug === slug) || null;
}

/**
 * Get all unique categories from products
 */
export function getCategories(products: Product[]): string[] {
  const categories = new Set(products.map((p) => p.category));
  return Array.from(categories).sort();
}

/**
 * Get price range from products
 */
export function getPriceRange(products: Product[]): { min: number; max: number } {
  if (products.length === 0) {
    return { min: 0, max: 0 };
  }

  const prices = products.map((p) => p.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

/**
 * Get related products (same category, excluding current)
 */
export function getRelatedProducts(
  products: Product[],
  currentProduct: Product,
  limit: number = 4
): Product[] {
  return products
    .filter((p) => p.id !== currentProduct.id && p.category === currentProduct.category)
    .slice(0, limit);
}

/**
 * Get popular products (sorted by sold count)
 */
export function getPopularProducts(products: Product[], limit: number = 8): Product[] {
  return [...products].sort((a, b) => b.sold - a.sold).slice(0, limit);
}

/**
 * Get latest products (sorted by date)
 */
export function getLatestProducts(products: Product[], limit: number = 8): Product[] {
  return [...products]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, limit);
}
