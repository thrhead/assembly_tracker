import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await verifyAuth(req)
        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const params = await props.params
        const { id: teamId } = params

        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                                avatarUrl: true,
                                isActive: true
                            }
                        }
                    }
                },
                assignments: {
                    include: {
                        job: {
                            select: {
                                id: true,
                                title: true,
                                status: true,
                                completedDate: true,
                                customer: {
                                    select: { company: true }
                                }
                            }
                        }
                    },
                    orderBy: {
                        job: { completedDate: 'desc' }
                    },
                    take: 10
                }
            }
        })

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 })
        }

        // Basic performance calculation (completed jobs vs total)
        const completedJobs = team.assignments.filter(a => a.job.status === 'COMPLETED').length
        const performanceScore = team.assignments.length > 0
            ? Math.round((completedJobs / team.assignments.length) * 100)
            : 0

        return NextResponse.json({
            ...team,
            performanceScore,
            stats: {
                totalJobs: team.assignments.length,
                completedJobs
            }
        })
    } catch (error) {
        console.error('Fetch team details error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
