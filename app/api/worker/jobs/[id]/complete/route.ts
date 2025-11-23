import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['WORKER', 'TEAM_LEAD'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await props.params
    const { id: jobId } = params

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
      },
      include: {
        steps: true
      }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found or access denied' }, { status: 404 })
    }

    // Check if all steps are completed
    const allStepsCompleted = job.steps.every(step => step.isCompleted)
    if (!allStepsCompleted) {
      return NextResponse.json({
        error: 'Tüm adımlar tamamlanmadan iş tamamlanamaz'
      }, { status: 400 })
    }

    // Update job status to COMPLETED
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedDate: new Date()
      }
    })

    // Get team lead or admin as approver
    // For now, we'll get the first admin user
    const approver = await prisma.user.findFirst({
      where: {
        role: { in: ['ADMIN', 'MANAGER'] },
        isActive: true
      }
    })

    if (!approver) {
      return NextResponse.json({
        error: 'No approver found'
      }, { status: 500 })
    }

    // Create approval request
    const approval = await prisma.approval.create({
      data: {
        jobId,
        requesterId: session.user.id,
        approverId: approver.id,
        status: 'PENDING',
        type: 'JOB_COMPLETION'
      }
    })

    // Send notification to approver
    const { notifyJobCompletion } = await import('@/lib/notifications')
    await notifyJobCompletion(jobId, approver.id)

    return NextResponse.json({
      success: true,
      message: 'İş tamamlandı ve onay için gönderildi',
      approval
    })
  } catch (error) {
    console.error('Complete job error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
