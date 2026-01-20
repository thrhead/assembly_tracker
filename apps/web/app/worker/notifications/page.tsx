import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import Link from 'next/link'

async function getNotifications(userId: string) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function NotificationsPage() {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }

  const notifications = await getNotifications(session.user.id)

  const groupNotificationsByDate = (notifications: any[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const thisWeek = new Date(today)
    thisWeek.setDate(thisWeek.getDate() - 7)

    return {
      today: notifications.filter(n => new Date(n.createdAt) >= today),
      yesterday: notifications.filter(n => {
        const date = new Date(n.createdAt)
        return date >= yesterday && date < today
      }),
      thisWeek: notifications.filter(n => {
        const date = new Date(n.createdAt)
        return date >= thisWeek && date < yesterday
      }),
      older: notifications.filter(n => new Date(n.createdAt) < thisWeek)
    }
  }

  const grouped = groupNotificationsByDate(notifications)
  const unreadCount = notifications.filter(n => !n.isRead).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return '✅'
      case 'WARNING': return '⚠️'
      case 'ERROR': return '❌'
      default: return '📢'
    }
  }

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'bg-green-50 border-green-200'
      case 'WARNING': return 'bg-yellow-50 border-yellow-200'
      case 'ERROR': return 'bg-red-50 border-red-200'
      default: return 'bg-blue-50 border-blue-200'
    }
  }

  const NotificationGroup = ({ title, items }: { title: string, items: any[] }) => {
    if (items.length === 0) return null

    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">{title}</h3>
        <div className="space-y-2">
          {items.map((notification) => (
            <Link
              key={notification.id}
              href={notification.link || '#'}
              className="block"
            >
              <Card className={`hover:shadow-md transition-shadow ${
                !notification.isRead ? getNotificationBgColor(notification.type) : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: tr
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bildirimler</h1>
        <p className="text-gray-600 mt-1">
          {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
        </p>
      </div>

      {/* Notifications */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900">Bildiriminiz bulunmuyor</h3>
            <p className="text-gray-500 mt-1">Yeni bildirimler burada görünecek</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <NotificationGroup title="Bugün" items={grouped.today} />
          <NotificationGroup title="Dün" items={grouped.yesterday} />
          <NotificationGroup title="Bu Hafta" items={grouped.thisWeek} />
          <NotificationGroup title="Daha Eski" items={grouped.older} />
        </>
      )}
    </div>
  )
}
