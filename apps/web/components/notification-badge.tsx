'use client'

import { Bell } from 'lucide-react'
import { useSocket } from '@/components/providers/socket-provider'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function NotificationBadge() {
    const { socket, isConnected } = useSocket()
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        if (!socket || !isConnected) return

        // Listen to all notification events and increment counter
        const handleNotification = () => {
            setUnreadCount(prev => prev + 1)
        }

        socket.on('job:completed', handleNotification)
        socket.on('cost:submitted', handleNotification)
        socket.on('cost:approved', handleNotification)
        socket.on('step:completed', handleNotification)
        socket.on('notification:new', handleNotification)

        return () => {
            socket.off('job:completed', handleNotification)
            socket.off('cost:submitted', handleNotification)
            socket.off('cost:approved', handleNotification)
            socket.off('step:completed', handleNotification)
            socket.off('notification:new', handleNotification)
        }
    }, [socket, isConnected])

    const handleClick = () => {
        // Reset counter when clicked
        setUnreadCount(0)
        // Future: Open notifications panel
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={handleClick}
            title="Bildirimler"
        >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className={cn(
                    "absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center",
                    unreadCount > 9 && "text-[10px]"
                )}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </Button>
    )
}
