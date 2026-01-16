'use client'

import { useEffect, useState, useCallback } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { setupConnectionRecovery } from '@/lib/supabase/realtime'

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error'

interface UseRealtimeConnectionOptions {
  channel: RealtimeChannel | null
  onReconnect?: () => void
}

/**
 * Hook to monitor realtime connection status and handle recovery
 */
export function useRealtimeConnection({ channel, onReconnect }: UseRealtimeConnectionOptions) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const [reconnectAttempts, setReconnectAttempts] = useState(0)

  const handleReconnect = useCallback(() => {
    setReconnectAttempts((prev) => prev + 1)
    setStatus('connected')
    onReconnect?.()
  }, [onReconnect])

  useEffect(() => {
    if (!channel) {
      setStatus('disconnected')
      return
    }

    // Setup connection recovery
    setupConnectionRecovery(channel, handleReconnect)

    // Monitor channel state
    const checkStatus = () => {
      const state = channel.state
      
      switch (state) {
        case 'joined':
          setStatus('connected')
          break
        case 'joining':
          setStatus('connecting')
          break
        case 'leaving':
        case 'closed':
          setStatus('disconnected')
          break
        default:
          setStatus('error')
      }
    }

    // Check status periodically
    const interval = setInterval(checkStatus, 5000)
    checkStatus() // Initial check

    return () => {
      clearInterval(interval)
    }
  }, [channel, handleReconnect])

  return { status, reconnectAttempts }
}
