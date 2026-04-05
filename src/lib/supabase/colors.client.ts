import { createClient } from './client'
import type { Color, ColorCreate, ColorUpdate, ProductColor } from './types'

// Note: Using 'as any' for table names because types.ts needs to be regenerated
// after adding new tables. This is a temporary workaround.

// ============================================
// Client-side functions (for admin components)
// ============================================

/**
 * Get all colors (including inactive) - Admin only
 */
export async function getAllColorsClient(): Promise<Color[]> {
  const supabase = createClient()

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
  const supabase = createClient()

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
  const supabase = createClient()

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
  const supabase = createClient()

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
  const supabase = createClient()

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
  const supabase = createClient()

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
  const supabase = createClient()

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
 * Get colors for multiple products in one query - Client side
 */
export async function getProductsColorsClient(productIds: string[]): Promise<Map<string, { name: string; slug: string; hex_code: string | null; is_primary: boolean }[]>> {
  if (productIds.length === 0) return new Map()

  const supabase = createClient()

  const { data, error } = await (supabase as any)
    .from('product_colors')
    .select(`
      product_id,
      is_primary,
      color:colors(name, slug, hex_code)
    `)
    .in('product_id', productIds)

  if (error) {
    console.error('Error fetching products colors:', error)
    return new Map()
  }

  const colorMap = new Map<string, { name: string; slug: string; hex_code: string | null; is_primary: boolean }[]>()

  for (const item of data || []) {
    const pid = item.product_id
    if (!colorMap.has(pid)) {
      colorMap.set(pid, [])
    }
    colorMap.get(pid)!.push({
      name: item.color.name,
      slug: item.color.slug,
      hex_code: item.color.hex_code,
      is_primary: item.is_primary,
    })
  }

  // Sort each product's colors: primary first, then by name
  colorMap.forEach((colors) => {
    colors.sort((a: { is_primary: boolean; name: string }, b: { is_primary: boolean; name: string }) => {
      if (a.is_primary && !b.is_primary) return -1
      if (!a.is_primary && b.is_primary) return 1
      return a.name.localeCompare(b.name)
    })
  })

  return colorMap
}

/**
 * Reorder colors - Admin only
 */
export async function reorderColors(orders: { id: string; display_order: number }[]): Promise<void> {
  const supabase = createClient()

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
