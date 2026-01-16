import { createClient } from './client';
import type { Tables } from './types';

export type Category = Tables<'categories'>;

/**
 * Get all active categories (client-side)
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data;
}

/**
 * Get categories with product count (client-side)
 */
export async function getCategoriesWithProductCount(): Promise<(Category & { product_count: number })[]> {
  const supabase = createClient();

  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (catError || !categories) {
    console.error('Error fetching categories:', catError);
    return [];
  }

  // Get product counts for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('is_active', true)
        .eq('is_deleted', false);

      return {
        ...category,
        product_count: count || 0,
      };
    })
  );

  return categoriesWithCount;
}

/**
 * Get total product count (client-side)
 */
export async function getTotalProductCount(): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('is_deleted', false);

  if (error) {
    console.error('Error fetching product count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Create a new category (client-side, admin only)
 */
export async function createCategory(categoryData: {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order?: number;
  is_active?: boolean;
}): Promise<Category> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('categories')
    .insert([categoryData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }

  return data as Category;
}

/**
 * Update a category (client-side, admin only)
 */
export async function updateCategory(
  categoryId: string,
  categoryData: Partial<Category>
): Promise<Category> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('categories')
    .update(categoryData)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update category: ${error.message}`);
  }

  return data as Category;
}

/**
 * Delete a category (client-side, admin only)
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }
}

// Backward compatibility aliases
export { getCategories as getCategoriesClient };
export { getCategoriesWithProductCount as getCategoriesWithProductCountClient };
