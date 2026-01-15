'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { 
  Bell, 
  Package, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  XCircle,
  Star,
  Tag,
  Loader2,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type Notification
} from '@/lib/supabase/notifications'

interface NotificationListProps {
  userId: string
  onNotificationRead?: () => void
}

const notificationIcons: Record<string, any> = {
  order_created: Package,
  order_paid: CreditCard,
  order_processing: Package,
  order_shipped: Truck,
  order_delivered: CheckCircle,
  order_cancelled: XCircle,
  review_published: Star,
  product_back_in_stock: Package,
  coupon_available: Tag,
}

export function NotificationList({ userId, onNotificationRead }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [userId])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await getNotifications(userId, 50)
      setNotifications(data)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    const success = await markAsRead(notificationId)
    if (success) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      onNotificationRead?.()
    }
  }

  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead(userId)
    if (success) {
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      )
      onNotificationRead?.()
    }
  }

  const handleDelete = async (notificationId: string) => {
    const success = await deleteNotification(notificationId)
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: idLocale
      })
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Tidak ada notifikasi</p>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {unreadCount} notifikasi belum dibaca
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
          >
            Tandai semua dibaca
          </Button>
        </div>
      )}

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.type] || Bell
            const isUnread = !notification.is_read

            return (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  isUnread
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-background border-border hover:bg-muted'
                }`}
              >
                <div className="flex gap-3">
                  <div className={`flex-shrink-0 ${isUnread ? 'text-blue-600' : 'text-muted-foreground'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${isUnread ? 'text-blue-900' : ''}`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {isUnread && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-8 w-8 p-0"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
