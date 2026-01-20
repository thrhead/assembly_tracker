import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { markAllNotificationsAsRead } from '@/lib/notifications'

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await markAllNotificationsAsRead(session.user.id)

    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    console.error('Mark all notifications as read error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
