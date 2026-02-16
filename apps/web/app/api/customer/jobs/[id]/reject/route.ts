import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await props.params
    const { id } = params
    const { notes, reason } = await req.json().catch(() => ({ notes: '', reason: '' }))

    if (!reason && !notes) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    // Get customer profile
    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
    }

    // Get job and verify ownership
    const job = await prisma.job.findFirst({
      where: {
        id,
        customerId: customer.id
      }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Only completed jobs can be rejected' }, { status: 400 })
    }

    // Start transaction
    const updatedJob = await prisma.$transaction(async (tx) => {
      // Revert job status to IN_PROGRESS or a special REJECTED status
      const updated = await tx.job.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS', // Back to progress so workers can fix issues
          acceptanceStatus: 'REJECTED',
          rejectionReason: reason || notes
        }
      })

      // Create approval record (with REJECTED status)
      await tx.approval.create({
        data: {
          jobId: id,
          requesterId: job.creatorId,
          approverId: session.user.id,
          status: 'REJECTED',
          type: 'CUSTOMER_FINAL_APPROVAL',
          notes: notes || reason || 'Müşteri tarafından reddedildi.'
        }
      })

      return updated
    })

    return NextResponse.json({ success: true, job: updatedJob })
  } catch (error) {
    console.error('Job rejection error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
