import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrManager } from '@/lib/auth-helper'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const session = await verifyAdminOrManager(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)

        const where: any = {}

        const status = searchParams.get('status')
        if (status && status !== 'all') where.status = status

        const priority = searchParams.get('priority')
        if (priority && priority !== 'all') where.priority = priority

        const teamId = searchParams.get('teamId')
        if (teamId && teamId !== 'all') {
            where.assignments = { some: { teamId } }
        }

        const customerId = searchParams.get('customerId')
        if (customerId && customerId !== 'all') where.customerId = customerId

        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        if (startDate || endDate) {
            where.scheduledDate = {}
            if (startDate) where.scheduledDate.gte = new Date(startDate)
            if (endDate) where.scheduledDate.lte = new Date(endDate)
        }

        const jobs = await prisma.job.findMany({
            where,
            include: {
                customer: true,
                assignments: {
                    include: {
                        team: true,
                    },
                    take: 1,
                },
                steps: {
                    select: {
                        id: true,
                        isCompleted: true,
                    },
                },
                costs: {
                    where: {
                        status: 'APPROVED',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        const excelData = jobs.map((job) => {
            const totalSteps = job.steps.length
            const completedSteps = job.steps.filter((s) => s.isCompleted).length
            const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
            const totalCost = job.costs.reduce((sum, c) => sum + c.amount, 0)

            return {
                id: job.id,
                title: job.title,
                status: job.status,
                priority: job.priority,
                customerName: job.customer.company,
                teamName: job.assignments[0]?.team.name || 'Atanmamış',
                progress,
                totalCost,
                scheduledDate: job.scheduledDate,
            }
        })

        return NextResponse.json(excelData)
    } catch (error) {
        console.error('Excel jobs list error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
