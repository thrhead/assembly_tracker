import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from 'zod'

const updateTeamSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    leadId: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
    memberIds: z.array(z.string()).optional()
})

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

        const team = await prisma.team.findUnique({
            where: { id: params.id },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: { joinedAt: 'desc' }
                }
            }
        })

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 })
        }

        return NextResponse.json(team)
    } catch (error) {
        console.error('Get team error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { memberIds, ...teamData } = updateTeamSchema.parse(body)

        // Update team basic info
        const team = await prisma.team.update({
            where: { id: params.id },
            data: teamData
        })

        // Update members if provided
        if (memberIds !== undefined) {
            // Get current members
            const currentMembers = await prisma.teamMember.findMany({
                where: { teamId: params.id },
                select: { userId: true }
            })
            const currentMemberIds = currentMembers.map(m => m.userId)

            // Find members to add and remove
            const toAdd = memberIds.filter(id => !currentMemberIds.includes(id))
            const toRemove = currentMemberIds.filter(id => !memberIds.includes(id))

            // Add new members
            if (toAdd.length > 0) {
                // Check if any of the users to add are already in another team
                const existingMemberships = await prisma.teamMember.findMany({
                    where: {
                        userId: { in: toAdd }
                    },
                    include: {
                        user: { select: { name: true } },
                        team: { select: { name: true } }
                    }
                })

                if (existingMemberships.length > 0) {
                    const conflicts = existingMemberships.map(m => `${m.user.name} (${m.team.name} ekibinde)`).join(', ')
                    return NextResponse.json({
                        error: `Bu kullanıcılar zaten başka bir ekipte: ${conflicts}`
                    }, { status: 400 })
                }

                await prisma.teamMember.createMany({
                    data: toAdd.map(userId => ({
                        teamId: params.id,
                        userId
                    }))
                })
            }

            // Remove members
            if (toRemove.length > 0) {
                await prisma.teamMember.deleteMany({
                    where: {
                        teamId: params.id,
                        userId: { in: toRemove }
                    }
                })
            }
        }

        return NextResponse.json(team)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }
        console.error('Update team error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.team.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete team error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
