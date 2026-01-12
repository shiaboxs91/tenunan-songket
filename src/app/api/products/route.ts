import { NextRequest, NextResponse } from "next/server";
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

  // Use snapshot data directly - single source of truth from data_produk
  const products: Product[] = snapshotData as unknown as Product[];

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
    source: "snapshot",
  };

  return NextResponse.json(response);
}
