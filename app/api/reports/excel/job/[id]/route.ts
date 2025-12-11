import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrManager } from '@/lib/auth-helper'
import { prisma } from '@/lib/db'

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const session = await verifyAdminOrManager(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const jobId = params.id

        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: {
                customer: {
                    include: {
                        user: true,
                    },
                },
                steps: {
                    include: {
                        subSteps: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
                costs: {
                    orderBy: {
                        date: 'desc',
                    },
                },
                assignments: {
                    include: {
                        team: {
                            include: {
                                members: {
                                    include: {
                                        user: true,
                                    },
                                },
                            },
                        },
                    },
                    take: 1,
                },
            },
        })

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        const excelData = {
            id: job.id,
            title: job.title,
            status: job.status,
            priority: job.priority,
            location: job.location || job.customer.address,
            scheduledDate: job.scheduledDate,
            completedDate: job.completedDate,
            customer: {
                company: job.customer.company,
                address: job.customer.address || '',
                user: {
                    name: job.customer.user.name,
                    phone: job.customer.user.phone || '',
                    email: job.customer.user.email,
                },
            },
            steps: job.steps.map((step) => ({
                title: step.title,
                isCompleted: step.isCompleted,
                order: step.order,
                subSteps: step.subSteps.map((sub) => ({
                    title: sub.title,
                    isCompleted: sub.isCompleted,
                })),
            })),
            costs: job.costs.map((cost) => ({
                amount: cost.amount,
                category: cost.category,
                description: cost.description || '',
                status: cost.status,
                date: cost.date,
            })),
            team: job.assignments[0]?.team
                ? {
                    name: job.assignments[0].team.name,
                    members: job.assignments[0].team.members.map((m) => ({
                        user: {
                            name: m.user.name,
                            role: m.user.role,
                        },
                    })),
                }
                : undefined,
        }

        return NextResponse.json(excelData)
    } catch (error) {
        console.error('Excel job data error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
