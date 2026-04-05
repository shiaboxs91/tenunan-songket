import { Suspense } from "react";
import { Metadata } from "next";
import { ProductsClient } from "./ProductsClient";
import { getProducts } from "@/lib/supabase/products";
import { getCategoriesWithProductCount } from "@/lib/supabase/categories";
import { getColors } from "@/lib/supabase/colors.server";
import { toFrontendProducts } from "@/lib/supabase/adapters";
import ProductsLoading from "./loading";

// Force dynamic rendering karena halaman ini pakai searchParams
// Tidak boleh pakai ISR/revalidate karena konflik dengan searchParams
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: "Semua Produk - Tenunan Songket",
  description: "Lihat koleksi lengkap kain songket asli berkualitas tinggi. Filter berdasarkan kategori, warna, dan harga.",
  openGraph: {
    title: "Semua Produk - Tenunan Songket",
    description: "Lihat koleksi lengkap kain songket asli berkualitas tinggi.",
    type: "website",
  },
};

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Map frontend sort option to Supabase sort parameters
function mapSort(sort: string): { sortBy: 'price' | 'created_at' | 'sold' | 'average_rating', sortOrder: 'asc' | 'desc' } {
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

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  
  // Parse search params for initial server-side fetch
  const page = params.page ? Number(params.page) : 1;
  const sort = (params.sort as string) || "newest";
  const category = params.category as string | undefined;
  const colors = params.colors as string | undefined;
  const q = params.q as string | undefined;
  const minPrice = params.min ? Number(params.min) : undefined;
  const maxPrice = params.max ? Number(params.max) : undefined;
  const inStock = params.inStock === "true";
  
  const { sortBy, sortOrder } = mapSort(sort);
  
  // Parallel server-side data fetching - this is the key optimization!
  // All 3 queries run simultaneously instead of sequentially
  const [productsResult, categoriesData, colorsData] = await Promise.all([
    getProducts({
      search: q,
      categoryNames: category ? category.split(",") : undefined,
      colorSlugs: colors ? colors.split(",") : undefined,
      minPrice,
      maxPrice,
      inStock: inStock || undefined,
      sortBy,
      sortOrder,
      page,
      limit: 12,
    }),
    getCategoriesWithProductCount(),
    getColors(),
  ]);
  
  // Convert products to frontend format
  const initialProducts = toFrontendProducts(productsResult.data);
  
  // Transform colors data for the client component
  const initialColors = colorsData.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    hex_code: c.hex_code,
  }));
  
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsClient
        initialProducts={initialProducts}
        initialTotal={productsResult.total}
        initialPage={productsResult.page}
        initialCategories={categoriesData}
        initialColors={initialColors}
      />
    </Suspense>
  );
}
