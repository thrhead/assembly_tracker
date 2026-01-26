import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { emitToUser, broadcast } from '@/lib/socket'
import { JobCompletedPayload } from '@/lib/socket-events'
import { sendJobCompletedEmail } from '@/lib/email'
import { notifyAdminsOfJobCompletion } from '@/lib/notifications'
import cloudinary from '@/lib/cloudinary'
import { EventBus } from '@/lib/event-bus'

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAuth(req)
    if (!session || !['WORKER', 'TEAM_LEAD'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { signature, signatureLatitude, signatureLongitude } = await req.json()
    const params = await props.params
    const { id: jobId } = params

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
        steps: {
          include: {
            subSteps: true
          }
        },
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

    const allStepsAndSubStepsCompleted = job.steps.every(step => {
      const stepDone = step.isCompleted;
      const subStepsDone = step.subSteps.length === 0 || step.subSteps.every(ss => ss.isCompleted);
      return stepDone && subStepsDone;
    })

    if (!allStepsAndSubStepsCompleted) {
      return NextResponse.json({
        error: 'bu montajı tamamlayarak kapatmak için tüm alt iş emirlerini tamamlamanız gerekiyor'
      }, { status: 400 })
    }

    let signatureUrl = null
    if (signature) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(signature, {
          folder: 'signatures',
          resource_type: 'image'
        })
        signatureUrl = uploadResponse.secure_url
      } catch (uploadError) {
        console.error('Signature upload error:', uploadError)
      }
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'PENDING_APPROVAL',
        completedDate: new Date(),
        signatureUrl,
        signatureLatitude: signatureLatitude ? parseFloat(signatureLatitude) : null,
        signatureLongitude: signatureLongitude ? parseFloat(signatureLongitude) : null
      }
    })

    const approvers = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'MANAGER'] },
        isActive: true
      }
    })

    if (approvers.length === 0) {
      return NextResponse.json({
        error: 'No approver found'
      }, { status: 500 })
    }

    // Create approvals for all admins/managers
    const approval = await prisma.approval.create({
      data: {
        jobId,
        requesterId: session.user.id,
        approverId: approvers[0].id, // Direct first one for now, or loop for all
        status: 'PENDING',
        type: 'JOB_COMPLETION'
      }
    })

    const socketPayload: JobCompletedPayload = {
      jobId: updatedJob.id,
      title: updatedJob.title,
      completedBy: session.user.name || session.user.email || 'Unknown',
      completedAt: updatedJob.completedDate || new Date()
    }

    try {
      if (job.creator?.id) {
        emitToUser(job.creator.id, 'job:status_changed', { ...socketPayload, status: 'PENDING_APPROVAL' } as any)
      }
      await notifyAdminsOfJobCompletion(jobId)
      broadcast('job:status_changed', { ...socketPayload, status: 'PENDING_APPROVAL' } as any)
    } catch (socketError) {
      console.error('Socket error (non-fatal):', socketError);
    }

    // Send email to all approvers
    approvers.forEach(approver => {
      if (approver.email) {
        sendJobCompletedEmail(approver.email, {
          id: updatedJob.id,
          title: updatedJob.title,
          customerName: job.customer?.company || 'Unknown',
          completedDate: updatedJob.completedDate || new Date(),
          teamName: job.assignments[0]?.team?.name || 'Unknown Team',
          completedBy: session.user.name || session.user.email || 'Unknown'
        }).catch(err => console.error('Email send failed:', err))
      }
    });

    await EventBus.emit('job.completed', {
      jobId: jobId,
      title: updatedJob.title,
      completedBy: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email
      },
      signatureUrl: updatedJob.signatureUrl,
      location: {
        latitude: updatedJob.signatureLatitude,
        longitude: updatedJob.signatureLongitude
      },
      timestamp: updatedJob.completedDate
    });

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
