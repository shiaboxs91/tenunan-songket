import { createClient } from './client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface OrderUpdate {
  id: string
  order_number: string
  status: string
  tracking_number: string | null
  updated_at: string
}

export interface StockUpdate {
  id: string
  name: string
  slug: string
  stock_quantity: number
  is_available: boolean
}

/**
 * Subscribe to order status updates for a specific user
 * Listens for changes to orders table where user_id matches
 */
export function subscribeToOrderUpdates(
  userId: string,
  onUpdate: (order: OrderUpdate) => void
): RealtimeChannel {
  const supabase = createClient()

  const channel = supabase
    .channel(`orders:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        const order = payload.new as OrderUpdate
        onUpdate(order)
      }
    )
    .subscribe()

  return channel
}

/**
 * Subscribe to stock updates for specific products
 * Listens for changes to products table stock_quantity
 */
export function subscribeToStockUpdates(
  productIds: string[],
  onUpdate: (product: StockUpdate) => void
): RealtimeChannel {
  const supabase = createClient()

  // Create a channel for product stock updates
  const channel = supabase
    .channel('product-stock-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'products'
      },
      (payload) => {
        const product = payload.new as StockUpdate
        // Only notify if this product is in our watch list
        if (productIds.includes(product.id)) {
          onUpdate(product)
        }
      }
    )
    .subscribe()

  return channel
}

/**
 * Subscribe to all stock updates (for admin dashboard)
 */
export function subscribeToAllStockUpdates(
  onUpdate: (product: StockUpdate) => void
): RealtimeChannel {
  const supabase = createClient()

  const channel = supabase
    .channel('all-product-stock-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'products'
      },
      (payload) => {
        const product = payload.new as StockUpdate
        onUpdate(product)
      }
    )
    .subscribe()

  return channel
}

/**
 * Subscribe to order status updates for admin
 * Listens for all order changes
 */
export function subscribeToAllOrderUpdates(
  onUpdate: (order: OrderUpdate) => void
): RealtimeChannel {
  const supabase = createClient()

  const channel = supabase
    .channel('all-orders')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'orders'
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const order = payload.new as OrderUpdate
          onUpdate(order)
        }
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from a realtime channel
 */
export async function unsubscribeFromChannel(channel: RealtimeChannel): Promise<void> {
  const supabase = createClient()
  await supabase.removeChannel(channel)
}

/**
 * Get channel connection status
 */
export function getChannelStatus(channel: RealtimeChannel): string {
  return channel.state
}

/**
 * Handle connection recovery
 * Automatically reconnects and syncs missed updates
 */
export function setupConnectionRecovery(
  channel: RealtimeChannel,
  onReconnect: () => void
): void {
  channel.on('system', {}, (payload) => {
    if (payload.status === 'CHANNEL_ERROR') {
      console.error('Realtime channel error:', payload)
    }
    
    if (payload.status === 'SUBSCRIBED') {
      console.log('Realtime channel subscribed')
      onReconnect()
    }
  })
}
