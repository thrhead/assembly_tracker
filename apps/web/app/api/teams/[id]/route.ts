
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { z } from 'zod'

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

const updateTeamSchema = z.object({
    name: z.string().min(2, 'Ekip adı en az 2 karakter olmalıdır').optional(),
    description: z.string().optional(),
    leadId: z.string().optional().nullable(),
    memberIds: z.array(z.string()).optional(),
    isActive: z.boolean().optional()
})

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await verifyAuth(req)
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
        }

        const params = await props.params
        const id = params.id
        const body = await req.json()
        console.log('[API] Update Team Request:', { id, body });

        const { name, description, leadId, memberIds, isActive } = updateTeamSchema.parse(body)

        // Validate leadId if provided
        let validatedLeadId = leadId
        if (leadId && leadId.trim()) {
            const leadExists = await prisma.user.findUnique({
                where: { id: leadId }
            })
            if (!leadExists) {
                console.warn('[API] Lead user not found:', leadId);
                return NextResponse.json({ error: 'Lead user not found' }, { status: 400, headers: corsHeaders })
            }
        } else if (leadId === '') {
            validatedLeadId = null;
        }

        // Prepare update data
        const updateData: any = {}
        if (name) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (validatedLeadId !== undefined) updateData.leadId = validatedLeadId
        if (isActive !== undefined) updateData.isActive = isActive

        console.log('[API] Update Team Data prepared:', updateData);

        // Transaction to update team and members
        const updatedTeam = await prisma.$transaction(async (tx) => {
            console.log('[API] Starting transaction for team:', id);

            // 1. Update basic info
            const team = await tx.team.update({
                where: { id },
                data: updateData
            })
            console.log('[API] Team basic info updated');

            // 2. Update members if provided
            if (memberIds) {
                // Deduplicate memberIds
                const uniqueMemberIds = [...new Set(memberIds)];
                console.log('[API] Updating members:', uniqueMemberIds);

                // Delete existing members
                await tx.teamMember.deleteMany({
                    where: { teamId: id }
                })
                console.log('[API] Existing members deleted');

                // Add new members
                if (uniqueMemberIds.length > 0) {
                    await tx.teamMember.createMany({
                        data: uniqueMemberIds.map(userId => ({
                            teamId: id,
                            userId
                        })),
                        skipDuplicates: true
                    })
                    console.log('[API] New members created');
                }
            }

            // 3. Fetch updated team with relations
            return await tx.team.findUnique({
                where: { id },
                include: {
                    lead: {
                        select: { id: true, name: true, email: true }
                    },
                    members: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true, role: true }
                            }
                        }
                    }
                }
            })
        }, {
            timeout: 20000 // Increase timeout to 20 seconds
        })

        console.log('[API] Team updated successfully');
        return NextResponse.json(updatedTeam, { headers: corsHeaders })

    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('[API] Validation Error:', (error as any).errors);
            return NextResponse.json({ error: (error as any).errors }, { status: 400, headers: corsHeaders })
        }
        console.error('[API] Team update error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders })
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await verifyAuth(req)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
        }

        const params = await props.params
        const id = params.id
        console.log('[API] Delete Team Request:', id);

        // Check if team exists
        const existingTeam = await prisma.team.findUnique({
            where: { id },
            include: { assignments: true } // Check for active assignments
        })

        if (!existingTeam) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404, headers: corsHeaders })
        }

        if (existingTeam.assignments.length > 0) {
            return NextResponse.json({ error: 'Bu ekip, aktif veya tamamlanmış işlere atanmış durumda. Silinemez.' }, { status: 400, headers: corsHeaders })
        }

        await prisma.team.delete({
            where: { id }
        })

        console.log('[API] Team deleted successfully');
        return NextResponse.json({ success: true }, { headers: corsHeaders })

    } catch (error) {
        console.error('[API] Team delete error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders })
    }
}
