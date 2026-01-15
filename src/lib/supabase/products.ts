import { createClient } from './server'
import { createClient as createClientSide } from './client'
import type { Tables, PaginatedResponse } from './types'

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

// Server-side functions (for server components)
export async function getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
  const supabase = await createClient()
  
  const {
    category,
    minPrice,
    maxPrice,
    inStock,
    search,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 12
  } = filters

  let query = supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      category:categories(*)
    `, { count: 'exact' })
    .eq('is_active', true)
    .eq('is_deleted', false)

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

  // Apply pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return { data: [], total: 0, page, limit, totalPages: 0 }
  }

  return {
    data: (data || []) as unknown as Product[],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      category:categories(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('is_deleted', false)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data as unknown as Product
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const supabase = await createClient()

  // First get category ID
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()

  if (!category) return []

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      category:categories(*)
    `)
    .eq('category_id', category.id)
    .eq('is_active', true)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products by category:', error)
    return []
  }

  return (data || []) as unknown as Product[]
}

export async function searchProducts(query: string): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      category:categories(*)
    `)
    .eq('is_active', true)
    .eq('is_deleted', false)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(20)

  if (error) {
    console.error('Error searching products:', error)
    return []
  }

  return (data || []) as unknown as Product[]
}

export async function getPopularProducts(limit = 4): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      category:categories(*)
    `)
    .eq('is_active', true)
    .eq('is_deleted', false)
    .order('sold', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching popular products:', error)
    return []
  }

  return (data || []) as unknown as Product[]
}

export async function getLatestProducts(limit = 4): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      category:categories(*)
    `)
    .eq('is_active', true)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching latest products:', error)
    return []
  }

  return (data || []) as unknown as Product[]
}

export async function getProductById(productId: string): Promise<Product | null> {
  const supabase = await createClient()

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
  const supabase = createClientSide()

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
  const supabase = createClientSide()

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
  const supabase = createClientSide()

  const { error } = await supabase
    .from('products')
    .update({ is_deleted: true })
    .eq('id', productId)

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`)
  }
}

export async function getProductsClient(filters: ProductFilters & { includeInactive?: boolean } = {}): Promise<Product[]> {
  const supabase = createClientSide()
  
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
