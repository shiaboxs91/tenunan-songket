import { createClient } from './server'
import { createClient as createClientSide } from './client'
import type { Tables } from './types'

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

export async function getCategoriesWithProductCount(): Promise<(Category & { product_count: number })[]> {
  const supabase = await createClient()

  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (catError || !categories) {
    console.error('Error fetching categories:', catError)
    return []
  }

  // Get product counts for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('is_active', true)
        .eq('is_deleted', false)

      return {
        ...category,
        product_count: count || 0
      }
    })
  )

  return categoriesWithCount
}

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
