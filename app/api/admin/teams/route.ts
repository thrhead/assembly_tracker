import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/auth-helper'
import { z } from 'zod'
import { createTeamSchema } from '@/lib/validations'

export async function POST(req: Request) {
    try {
        const session = await verifyAdmin(req)
        if (!session) {
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
            const errorMessage = error.issues.map((issue: any) => issue.message).join(', ')
            return NextResponse.json({ error: errorMessage, details: error.issues }, { status: 400 })
        }
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Bir kullanıcı birden fazla ekipte olamaz' }, { status: 400 })
        }
        console.error('Create team error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
