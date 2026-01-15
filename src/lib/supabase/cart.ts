import { createClient } from './client'
import type { Tables } from './types'

export type Cart = Tables<'carts'>
export type CartItem = Tables<'cart_items'> & {
  product?: Tables<'products'> & {
    images?: Tables<'product_images'>[]
  }
}

export interface CartWithItems extends Cart {
  items: CartItem[]
}

export interface CartSummary {
  subtotal: number
  discount: number
  shipping: number
  total: number
  itemCount: number
}

export async function getCart(): Promise<CartWithItems | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: cart, error } = await supabase
    .from('carts')
    .select(`
      *,
      items:cart_items(
        *,
        product:products(
          *,
          images:product_images(*)
        )
      )
    `)
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching cart:', error)
    return null
  }

  return cart as CartWithItems | null
}

export async function getOrCreateCart(): Promise<Cart | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Try to get existing cart
  const { data: existingCart } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (existingCart) return existingCart

  // Create new cart
  const { data: newCart, error } = await supabase
    .from('carts')
    .insert({ user_id: user.id })
    .select()
    .single()

  if (error) {
    console.error('Error creating cart:', error)
    return null
  }

  return newCart
}

export async function addItem(
  productId: string,
  quantity: number = 1
): Promise<CartItem | null> {
  const supabase = createClient()
  const cart = await getOrCreateCart()
  
  if (!cart) return null

  // Check if item already exists
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cart.id)
    .eq('product_id', productId)
    .single()

  if (existingItem) {
    // Update quantity
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating cart item:', error)
      return null
    }
    return data
  }

  // Insert new item
  const { data, error } = await supabase
    .from('cart_items')
    .insert({
      cart_id: cart.id,
      product_id: productId,
      quantity,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding cart item:', error)
    return null
  }

  return data
}

export async function updateQuantity(
  itemId: string,
  quantity: number
): Promise<CartItem | null> {
  const supabase = createClient()

  if (quantity <= 0) {
    await removeItem(itemId)
    return null
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    console.error('Error updating quantity:', error)
    return null
  }

  return data
}

export async function removeItem(itemId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    console.error('Error removing item:', error)
    return false
  }

  return true
}

export async function clearCart(): Promise<boolean> {
  const supabase = createClient()
  const cart = await getCart()
  
  if (!cart) return false

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cart.id)

  if (error) {
    console.error('Error clearing cart:', error)
    return false
  }

  return true
}

export function calculateCartSummary(cart: CartWithItems | null): CartSummary {
  if (!cart || !cart.items) {
    return { subtotal: 0, discount: 0, shipping: 0, total: 0, itemCount: 0 }
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.product?.sale_price || item.product?.price || 0
    return sum + (Number(price) * item.quantity)
  }, 0)

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  // TODO: Calculate discount from coupon
  const discount = 0
  
  // TODO: Calculate shipping based on address
  const shipping = 0

  return {
    subtotal,
    discount,
    shipping,
    total: subtotal - discount + shipping,
    itemCount,
  }
}
