import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'

export async function GET(req: Request) {
    try {
        const session = await verifyAuth(req)
        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const jobs = await prisma.job.findMany({
            where: {
                status: { in: ['PLANNED', 'ASSIGNED', 'IN_PROGRESS'] }
            },
            include: {
                assignments: {
                    include: {
                        team: true
                    }
                },
                customer: {
                    select: { company: true }
                }
            },
            orderBy: {
                scheduledDate: 'asc'
            }
        })

        const teams = await prisma.team.findMany({
            select: {
                id: true,
                name: true
            }
        })

        return NextResponse.json({
            jobs: jobs.map(job => ({
                id: job.id,
                title: job.title,
                status: job.status,
                customer: job.customer.company,
                start: job.scheduledDate,
                end: job.completedDate, // Might be null
                teamId: job.assignments[0]?.teamId || null,
                teamName: job.assignments[0]?.team?.name || 'Atanmamış'
            })),
            teams
        })
    } catch (error) {
        console.error('Fetch planning data error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
