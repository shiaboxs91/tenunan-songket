'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { NotificationList } from './NotificationList'
import { 
  getUnreadCount, 
  subscribeToNotifications, 
  unsubscribeFromNotifications,
  type Notification 
} from '@/lib/supabase/notifications'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  // Get user ID and initial unread count
  useEffect(() => {
    const initializeNotifications = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserId(user.id)
        const count = await getUnreadCount(user.id)
        setUnreadCount(count)
      }
    }

    initializeNotifications()
  }, [])

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!userId) return

    const newChannel = subscribeToNotifications(userId, (notification: Notification) => {
      // Increment unread count when new notification arrives
      setUnreadCount(prev => prev + 1)
      
      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon.svg'
        })
      }
    })

    setChannel(newChannel)

    return () => {
      if (newChannel) {
        unsubscribeFromNotifications(newChannel)
      }
    }
  }, [userId])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const handleNotificationRead = () => {
    setUnreadCount(0)
  }

  if (!userId) {
    return null
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifikasi</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <NotificationList 
            userId={userId} 
            onNotificationRead={handleNotificationRead}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
