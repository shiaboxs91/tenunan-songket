import { createClient } from './client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  data: any
  is_read: boolean | null
  created_at: string | null
}

export type NotificationType = 
  | 'order_created'
  | 'order_paid'
  | 'order_processing'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'review_published'
  | 'product_back_in_stock'
  | 'coupon_available'

/**
 * Get notifications for the current user
 */
export async function getNotifications(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Notification[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient()

  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return 0
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    return !error
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    return !error
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    return !error
  } catch (error) {
    console.error('Error deleting notification:', error)
    return false
  }
}

/**
 * Create a notification
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: any
): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data: data || null,
        is_read: false
      })

    return !error
  } catch (error) {
    console.error('Error creating notification:', error)
    return false
  }
}

/**
 * Subscribe to realtime notifications for a user
 * Returns a channel that can be unsubscribed
 */
export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: Notification) => void
): RealtimeChannel {
  const supabase = createClient()

  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        onNotification(payload.new as Notification)
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from notifications
 */
export async function unsubscribeFromNotifications(channel: RealtimeChannel): Promise<void> {
  const supabase = createClient()
  await supabase.removeChannel(channel)
}

/**
 * Helper function to create order status notification
 */
export async function createOrderStatusNotification(
  userId: string,
  orderId: string,
  orderNumber: string,
  status: string
): Promise<boolean> {
  const statusMessages: Record<string, { title: string; message: string; type: NotificationType }> = {
    paid: {
      title: 'Pembayaran Berhasil',
      message: `Pembayaran untuk pesanan ${orderNumber} telah berhasil diproses`,
      type: 'order_paid'
    },
    processing: {
      title: 'Pesanan Diproses',
      message: `Pesanan ${orderNumber} sedang diproses`,
      type: 'order_processing'
    },
    shipped: {
      title: 'Pesanan Dikirim',
      message: `Pesanan ${orderNumber} telah dikirim`,
      type: 'order_shipped'
    },
    delivered: {
      title: 'Pesanan Diterima',
      message: `Pesanan ${orderNumber} telah sampai di tujuan`,
      type: 'order_delivered'
    },
    cancelled: {
      title: 'Pesanan Dibatalkan',
      message: `Pesanan ${orderNumber} telah dibatalkan`,
      type: 'order_cancelled'
    }
  }

  const notification = statusMessages[status]
  if (!notification) {
    return false
  }

  return createNotification(
    userId,
    notification.type,
    notification.title,
    notification.message,
    { order_id: orderId, order_number: orderNumber }
  )
}
