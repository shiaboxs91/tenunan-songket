import { createClient } from './client'
import type { Tables } from './types'

export type Product = Tables<'products'> & {
  images?: Tables<'product_images'>[]
  category?: Tables<'categories'> | null
}

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  search?: string
  sortBy?: 'price' | 'created_at' | 'sold' | 'average_rating'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Client-side functions (for client components like admin)
export async function createProduct(productData: {
  title: string
  slug: string
  description?: string
  price: number
  sale_price?: number | null
  stock?: number
  weight?: number
  category_id?: string | null
  is_active?: boolean
  meta_title?: string | null
  meta_description?: string | null
}): Promise<Product> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`)
  }

  return data as Product
}

export async function updateProduct(
  productId: string,
  productData: Partial<Product>
): Promise<Product> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`)
  }

  return data as Product
}

export async function deleteProduct(productId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('products')
    .update({ is_deleted: true })
    .eq('id', productId)

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`)
  }
}

export async function getProductsClient(filters: ProductFilters & { includeInactive?: boolean } = {}): Promise<Product[]> {
  const supabase = createClient()
  
  const {
    category,
    minPrice,
    maxPrice,
    inStock,
    search,
    sortBy = 'created_at',
    sortOrder = 'desc',
    includeInactive = false
  } = filters

  let query = supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      category:categories(*)
    `)

  if (!includeInactive) {
    query = query.eq('is_active', true).eq('is_deleted', false)
  }

  // Apply filters
  if (category) {
    query = query.eq('category_id', category)
  }

  if (minPrice !== undefined) {
    query = query.gte('price', minPrice)
  }

  if (maxPrice !== undefined) {
    query = query.lte('price', maxPrice)
  }

  if (inStock) {
    query = query.gt('stock', 0)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return (data || []) as unknown as Product[]
}

export async function getProductById(productId: string): Promise<Product | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      category:categories(*)
    `)
    .eq('id', productId)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data as unknown as Product
}