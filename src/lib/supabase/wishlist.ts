import { createClient } from './client'
import type { Tables } from './types'
import type { Product } from './products'

export type Wishlist = Tables<'wishlists'>
export type WishlistItem = Wishlist & {
  product?: Product
}

export async function getWishlist(): Promise<WishlistItem[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      *,
      product:products(
        *,
        images:product_images(*),
        category:categories(*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching wishlist:', error)
    return []
  }

  return (data || []) as unknown as WishlistItem[]
}

export async function addToWishlist(productId: string): Promise<Wishlist | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Check if already in wishlist
  const { data: existing } = await supabase
    .from('wishlists')
    .select('*')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  if (existing) return existing

  const { data, error } = await supabase
    .from('wishlists')
    .insert({
      user_id: user.id,
      product_id: productId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding to wishlist:', error)
    return null
  }

  return data
}

export async function removeFromWishlist(productId: string): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)

  if (error) {
    console.error('Error removing from wishlist:', error)
    return false
  }

  return true
}

export async function isInWishlist(productId: string): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  const { data } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  return !!data
}

export async function toggleWishlist(productId: string): Promise<boolean> {
  const isWishlisted = await isInWishlist(productId)
  
  if (isWishlisted) {
    await removeFromWishlist(productId)
    return false
  } else {
    await addToWishlist(productId)
    return true
  }
}
