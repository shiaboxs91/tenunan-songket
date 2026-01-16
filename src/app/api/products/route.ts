import { NextRequest, NextResponse } from "next/server";
import { getProducts as getSupabaseProducts } from "@/lib/supabase/products";
import { toFrontendProducts } from "@/lib/supabase/adapters";
import { SortOption, ProductsResponse } from "@/lib/types";

/**
 * Validate sort option
 */
function isValidSortOption(value: string): value is SortOption {
  return ["newest", "price-asc", "price-desc", "bestselling", "rating"].includes(value);
}

/**
 * Map frontend sort option to Supabase sort parameters
 */
function mapSortToSupabase(sort: SortOption): { sortBy: 'price' | 'created_at' | 'sold' | 'average_rating', sortOrder: 'asc' | 'desc' } {
  switch (sort) {
    case 'price-asc':
      return { sortBy: 'price', sortOrder: 'asc' };
    case 'price-desc':
      return { sortBy: 'price', sortOrder: 'desc' };
    case 'bestselling':
      return { sortBy: 'sold', sortOrder: 'desc' };
    case 'rating':
      return { sortBy: 'average_rating', sortOrder: 'desc' };
    case 'newest':
    default:
      return { sortBy: 'created_at', sortOrder: 'desc' };
  }
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

  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const pageSize = searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 12;
  const search = searchParams.get("q") || undefined;
  const minPrice = searchParams.get("min") ? Number(searchParams.get("min")) : undefined;
  const maxPrice = searchParams.get("max") ? Number(searchParams.get("max")) : undefined;
  const inStock = searchParams.get("inStock") === "true";

  try {
    // Fetch from Supabase database
    const { sortBy, sortOrder } = mapSortToSupabase(sort);
    
    const supabaseResult = await getSupabaseProducts({
      category: categories[0], // Supabase currently supports single category
      minPrice,
      maxPrice,
      inStock: inStock || undefined,
      search,
      sortBy,
      sortOrder,
      page,
      limit: pageSize,
    });

    // Convert to frontend format
    const products = toFrontendProducts(supabaseResult.data);

    // If multiple categories selected, filter client-side
    let filteredProducts = products;
    if (categories.length > 1) {
      filteredProducts = products.filter(p => categories.includes(p.category));
    }

    const response: ProductsResponse = {
      products: filteredProducts,
      total: supabaseResult.total,
      page: supabaseResult.page,
      pageSize: supabaseResult.limit,
      source: "database",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch products from database:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch products",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
