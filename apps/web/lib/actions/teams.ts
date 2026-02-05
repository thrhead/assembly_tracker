'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { logger } from '@/lib/logger'

const teamSchema = z.object({
  name: z.string().min(2, 'Ekip adı en az 2 karakter olmalıdır'),
  description: z.string().optional(),
  leadId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  memberIds: z.array(z.string()).optional()
})

export async function createTeamAction(data: z.infer<typeof teamSchema>) {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Yetkisiz işlem')
    }

    const validated = teamSchema.safeParse(data)

    if (!validated.success) {
        throw new Error('Geçersiz veri: ' + JSON.stringify(validated.error.flatten()))
    }

    const { name, description, leadId, isActive, memberIds } = validated.data

    try {
        const team = await prisma.$transaction(async (tx) => {
            const newTeam = await tx.team.create({
                data: {
                    name,
                    description,
                    leadId: leadId === 'none' ? null : leadId,
                    isActive
                }
            })

            if (memberIds && memberIds.length > 0) {
                await tx.teamMember.createMany({
                    data: memberIds.map(userId => ({
                        teamId: newTeam.id,
                        userId
                    }))
                })
            }
            return newTeam;
        })

        logger.audit(`Team created: ${team.name}`, {
            teamId: team.id,
            adminId: session.user.id
        });

        revalidatePath('/admin/teams')
        return { success: true }
    } catch (error: any) {
        console.error('Team creation error:', error)
        logger.error('Failed to create team', { error: error.message });
        throw new Error(error.message || 'Ekip oluşturulurken bir hata oluştu')
    }
}

export async function updateTeamAction(id: string, data: z.infer<typeof teamSchema>) {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Yetkisiz işlem')
    }

    const validated = teamSchema.safeParse(data)

    if (!validated.success) {
        throw new Error('Geçersiz veri: ' + JSON.stringify(validated.error.flatten()))
    }

    const { name, description, leadId, isActive, memberIds } = validated.data

    try {
        await prisma.$transaction(async (tx) => {
            // Update team details
            await tx.team.update({
                where: { id },
                data: {
                    name,
                    description,
                    leadId: leadId === 'none' ? null : leadId,
                    isActive
                }
            })

            // Update members if provided
            if (memberIds) {
                // Remove all existing members
                await tx.teamMember.deleteMany({
                    where: { teamId: id }
                })

                // Add new members
                if (memberIds.length > 0) {
                    await tx.teamMember.createMany({
                        data: memberIds.map(userId => ({
                            teamId: id,
                            userId
                        }))
                    })
                }
            }
        })

        logger.audit(`Team updated: ${name}`, {
            teamId: id,
            updaterId: session.user.id
        });

        revalidatePath('/admin/teams')
        revalidatePath(`/admin/teams/${id}`)
        return { success: true }
    } catch (error: any) {
        console.error('Team update error:', error)
        logger.error('Failed to update team', { error: error.message, teamId: id });
        throw new Error(error.message || 'Ekip güncellenirken bir hata oluştu')
    }
}
