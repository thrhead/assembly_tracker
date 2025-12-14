'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { toast } from 'sonner'

interface Notification {
    id: string
    title: string
    message: string
    type: string
    link?: string
    isRead: boolean
    createdAt: string
}

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications?limit=100')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
        } catch (error) {
            toast.error('Bildirim güncellenemedi')
        }
    }

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            })
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            toast.success('Tüm bildirimler okundu olarak işaretlendi')
        } catch (error) {
            toast.error('Bildirimler güncellenemedi')
        }
    }

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'SUCCESS':
                return <Badge className="bg-green-100 text-green-800">Başarılı</Badge>
            case 'WARNING':
                return <Badge className="bg-yellow-100 text-yellow-800">Uyarı</Badge>
            case 'ERROR':
                return <Badge className="bg-red-100 text-red-800">Hata</Badge>
            default:
                return <Badge className="bg-blue-100 text-blue-800">Bilgi</Badge>
        }
    }

    const unreadCount = notifications.filter(n => !n.isRead).length

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Bell className="h-6 w-6" />
                    <h1 className="text-2xl font-bold">Bildirimler</h1>
                    {unreadCount > 0 && (
                        <Badge variant="destructive">{unreadCount} Okunmamış</Badge>
                    )}
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" onClick={markAllAsRead}>
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Tümünü Okundu İşaretle
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Bell className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-gray-500">Henüz bildirim yok</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {notifications.map(notification => (
                        <Card
                            key={notification.id}
                            className={`transition-all ${!notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}
                        >
                            <CardContent className="py-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">{notification.title}</span>
                                            {getTypeBadge(notification.type)}
                                            {!notification.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                                        <p className="text-xs text-gray-400">
                                            {format(new Date(notification.createdAt), 'd MMMM yyyy, HH:mm', { locale: tr })}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
