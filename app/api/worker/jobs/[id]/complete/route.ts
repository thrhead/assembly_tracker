import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { emitToUser, broadcast } from '@/lib/socket'
import { JobCompletedPayload } from '@/lib/socket-events'
import { sendJobCompletedEmail } from '@/lib/email'

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAuth(req)
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
        steps: true,
        creator: true,
        customer: true,
        assignments: {
          include: {
            team: true
          },
          take: 1
        }
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
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedDate: new Date()
      }
    })

    // Get team lead or admin as approver
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

    // Emit Socket.IO event for real-time notification
    const socketPayload: JobCompletedPayload = {
      jobId: updatedJob.id,
      title: updatedJob.title,
      completedBy: session.user.name || session.user.email || 'Unknown',
      completedAt: updatedJob.completedDate || new Date()
    }

    // Notify job creator
    if (job.creator?.id) {
      emitToUser(job.creator.id, 'job:completed', socketPayload)
    }

    // Notify approver
    emitToUser(approver.id, 'job:completed', socketPayload)

    // Broadcast to all admins
    broadcast('job:completed', socketPayload)

    // Send email notification (async, don't block)
    if (approver.email) {
      sendJobCompletedEmail(approver.email, {
        id: updatedJob.id,
        title: updatedJob.title,
        customerName: job.customer.company,
        completedDate: updatedJob.completedDate || new Date(),
        teamName: job.assignments[0]?.team?.name || 'Unknown Team',
        completedBy: session.user.name || session.user.email || 'Unknown'
      }).catch(err => console.error('Email send failed:', err))
    }

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
