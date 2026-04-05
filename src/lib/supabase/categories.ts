import { createClient, createAnonClient } from './server'
import { createClient as createClientSide } from './client'
import type { Tables } from './types'
import { unstable_cache } from 'next/cache'

export type Category = Tables<'categories'>

// Server-side functions (for server components)
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching category:', error)
    return null
  }

  return data
}

// Type for the RPC function result
export interface CategoryWithCount {
  id: string
  name: string
  slug: string
  image_url: string | null
  display_order: number
  product_count: number
}

// Type for RPC response row (before transformation)
interface RpcCategoryRow {
  id: string
  name: string
  slug: string
  image_url: string | null
  display_order: number
  product_count: number | string // bigint comes as string from PostgreSQL
}

async function fetchCategoriesWithProductCount(): Promise<CategoryWithCount[]> {
  const supabase = createAnonClient()

  // Use database function for optimal performance - single query with JOIN and COUNT
  // This replaces the previous 2-query approach with a single RPC call
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_categories_with_count')

  if (error) {
    console.error('Error fetching categories with count:', error)
    // Fallback to legacy approach if RPC fails
    return fetchCategoriesWithProductCountFallback()
  }

  if (!data || !Array.isArray(data)) {
    return []
  }

  return (data as RpcCategoryRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    image_url: row.image_url,
    display_order: row.display_order,
    product_count: Number(row.product_count) || 0
  }))
}

// Fallback function if RPC is not available
async function fetchCategoriesWithProductCountFallback(): Promise<CategoryWithCount[]> {
  const supabase = createAnonClient()

  const [categoriesResult, productCountsResult] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug, image_url, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    
    supabase
      .from('products')
      .select('category_id')
      .eq('is_active', true)
      .eq('is_deleted', false)
  ])

  if (categoriesResult.error || !categoriesResult.data) {
    console.error('Error fetching categories:', categoriesResult.error)
    return []
  }

  const countMap = new Map<string, number>()
  if (productCountsResult.data) {
    for (const product of productCountsResult.data) {
      if (product.category_id) {
        countMap.set(product.category_id, (countMap.get(product.category_id) || 0) + 1)
      }
    }
  }

  return categoriesResult.data.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    image_url: category.image_url,
    display_order: category.display_order ?? 0,
    product_count: countMap.get(category.id) || 0
  }))
}

export const getCategoriesWithProductCount = unstable_cache(
  fetchCategoriesWithProductCount,
  ['categories-with-product-count'],
  {
    revalidate: 300, // 5 minutes
    tags: ['categories', 'products']
  }
)

// Client-side functions (for client components like admin)
export async function getCategoriesClient(): Promise<Category[]> {
  const supabase = createClientSide()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data
}

export async function createCategory(categoryData: {
  name: string
  slug: string
  description?: string
  image_url?: string
  display_order?: number
  is_active?: boolean
}): Promise<Category> {
  const supabase = createClientSide()

  const { data, error } = await supabase
    .from('categories')
    .insert([categoryData])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create category: ${error.message}`)
  }

  return data as Category
}

export async function updateCategory(
  categoryId: string,
  categoryData: Partial<Category>
): Promise<Category> {
  const supabase = createClientSide()

  const { data, error } = await supabase
    .from('categories')
    .update(categoryData)
    .eq('id', categoryId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update category: ${error.message}`)
  }

  return data as Category
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const supabase = createClientSide()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`)
  }
}
