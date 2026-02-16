import Calendar from '@/components/admin/Calendar'
import { auth } from '@/lib/auth'
import { redirect } from '@/lib/navigation'

export default async function CalendarPage() {
    const session = await auth()

    if (!session || !['ADMIN', 'MANAGER', 'TEAM_LEAD'].includes(session.user.role)) {
        redirect('/login')
    }

    return (
        <div className="h-[calc(100vh-4rem)] p-4">
            <Calendar />
        </div>
    )
}
