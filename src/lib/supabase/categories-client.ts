import { createClient } from './client'
import type { Tables } from './types'

export type Category = Tables<'categories'>

// Client-side functions (for client components like admin)
export async function getCategoriesClient(): Promise<Category[]> {
  const supabase = createClient()

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
  const supabase = createClient()

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
  const supabase = createClient()

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
  const supabase = createClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`)
  }
}