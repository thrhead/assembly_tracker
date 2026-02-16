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

            // If it's a job completion approval, update the job status
            if (approval.type === 'JOB_COMPLETION') {
                if (status === 'APPROVED') {
                    await tx.job.update({
                        where: { id: approval.jobId },
                        data: { 
                            status: 'COMPLETED',
                            completedDate: new Date() // Final confirmation date
                        }
                    })
                } else if (status === 'REJECTED') {
                    await tx.job.update({
                        where: { id: approval.jobId },
                        data: { status: 'IN_PROGRESS' } // Send back to worker
                    })
                }
            }
        })

        revalidatePath('/admin/approvals')
        revalidatePath(`/admin/jobs/${approval.jobId}`)

        return { success: true }
    } catch (error: any) {
        console.error('Approval processing error:', error)
        throw new Error(error.message || 'İşlem sırasında bir hata oluştu')
    }
}
