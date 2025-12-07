import Calendar from '@/components/admin/Calendar'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function CalendarPage() {
    const session = await auth()

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'TEAM_LEAD')) {
        redirect('/auth/login')
    }

    return (
        <div className="h-[calc(100vh-4rem)] p-4">
            <Calendar />
        </div>
    )
}
