import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'TEAM_LEAD')) {
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

        const jobs = await prisma.job.findMany({
            where: {
                OR: [
                    // Jobs starting within range
                    {
                        scheduledDate: {
                            gte: startDate,
                            lte: endDate
                        }
                    },
                    // Jobs ending within range
                    {
                        scheduledEndDate: {
                            gte: startDate,
                            lte: endDate
                        }
                    },
                    // Jobs spanning the range (start before, end after)
                    {
                        scheduledDate: {
                            lte: startDate
                        },
                        scheduledEndDate: {
                            gte: endDate
                        }
                    }
                ]
            },
            include: {
                customer: {
                    select: {
                        company: true
                    }
                },
                assignments: {
                    include: {
                        team: true,
                        worker: true
                    }
                }
            }
        })

        // Format for FullCalendar and Mobile
        const events = jobs.map(job => {
            // Determine color based on status
            let color = '#3788d8' // default blue
            switch (job.status) {
                case 'COMPLETED': color = '#10B981'; break; // green
                case 'IN_PROGRESS': color = '#F59E0B'; break; // yellow/orange
                case 'PENDING': color = '#6B7280'; break; // gray
                case 'CANCELLED': color = '#EF4444'; break; // red
                case 'ON_HOLD': color = '#8B5CF6'; break; // purple
            }

            return {
                id: job.id,
                title: `${job.customer.company} - ${job.title}`,
                start: job.scheduledDate,
                end: job.scheduledEndDate,
                color: color,
                extendedProps: {
                    status: job.status,
                    location: job.location,
                    description: job.description,
                    assignments: job.assignments.map(a =>
                        a.team ? `Team: ${a.team.name}` : a.worker ? `Worker: ${a.worker.name}` : 'Unassigned'
                    ).join(', ')
                }
            }
        })

        return NextResponse.json(events)
    } catch (error) {
        console.error('Calendar events fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
