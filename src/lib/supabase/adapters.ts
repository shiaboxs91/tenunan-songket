/**
 * Adapters to convert Supabase data to frontend types
 * This maintains backward compatibility with existing components
 */

import type { Product as SupabaseProduct } from './products'
import type { Product as FrontendProduct } from '../types'

/**
 * Convert Supabase product to frontend Product type
 */
export function toFrontendProduct(product: SupabaseProduct): FrontendProduct {
  // Get primary image or first image
  const primaryImage = product.images?.find(img => img.is_primary)?.url
    || product.images?.[0]?.url
    || '/images/placeholder-product.svg'

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description || '',
    image: primaryImage,
    price: Number(product.price),
    currency: 'IDR',
    category: product.category?.name || 'Lainnya',
    tags: [], // Supabase doesn't have tags yet
    inStock: (product.stock || 0) > 0,
    rating: Number(product.average_rating) || 0,
    sold: product.sold || 0,
    createdAt: product.created_at || undefined,
    sourceUrl: product.source_url || '',
  }
}

/**
 * Convert array of Supabase products to frontend format
 */
export function toFrontendProducts(products: SupabaseProduct[]): FrontendProduct[] {
  return products.map(toFrontendProduct)
}
