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
    const { notes } = await req.json().catch(() => ({ notes: '' }))

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
      return NextResponse.json({ error: 'Only completed jobs can be approved' }, { status: 400 })
    }

    // Start transaction to update job and create approval record
    const updatedJob = await prisma.$transaction(async (tx) => {
      // Update job status
      const updated = await tx.job.update({
        where: { id },
        data: {
          status: 'ACCEPTED', // Or whatever status signifies finalized by customer
          acceptanceStatus: 'APPROVED',
          acceptedAt: new Date(),
          acceptedById: session.user.id
        }
      })

      // Create approval record
      await tx.approval.create({
        data: {
          jobId: id,
          requesterId: job.creatorId, // Original job creator is requesting approval
          approverId: session.user.id,
          status: 'APPROVED',
          type: 'CUSTOMER_FINAL_APPROVAL',
          notes: notes || 'Müşteri tarafından dijital olarak onaylandı.'
        }
      })

      return updated
    })

    return NextResponse.json({ success: true, job: updatedJob })
  } catch (error) {
    console.error('Job approval error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
