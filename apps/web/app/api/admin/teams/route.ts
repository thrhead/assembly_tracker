import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'

export async function GET(req: Request) {
    try {
        const session = await verifyAuth(req)
        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const teams = await prisma.team.findMany({
            include: {
                _count: {
                    select: { members: true }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                role: true,
                                isActive: true
                            }
                        }
                    }
                },
                assignments: {
                    where: {
                        job: {
                            status: { in: ['ASSIGNED', 'IN_PROGRESS'] }
                        }
                    },
                    include: {
                        job: {
                            select: {
                                id: true,
                                title: true,
                                status: true
                            }
                        }
                    },
                    take: 1
                }
            },
            orderBy: {
                name: 'asc'
            }
        })

        const formattedTeams = teams.map(team => ({
            id: team.id,
            name: team.name,
            memberCount: team._count.members,
            members: team.members.map(m => ({
                id: m.user.id,
                name: m.user.name,
                role: m.user.role,
                isActive: m.user.isActive,
                isLead: m.user.id === team.leadId
            })),
            currentJob: team.assignments[0]?.job || null,
            status: team.assignments.length > 0 ? 'BUSY' : 'IDLE'
        }))

        return NextResponse.json(formattedTeams)
    } catch (error) {
        console.error('Fetch teams error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
