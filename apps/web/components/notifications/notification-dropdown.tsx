'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BellIcon, CheckIcon, Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export function NotificationDropdown() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications.slice(0, 5)) // Show only last 5
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: 'PATCH'
        })
        fetchNotifications()
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    }

    // Navigate to link
    if (notification.link) {
      router.push(notification.link)
    }
    setOpen(false)
  }

  const handleMarkAllAsRead = async () => {
    setLoading(true)
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH'
      })
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return '✅'
      case 'WARNING':
        return '⚠️'
      case 'ERROR':
        return '❌'
      default:
        return '📢'
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Bildirimler</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={loading}
              className="h-6 text-xs"
            >
              {loading ? (
                <Loader2Icon className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <CheckIcon className="h-3 w-3 mr-1" />
                  Tümünü Okundu İşaretle
                </>
              )}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Bildiriminiz bulunmuyor
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-2 w-full">
                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { 
                        addSuffix: true,
                        locale: tr 
                      })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                router.push('/worker/notifications')
                setOpen(false)
              }}
              className="text-center justify-center text-indigo-600 font-medium"
            >
              Tümünü Gör
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
