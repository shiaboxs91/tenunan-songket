import { createClient, createAnonClient } from './server'
import { createClient as createClientSide } from './client'
import type { Tables, PaginatedResponse } from './types'
import { unstable_cache } from 'next/cache'

export type Product = Tables<'products'> & {
  images?: Tables<'product_images'>[]
  category?: Tables<'categories'> | null
}

export interface ProductFilters {
  category?: string          // category_id (UUID)
  categoryName?: string      // category name (for frontend filter)
  categoryNames?: string[]   // multiple category names
  colorSlugs?: string[]      // color slugs for filtering
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
  const supabase = createAnonClient()
  
  const {
    category,
    categoryName,
    categoryNames,
    colorSlugs,
    minPrice,
    maxPrice,
    inStock,
    search,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 12
  } = filters

  // If filtering by category names, first get category IDs
  let categoryIds: string[] = []
  if (categoryNames && categoryNames.length > 0) {
    const { data: cats } = await supabase
      .from('categories')
      .select('id, name')
      .in('name', categoryNames)
    
    if (cats && cats.length > 0) {
      categoryIds = cats.map(c => c.id)
    }
  } else if (categoryName) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single()
    
    if (cat) {
      categoryIds = [cat.id]
    }
  }

  // If filtering by color slugs, get product IDs that have those colors
  let productIdsWithColors: string[] | null = null
  if (colorSlugs && colorSlugs.length > 0) {
    // First get color IDs from slugs
    const { data: colorData } = await (supabase as any)
      .from('colors')
      .select('id')
      .in('slug', colorSlugs)
      .eq('is_active', true)
    
    if (colorData && colorData.length > 0) {
      const colorIds = colorData.map((c: { id: string }) => c.id)
      
      // Get product IDs that have any of these colors (OR logic)
      const { data: productColorData } = await (supabase as any)
        .from('product_colors')
        .select('product_id')
        .in('color_id', colorIds)
      
      if (productColorData && productColorData.length > 0) {
        // Get unique product IDs
        const uniqueIds = new Set<string>(productColorData.map((pc: { product_id: string }) => pc.product_id))
        productIdsWithColors = Array.from(uniqueIds)
      } else {
        // No products match these colors, return empty
        return { data: [], total: 0, page, limit, totalPages: 0 }
      }
    } else {
      // Color slugs don't exist, return empty
      return { data: [], total: 0, page, limit, totalPages: 0 }
    }
  }

  let query = supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      category:categories(*)
    `, { count: 'exact' })
    .eq('is_active', true)
    .eq('is_deleted', false)

  // Apply color filter (product IDs)
  if (productIdsWithColors !== null) {
    query = query.in('id', productIdsWithColors)
  }

  // Apply filters
  if (category) {
    query = query.eq('category_id', category)
  } else if (categoryIds.length === 1) {
    query = query.eq('category_id', categoryIds[0])
  } else if (categoryIds.length > 1) {
    query = query.in('category_id', categoryIds)
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
  const supabase = createAnonClient()

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
    // console.error('Error fetching product:', error)
    return null
  }

  return data as unknown as Product
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const supabase = createAnonClient()

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
  const supabase = createAnonClient()

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

async function fetchPopularProducts(limit = 4): Promise<Product[]> {
  const supabase = createAnonClient()

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

export const getPopularProducts = unstable_cache(
  fetchPopularProducts,
  ['popular-products'],
  {
    revalidate: 300, // 5 minutes
    tags: ['products', 'popular-products']
  }
)

async function fetchLatestProducts(limit = 4): Promise<Product[]> {
  const supabase = createAnonClient()

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

export const getLatestProducts = unstable_cache(
  fetchLatestProducts,
  ['latest-products'],
  {
    revalidate: 300, // 5 minutes
    tags: ['products', 'latest-products']
  }
)

export async function getProductById(productId: string): Promise<Product | null> {
  const supabase = createAnonClient()

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

export async function getCategoryCounts(): Promise<{ name: string; slug: string; count: number }[]> {
  const supabase = createAnonClient()

  // Get all active categories
  const { data: categories, error: categoryError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (categoryError) {
    console.error('Error fetching categories:', categoryError)
    return []
  }

  // Get product counts for each category
  // Note: This could be optimized with a raw RPC or view, but for now we'll do it purely via query
  const counts: { name: string; slug: string; count: number }[] = []

  for (const category of categories) {
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id)
      .eq('is_active', true)
      .eq('is_deleted', false)

    if (!countError) {
      counts.push({
        name: category.name,
        slug: category.slug,
        count: count || 0
      })
    }
  }

  return counts
}
