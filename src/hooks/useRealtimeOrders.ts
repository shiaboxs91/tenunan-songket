'use client'

import { useEffect, useState } from 'react'
import { subscribeToOrderUpdates, unsubscribeFromChannel, type OrderUpdate } from '@/lib/supabase/realtime'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Hook to subscribe to realtime order updates for current user
 */
export function useRealtimeOrders(userId: string | null) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [latestUpdate, setLatestUpdate] = useState<OrderUpdate | null>(null)

  useEffect(() => {
    if (!userId) return

    // Subscribe to order updates
    const orderChannel = subscribeToOrderUpdates(userId, (order) => {
      setLatestUpdate(order)
    })

    setChannel(orderChannel)

    // Cleanup on unmount
    return () => {
      if (orderChannel) {
        unsubscribeFromChannel(orderChannel)
      }
    }
  }, [userId])

  return { latestUpdate, channel }
}
