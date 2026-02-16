import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'

export async function GET(req: Request) {
    try {
        const session = await verifyAuth(req)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const start = searchParams.get('start')
        const end = searchParams.get('end')

        if (!start || !end) {
            return NextResponse.json(
                { error: 'Start and end dates are required' },
                { status: 400 }
            )
        }

        const startDate = new Date(start)
        const endDate = new Date(end)

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return NextResponse.json({
                error: 'Invalid date format'
            }, { status: 400 })
        }

        const where: any = {
            OR: [
                { scheduledDate: { gte: startDate, lte: endDate } },
                { scheduledEndDate: { gte: startDate, lte: endDate } },
                { scheduledDate: { lte: startDate }, scheduledEndDate: { gte: endDate } }
            ]
        }

        // Role-based filtering
        if (session.user.role === 'CUSTOMER') {
            // Customer can only see their own jobs
            const customer = await prisma.customer.findUnique({
                where: { userId: session.user.id }
            })
            if (customer) {
                where.customerId = customer.id
            } else {
                return NextResponse.json([]) // No customer profile found
            }
        } else if (session.user.role === 'WORKER' || session.user.role === 'TEAM_LEAD') {
            // Worker/Team Lead sees only assigned jobs
            where.assignments = {
                some: {
                    OR: [
                        { workerId: session.user.id },
                        {
                            team: {
                                OR: [
                                    { members: { some: { userId: session.user.id } } },
                                    { leadId: session.user.id }
                                ]
                            }
                        }
                    ]
                }
            }
        }
        // ADMIN and MANAGER see everything (no extra filter)

        const jobs = await prisma.job.findMany({
            where,
            include: {
                customer: { select: { company: true } },
                assignments: { include: { team: true, worker: true } }
            }
        })

        const events = jobs.map(job => {
            let color = '#3788d8'
            switch (job.status) {
                case 'COMPLETED': color = '#10B981'; break;
                case 'IN_PROGRESS': color = '#F59E0B'; break;
                case 'PENDING': color = '#6B7280'; break;
                case 'CANCELLED': color = '#EF4444'; break;
                case 'ON_HOLD': color = '#8B5CF6'; break;
            }

            const companyName = job.customer?.company || 'Müşteri Yok';
            const isAllDay = !job.scheduledEndDate;

            return {
                id: job.id,
                title: `${companyName} - ${job.title}`,
                start: job.scheduledDate,
                end: job.scheduledEndDate,
                allDay: isAllDay,
                color: color,
                extendedProps: {
                    status: job.status,
                    location: job.location,
                    description: job.description,
                    assignments: job.assignments?.map(a =>
                        a.team ? `Team: ${a.team.name}` : a.worker ? `Worker: ${a.worker.name}` : 'Unassigned'
                    ).join(', ') || ''
                }
            }
        })

        return NextResponse.json(events)

    } catch (error: any) {
        console.error('Calendar events fetch error:', error)
        return NextResponse.json({
            error: 'Internal Server Error'
        }, { status: 500 })
    }
}
