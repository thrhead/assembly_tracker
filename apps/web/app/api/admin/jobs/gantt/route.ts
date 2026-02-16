
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdminOrManager } from '@/lib/auth-helper'

export async function GET(req: Request) {
    try {
        const session = await verifyAdminOrManager(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const teamId = searchParams.get('teamId')

        const where: any = {}
        if (status && status !== 'all') where.status = status
        if (teamId && teamId !== 'all') {
            where.assignments = { some: { teamId } }
        }

        const jobs = await prisma.job.findMany({
            where,
            orderBy: [
                { ganttOrder: 'asc' },
                { scheduledDate: 'asc' }
            ],
            include: {
                customer: {
                    select: { company: true }
                },
                assignments: {
                    include: {
                        team: { select: { name: true } },
                        worker: { select: { name: true } }
                    }
                },
                steps: {
                    select: {
                        id: true,
                        isCompleted: true,
                        subSteps: {
                            select: {
                                id: true,
                                isCompleted: true
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json(jobs)
    } catch (error) {
        console.error('Gantt fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
