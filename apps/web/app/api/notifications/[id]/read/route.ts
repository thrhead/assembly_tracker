import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { markNotificationAsRead } from '@/lib/notifications'

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await props.params
    const { id } = params

    await markNotificationAsRead(id, session.user.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Mark notification as read error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
