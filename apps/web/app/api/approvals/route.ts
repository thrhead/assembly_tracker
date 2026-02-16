import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { notifyJobCompletion } from '@/lib/notifications'

const createApprovalSchema = z.object({
  jobId: z.string(),
  approverId: z.string(),
  notes: z.string().optional()
})

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || !['ADMIN', 'MANAGER', 'TEAM_LEAD'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const role = searchParams.get('role') // 'approver' or 'requester'

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (role === 'approver') {
      where.approverId = session.user.id
    } else if (role === 'requester') {
      where.requesterId = session.user.id
    }

    const approvals = await prisma.approval.findMany({
      where,
      include: {
        job: {
          include: {
            customer: true
          }
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ approvals })
  } catch (error) {
    console.error('Get approvals error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !['WORKER', 'TEAM_LEAD'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { jobId, approverId, notes } = createApprovalSchema.parse(body)

    // Check if job exists and user has access
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        assignments: {
          some: {
            OR: [
              { workerId: session.user.id },
              { team: { members: { some: { userId: session.user.id } } } }
            ]
          }
        }
      }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found or access denied' }, { status: 404 })
    }

    // Create approval
    const approval = await prisma.approval.create({
      data: {
        jobId,
        requesterId: session.user.id,
        approverId,
        status: 'PENDING',
        type: 'JOB_COMPLETION',
        notes: notes || null
      }
    })

    // Send notification to approver
    await notifyJobCompletion(jobId, approverId)

    return NextResponse.json({ success: true, approval })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 })
    }
    console.error('Create approval error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
