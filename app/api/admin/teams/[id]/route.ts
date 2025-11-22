import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const updateTeamSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    leadId: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
    memberIds: z.array(z.string()).optional()
})

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const session = await auth()
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
