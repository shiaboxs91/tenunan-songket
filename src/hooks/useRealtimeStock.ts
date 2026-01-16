'use client'

import { useEffect, useState } from 'react'
import { subscribeToStockUpdates, unsubscribeFromChannel, type StockUpdate } from '@/lib/supabase/realtime'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Hook to subscribe to realtime stock updates for specific products
 */
export function useRealtimeStock(productIds: string[]) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [stockUpdates, setStockUpdates] = useState<Map<string, StockUpdate>>(new Map())

  useEffect(() => {
    if (productIds.length === 0) return

    // Subscribe to stock updates
    const stockChannel = subscribeToStockUpdates(productIds, (product) => {
      setStockUpdates((prev) => {
        const newMap = new Map(prev)
        newMap.set(product.id, product)
        return newMap
      })
    })

    setChannel(stockChannel)

    // Cleanup on unmount
    return () => {
      if (stockChannel) {
        unsubscribeFromChannel(stockChannel)
      }
    }
  }, [productIds.join(',')])

  return { stockUpdates, channel }
}
