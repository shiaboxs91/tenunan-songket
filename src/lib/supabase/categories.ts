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

async function fetchCategoriesWithProductCount(): Promise<(Category & { product_count: number })[]> {
  const supabase = createAnonClient()

  // Execute both queries in parallel - 2 queries total instead of N+1
  const [categoriesResult, productCountsResult] = await Promise.all([
    // Query 1: Get all active categories
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    
    // Query 2: Get product counts grouped by category using raw count
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

  // Build count map from products
  const countMap = new Map<string, number>()
  if (productCountsResult.data) {
    for (const product of productCountsResult.data) {
      if (product.category_id) {
        countMap.set(product.category_id, (countMap.get(product.category_id) || 0) + 1)
      }
    }
  }

  // Merge counts with categories
  const categoriesWithCount = categoriesResult.data.map((category) => ({
    ...category,
    product_count: countMap.get(category.id) || 0
  }))

  return categoriesWithCount
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
