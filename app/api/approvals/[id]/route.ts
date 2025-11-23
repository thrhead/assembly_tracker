import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from 'zod'
import { notifyApprovalApproved, notifyApprovalRejected } from '@/lib/notifications'

const updateApprovalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().optional()
})

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'MANAGER', 'TEAM_LEAD'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await props.params
    const { id } = params
    const body = await req.json()
    const { status, notes } = updateApprovalSchema.parse(body)

    // Get approval
    const approval = await prisma.approval.findUnique({
      where: { id },
      include: {
        job: true,
        requester: true
      }
    })

    if (!approval) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
    }

    if (approval.status !== 'PENDING') {
      return NextResponse.json({ error: 'Approval already processed' }, { status: 400 })
    }

    // Update approval
    const updatedApproval = await prisma.approval.update({
      where: { id },
      data: {
        status,
        notes: notes || null,
        approverId: session.user.id,
        updatedAt: new Date()
      }
    })

    // Update job status based on approval decision
    if (status === 'APPROVED') {
      await prisma.job.update({
        where: { id: approval.jobId },
        data: {
          status: 'COMPLETED',
          completedDate: new Date()
        }
      })

      // Notify requester
      await notifyApprovalApproved(approval.jobId, approval.requesterId)
    } else if (status === 'REJECTED') {
      await prisma.job.update({
        where: { id: approval.jobId },
        data: { status: 'IN_PROGRESS' }
      })

      // Notify requester
      await notifyApprovalRejected(approval.jobId, approval.requesterId, notes)
    }

    return NextResponse.json({ success: true, approval: updatedApproval })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 })
    }
    console.error('Update approval error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
