import { createClient } from './server'
import { createClient as createClientSide } from './client'
import type { Color, ColorCreate, ColorUpdate, ProductColor } from './types'

// Note: Using 'as any' for table names because types.ts needs to be regenerated
// after adding new tables. This is a temporary workaround.

// ============================================
// Server-side functions (for server components)
// ============================================

/**
 * Get all active colors (for public use)
 */
export async function getColors(): Promise<Color[]> {
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

// ============================================
// Client-side functions (for admin components)
// ============================================

/**
 * Get all colors (including inactive) - Admin only
 */
export async function getAllColorsClient(): Promise<Color[]> {
  const supabase = createClientSide()

  const { data, error } = await (supabase as any)
    .from('colors')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching colors:', error)
    return []
  }

  return data as Color[]
}

/**
 * Get active colors - Client side
 */
export async function getColorsClient(): Promise<Color[]> {
  const supabase = createClientSide()

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

/**
 * Create a new color - Admin only
 */
export async function createColor(colorData: ColorCreate): Promise<Color> {
  const supabase = createClientSide()

  const { data, error } = await (supabase as any)
    .from('colors')
    .insert([colorData])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create color: ${error.message}`)
  }

  return data as Color
}

/**
 * Update a color - Admin only
 */
export async function updateColor(colorId: string, colorData: ColorUpdate): Promise<Color> {
  const supabase = createClientSide()

  const { data, error } = await (supabase as any)
    .from('colors')
    .update(colorData)
    .eq('id', colorId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update color: ${error.message}`)
  }

  return data as Color
}

/**
 * Delete a color - Admin only
 */
export async function deleteColor(colorId: string): Promise<void> {
  const supabase = createClientSide()

  const { error } = await (supabase as any)
    .from('colors')
    .delete()
    .eq('id', colorId)

  if (error) {
    throw new Error(`Failed to delete color: ${error.message}`)
  }
}

/**
 * Set colors for a product - Admin only
 * This replaces all existing colors for the product
 */
export async function setProductColors(
  productId: string, 
  colorIds: string[], 
  primaryColorId?: string
): Promise<void> {
  const supabase = createClientSide()

  // Delete existing product colors
  const { error: deleteError } = await (supabase as any)
    .from('product_colors')
    .delete()
    .eq('product_id', productId)

  if (deleteError) {
    throw new Error(`Failed to clear product colors: ${deleteError.message}`)
  }

  // Insert new colors if any
  if (colorIds.length > 0) {
    const productColors = colorIds.map(colorId => ({
      product_id: productId,
      color_id: colorId,
      is_primary: colorId === primaryColorId
    }))

    const { error: insertError } = await (supabase as any)
      .from('product_colors')
      .insert(productColors)

    if (insertError) {
      throw new Error(`Failed to set product colors: ${insertError.message}`)
    }
  }
}

/**
 * Get colors for a product - Client side
 */
export async function getProductColorsClient(productId: string): Promise<(ProductColor & { color: Color })[]> {
  const supabase = createClientSide()

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
 * Reorder colors - Admin only
 */
export async function reorderColors(orders: { id: string; display_order: number }[]): Promise<void> {
  const supabase = createClientSide()

  for (const order of orders) {
    const { error } = await (supabase as any)
      .from('colors')
      .update({ display_order: order.display_order })
      .eq('id', order.id)

    if (error) {
      throw new Error(`Failed to reorder colors: ${error.message}`)
    }
  }
}
