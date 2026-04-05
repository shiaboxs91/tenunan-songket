import { createClient } from './server'
import type { Color, ProductColor } from './types'
import { unstable_cache } from 'next/cache'

// Note: Using 'as any' for table names because types.ts needs to be regenerated
// after adding new tables. This is a temporary workaround.

// ============================================
// Server-side functions (for server components)
// ============================================

/**
 * Get all active colors (for public use)
 */
async function fetchColors(): Promise<Color[]> {
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('colors')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching colors:', error)
    return []
  }

  return data as Color[]
}

export const getColors = unstable_cache(
  fetchColors,
  ['active-colors'],
  {
    revalidate: 600, // 10 minutes - colors rarely change
    tags: ['colors']
  }
)

/**
 * Get color by slug
 */
export async function getColorBySlug(slug: string): Promise<Color | null> {
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('colors')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching color:', error)
    return null
  }

  return data as Color
}

/**
 * Get colors for a product
 */
export async function getProductColors(productId: string): Promise<(ProductColor & { color: Color })[]> {
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('product_colors')
    .select(`
      product_id,
      color_id,
      is_primary,
      color:colors(*)
    `)
    .eq('product_id', productId)

  if (error) {
    console.error('Error fetching product colors:', error)
    return []
  }

  return (data || []).map((item: any) => ({
    product_id: item.product_id,
    color_id: item.color_id,
    is_primary: item.is_primary,
    color: item.color as Color
  }))
}

/**
 * Get multiple products' colors in one query
 */
export async function getProductsColors(productIds: string[]): Promise<Map<string, (ProductColor & { color: Color })[]>> {
  if (productIds.length === 0) return new Map()
  
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('product_colors')
    .select(`
      product_id,
      color_id,
      is_primary,
      color:colors(*)
    `)
    .in('product_id', productIds)

  if (error) {
    console.error('Error fetching products colors:', error)
    return new Map()
  }

  const colorMap = new Map<string, (ProductColor & { color: Color })[]>()
  
  for (const item of data || []) {
    const productId = item.product_id
    if (!colorMap.has(productId)) {
      colorMap.set(productId, [])
    }
    colorMap.get(productId)!.push({
      product_id: item.product_id,
      color_id: item.color_id,
      is_primary: item.is_primary,
      color: item.color as Color
    })
  }

  return colorMap
}
