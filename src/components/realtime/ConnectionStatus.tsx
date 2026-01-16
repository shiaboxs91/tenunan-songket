'use client'

import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ConnectionStatus as Status } from '@/hooks/useRealtimeConnection'

interface ConnectionStatusProps {
  status: Status
  reconnectAttempts?: number
  showLabel?: boolean
}

/**
 * Component to display realtime connection status
 */
export function ConnectionStatus({ 
  status, 
  reconnectAttempts = 0,
  showLabel = true 
}: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="h-3 w-3" />,
          label: 'Terhubung',
          variant: 'default' as const,
          className: 'bg-green-500 hover:bg-green-600'
        }
      case 'connecting':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          label: 'Menghubungkan...',
          variant: 'secondary' as const,
          className: ''
        }
      case 'disconnected':
        return {
          icon: <WifiOff className="h-3 w-3" />,
          label: 'Terputus',
          variant: 'secondary' as const,
          className: ''
        }
      case 'error':
        return {
          icon: <WifiOff className="h-3 w-3" />,
          label: 'Error',
          variant: 'destructive' as const,
          className: ''
        }
    }
  }

  const config = getStatusConfig()

  if (!showLabel) {
    return (
      <div className="flex items-center gap-1" title={config.label}>
        {config.icon}
      </div>
    )
  }

  return (
    <Badge variant={config.variant} className={config.className}>
      <span className="flex items-center gap-1">
        {config.icon}
        {config.label}
        {reconnectAttempts > 0 && status === 'connected' && (
          <span className="text-xs ml-1">({reconnectAttempts})</span>
        )}
      </span>
    </Badge>
  )
}
