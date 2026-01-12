// Product Types
export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image?: string;
  price: number;
  currency: "IDR";
  category: string;
  tags: string[];
  inStock: boolean;
  rating: number;
  sold: number;
  createdAt?: string;
  sourceUrl: string;
};

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  lastUpdated: string;
}

// Checkout Types
export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

export interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  shippingOption: ShippingOption;
}

// API Types
export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  source: "rss" | "snapshot";
}

export interface ProductFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: "newest" | "cheapest" | "bestselling";
  page?: number;
  pageSize?: number;
}

// RSS Types
export interface RSSItem {
  guid?: string;
  link: string;
  title: string;
  description?: string;
  "content:encoded"?: string;
  pubDate?: string;
  enclosure?: { url: string };
  "media:content"?: { url: string };
}

// Sort Options (extended per design)
export type SortOption = 
  | "newest" 
  | "price-asc" 
  | "price-desc" 
  | "bestselling" 
  | "rating";

// Filter State for URL-based hook (useProductFilters)
export interface FilterState {
  categories: string[];
  minPrice: number | null;
  maxPrice: number | null;
  inStockOnly: boolean;
  sort: SortOption;
  q?: string;
}

// Filter State for page-level components (FilterSidebar, products page)
export interface PageFilterState {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: SortOption;
}

// Categories
export const PRODUCT_CATEGORIES = [
  "Beragi",
  "Arap Gegati",
  "Bertabur",
  "Jongsarat",
  "Si Pugut",
  "Silubang Bangsi",
  "Tajung",
  "Lainnya",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
