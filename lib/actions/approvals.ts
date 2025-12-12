'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'

const approvalActionSchema = z.object({
    approvalId: z.string(),
    status: z.enum(['APPROVED', 'REJECTED']),
    notes: z.string().optional()
})

export async function processApprovalAction(data: z.infer<typeof approvalActionSchema>) {
    const session = await auth()

    if (!session || !['ADMIN', 'MANAGER', 'TEAM_LEAD'].includes(session.user.role)) {
        throw new Error('Yetkisiz işlem')
    }

    const validated = approvalActionSchema.safeParse(data)

    if (!validated.success) {
        throw new Error('Geçersiz veri')
    }

    const { approvalId, status, notes } = validated.data

    try {
        const approval = await prisma.approval.findUnique({
            where: { id: approvalId },
            include: { job: true }
        })

        if (!approval) {
            throw new Error('Onay kaydı bulunamadı')
        }

        await prisma.$transaction(async (tx) => {
            // Update approval status
            await tx.approval.update({
                where: { id: approvalId },
                data: {
                    status,
                    notes,
                    approverId: session.user.id
                }
            })

            // Update related entity based on approval type
            // Assuming simplified logic: if approval is for a job completion or similar
            // In a real scenario, approval.type would dictate the action
            // For now, let's assume if approved, we might update job status or similar if needed.
            // Based on previous code, it seems approvals are generic.
            // If the approval is linked to a JobStep or Cost, we should update those too.
            // But the current schema doesn't strictly enforce a link to Step/Cost in Approval model (it has jobId).
            // Let's stick to updating the Approval record as the primary action.

            // If status is REJECTED, maybe update Job status to pending or similar if it was waiting?
            // Leaving specific business logic minimal to match existing behavior which just updated the approval.
        })

        revalidatePath('/admin/approvals')
        revalidatePath(`/admin/jobs/${approval.jobId}`)

        return { success: true }
    } catch (error: any) {
        console.error('Approval processing error:', error)
        throw new Error(error.message || 'İşlem sırasında bir hata oluştu')
    }
}
