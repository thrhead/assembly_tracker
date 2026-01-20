import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin or manager
        if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const jobId = params.id

        // Fetch complete job data for PDF generation
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: {
                customer: {
                    include: {
                        user: true
                    }
                },
                steps: {
                    include: {
                        subSteps: true
                    },
                    orderBy: {
                        order: 'asc'
                    }
                },
                costs: {
                    include: {
                        createdBy: true
                    },
                    orderBy: {
                        date: 'desc'
                    }
                },
                assignments: {
                    include: {
                        team: {
                            include: {
                                members: {
                                    include: {
                                        user: true
                                    }
                                }
                            }
                        }
                    },
                    take: 1
                }
            }
        })

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        // Transform data for PDF generation
        const reportData = {
            id: job.id,
            title: job.title,
            status: job.status,
            priority: job.priority,
            location: job.location || job.customer.address,
            scheduledDate: job.scheduledDate,
            completedDate: job.completedDate,
            customer: {
                company: job.customer.company,
                address: job.customer.address,
                user: {
                    name: job.customer.user.name,
                    phone: job.customer.user.phone || '',
                    email: job.customer.user.email
                }
            },
            steps: job.steps.map(step => ({
                title: step.title,
                isCompleted: step.isCompleted,
                order: step.order,
                subSteps: step.subSteps.map(sub => ({
                    title: sub.title,
                    isCompleted: sub.isCompleted
                }))
            })),
            costs: job.costs.map(cost => ({
                amount: cost.amount,
                category: cost.category,
                description: cost.description,
                status: cost.status,
                date: cost.date
            })),
            team: job.assignments[0]?.team ? {
                name: job.assignments[0].team.name,
                members: job.assignments[0].team.members.map(m => ({
                    user: {
                        name: m.user.name,
                        role: m.user.role
                    }
                }))
            } : undefined
        }

        return NextResponse.json(reportData)
    } catch (error) {
        console.error('Error fetching job report data:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
