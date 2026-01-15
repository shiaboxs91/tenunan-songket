import { createClient } from './client'
import type { Tables, Json } from './types'
import { createNotification } from './notifications'

export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderWithItems extends Order {
  items: (OrderItem & {
    product?: Tables<'products'> & {
      images?: Tables<'product_images'>[]
    }
  })[]
  shipping?: Tables<'shippings'>
  payment?: Tables<'payments'>
}

export interface CreateOrderInput {
  items: Array<{
    product_id: string
    product_title: string
    product_image: string | null
    price: number
    quantity: number
  }>
  shipping_address: {
    recipient_name: string
    phone: string
    address_line1: string
    address_line2?: string | null
    city: string
    state: string
    postal_code: string
    country: string
  }
  shipping_cost: number
  shipping_courier: string
  shipping_service: string
  notes?: string
  currency?: string
}

export interface OrderFilters {
  status?: OrderStatus
  page?: number
  pageSize?: number
}

export async function getOrders(filters: OrderFilters = {}): Promise<{
  orders: Order[]
  total: number
}> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { orders: [], total: 0 }

  const { page = 1, pageSize = 10, status } = filters
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching orders:', error)
    return { orders: [], total: 0 }
  }

  return {
    orders: data || [],
    total: count || 0,
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return data
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  if (error) {
    console.error('Error fetching order items:', error)
    return []
  }

  return data || []
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return data
}

export async function createOrder(input: CreateOrderInput): Promise<Order | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  if (!input.items || input.items.length === 0) {
    console.error('No items provided')
    return null
  }

  // Calculate totals
  const subtotal = input.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity)
  }, 0)

  const total = subtotal + input.shipping_cost

  // Create shipping address JSON
  const shippingAddress: Json = {
    recipient_name: input.shipping_address.recipient_name,
    phone: input.shipping_address.phone,
    address_line1: input.shipping_address.address_line1,
    address_line2: input.shipping_address.address_line2 || null,
    city: input.shipping_address.city,
    state: input.shipping_address.state,
    postal_code: input.shipping_address.postal_code,
    country: input.shipping_address.country,
  }

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pending',
      subtotal,
      shipping_cost: input.shipping_cost,
      discount: 0,
      total,
      currency: input.currency || 'IDR',
      shipping_address: shippingAddress,
      notes: input.notes || null,
    })
    .select()
    .single()

  if (orderError) {
    console.error('Error creating order:', orderError)
    return null
  }

  // Create order items
  for (const item of input.items) {
    await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: item.product_id,
        product_title: item.product_title,
        product_image: item.product_image,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      })

    // Reserve inventory
    await supabase.rpc('reserve_inventory', {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
      p_reference_id: order.id,
      p_reference_type: 'order',
      p_user_id: user.id,
    })
  }

  // Create shipping record
  await supabase
    .from('shippings')
    .insert({
      order_id: order.id,
      courier: input.shipping_courier,
      service: input.shipping_service,
      cost: input.shipping_cost,
    })

  // Clear user's cart
  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (cart) {
    await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id)
  }

  // Create notification for new order
  await createNotification(
    user.id,
    'order_created',
    'Pesanan Berhasil Dibuat',
    `Pesanan ${order.order_number} telah berhasil dibuat. Silakan lakukan pembayaran.`,
    { order_id: order.id, order_number: order.order_number }
  )

  return order
}

export async function cancelOrder(orderId: string): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  // Get order
  const order = await getOrderById(orderId)
  if (!order) return false

  // Only pending orders can be cancelled
  if (order.status !== 'pending') {
    console.error('Only pending orders can be cancelled')
    return false
  }

  // Get order items
  const orderItems = await getOrderItems(orderId)

  // Release inventory for each item
  for (const item of orderItems) {
    await supabase.rpc('release_inventory', {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
      p_reference_id: orderId,
      p_reference_type: 'order_cancel',
      p_user_id: user.id,
    })
  }

  // Update order status
  const { error } = await supabase
    .from('orders')
    .update({ 
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error cancelling order:', error)
    return false
  }

  return true
}

export async function getOrderStats(): Promise<{
  total: number
  pending: number
  processing: number
  completed: number
}> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { total: 0, pending: 0, processing: 0, completed: 0 }

  const { data, error } = await supabase
    .from('orders')
    .select('status')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching order stats:', error)
    return { total: 0, pending: 0, processing: 0, completed: 0 }
  }

  const stats = {
    total: data.length,
    pending: data.filter(o => o.status === 'pending').length,
    processing: data.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status || '')).length,
    completed: data.filter(o => o.status === 'delivered').length,
  }

  return stats
}
