'use server'

import { getCalendarEvents } from '@/lib/data/calendar'
import { auth } from '@/lib/auth'

export async function getCalendarEventsAction(start: Date, end: Date) {
    const session = await auth()

    if (!session || !['ADMIN', 'TEAM_LEAD'].includes(session.user.role)) {
        throw new Error('Yetkisiz işlem')
    }

    return await getCalendarEvents({ start, end })
}
