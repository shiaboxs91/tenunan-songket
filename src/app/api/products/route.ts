import { NextRequest, NextResponse } from "next/server";
import { fetchRSSProducts } from "@/lib/rss";
import { filterProducts, sortProducts, paginateProducts } from "@/lib/products";
import { FilterState, SortOption, ProductsResponse, Product } from "@/lib/types";
import snapshotData from "@/data/products.snapshot.json";

/**
 * Validate sort option
 */
function isValidSortOption(value: string): value is SortOption {
  return ["newest", "price-asc", "price-desc", "bestselling", "rating"].includes(value);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Parse category parameter (supports comma-separated values)
  const categoryParam = searchParams.get("category");
  const categories = categoryParam 
    ? categoryParam.split(",").filter(Boolean) 
    : [];

  // Parse sort option with validation
  const sortParam = searchParams.get("sort");
  const sort: SortOption = sortParam && isValidSortOption(sortParam) ? sortParam : "newest";

  // Parse query parameters into FilterState
  const filters: FilterState = {
    q: searchParams.get("q") || undefined,
    categories,
    minPrice: searchParams.get("min") ? Number(searchParams.get("min")) : null,
    maxPrice: searchParams.get("max") ? Number(searchParams.get("max")) : null,
    inStockOnly: searchParams.get("inStock") === "true",
    sort,
  };

  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const pageSize = searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 12;

  let products: Product[];
  let source: "rss" | "snapshot" = "rss";

  try {
    // Try to fetch from RSS feed
    products = await fetchRSSProducts();
  } catch (error) {
    console.error("Failed to fetch RSS, using snapshot:", error);
    // Fallback to snapshot - snapshotData is directly an array
    products = snapshotData as unknown as Product[];
    source = "snapshot";
  }

  // Apply filters (supports multiple categories)
  let filteredProducts = filterProducts(products, filters);

  // Apply sorting (supports all sort options: newest, price-asc, price-desc, bestselling, rating)
  filteredProducts = sortProducts(filteredProducts, filters.sort);

  // Get total before pagination
  const total = filteredProducts.length;

  // Apply pagination
  const paginatedProducts = paginateProducts(filteredProducts, page, pageSize);

  const response: ProductsResponse = {
    products: paginatedProducts,
    total,
    page,
    pageSize,
    source,
  };

  return NextResponse.json(response);
}
