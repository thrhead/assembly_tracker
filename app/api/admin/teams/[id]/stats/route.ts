import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { startOfMonth, subMonths, format } from 'date-fns'
import { tr } from 'date-fns/locale'

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const teamId = params.id

        // 1. Basic Stats
        const totalJobs = await prisma.jobAssignment.count({
            where: { teamId }
        })

        const completedJobs = await prisma.jobAssignment.count({
            where: {
                teamId,
                job: { status: 'COMPLETED' }
            }
        })

        const activeJobs = await prisma.jobAssignment.count({
            where: {
                teamId,
                job: { status: { in: ['PENDING', 'IN_PROGRESS'] } }
            }
        })

        // 2. Monthly Performance (Last 6 Months)
        const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5))

        const monthlyData = await prisma.jobAssignment.findMany({
            where: {
                teamId,
                job: {
                    status: 'COMPLETED',
                    updatedAt: { gte: sixMonthsAgo }
                }
            },
            include: {
                job: {
                    select: { updatedAt: true }
                }
            }
        })

        // Group by month
        const monthlyStats = new Map<string, number>()

        // Initialize last 6 months with 0
        for (let i = 0; i < 6; i++) {
            const date = subMonths(new Date(), i)
            const key = format(date, 'MMMM', { locale: tr })
            monthlyStats.set(key, 0)
        }

        // Fill with actual data
        monthlyData.forEach(assignment => {
            const date = assignment.job.updatedAt
            const key = format(date, 'MMMM', { locale: tr })
            if (monthlyStats.has(key)) {
                monthlyStats.set(key, (monthlyStats.get(key) || 0) + 1)
            }
        })

        // Convert to array and reverse to show oldest to newest
        const chartData = Array.from(monthlyStats.entries())
            .map(([name, value]) => ({ name, value }))
            .reverse()

        return NextResponse.json({
            overview: {
                total: totalJobs,
                completed: completedJobs,
                active: activeJobs
            },
            chartData
        })

    } catch (error) {
        console.error('Team stats error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
