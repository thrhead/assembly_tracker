import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from 'zod'

const createTeamSchema = z.object({
    name: z.string().min(1),
    description: z.string().nullable().optional(),
    leadId: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
    memberIds: z.array(z.string()).optional()
})

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { memberIds, ...teamData } = createTeamSchema.parse(body)

        // Create team
        const team = await prisma.team.create({
            data: {
                ...teamData,
                isActive: teamData.isActive ?? true
            }
        })

        // Add members if provided
        if (memberIds && memberIds.length > 0) {
            // Check for users already in other teams
            const existingMembers = await prisma.teamMember.findMany({
                where: {
                    userId: { in: memberIds }
                },
                include: {
                    user: { select: { name: true } },
                    team: { select: { name: true } }
                }
            })

            if (existingMembers.length > 0) {
                const conflicts = existingMembers.map(m => `${m.user.name} (${m.team.name} ekibinde)`).join(', ')
                return NextResponse.json({
                    error: `Bu kullanıcılar zaten başka bir ekipte: ${conflicts}`
                }, { status: 400 })
            }

            await prisma.teamMember.createMany({
                data: memberIds.map(userId => ({
                    teamId: team.id,
                    userId
                }))
            })
        }

        return NextResponse.json(team, { status: 201 })
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
        }
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Bir kullanıcı birden fazla ekipte olamaz' }, { status: 400 })
        }
        console.error('Create team error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
