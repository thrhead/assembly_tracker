import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { checkConflict } from '@/lib/conflict-check'

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string; stepId: string }> }
) {
  const params = await props.params
  try {
    const session = await verifyAuth(req)
    if (!session || !['WORKER', 'TEAM_LEAD', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const step = await prisma.jobStep.findUnique({
      where: { id: params.stepId },
      include: { job: { select: { updatedAt: true } } }
    })

    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    // Seviye 3: Ebeveyn iş üzerinden çakışma kontrolü
    const conflict = await checkConflict(req, step.job.updatedAt)
    if (conflict) return conflict

    // 1. Check if previous steps are completed
    if (!step.isCompleted && step.order > 1) {
      const previousStep = await prisma.jobStep.findFirst({
        where: {
          jobId: step.jobId,
          order: step.order - 1
        }
      })

      if (previousStep && !previousStep.isCompleted) {
        return NextResponse.json(
          { error: 'Önceki adımı tamamlamadan bu adıma geçemezsiniz.' },
          { status: 400 }
        )
      }
    }

    /*
    // MANDATORY PHOTO CHECK REMOVED FOR MAIN STEP
    // User requested photo uploads only on sub-steps.
    // Main step completion logic now relies on sub-steps being completed (which enforce photos).
    // If a step has NO sub-steps, it currently has no photo requirement.
    
    // If we are marking as completed (!step.isCompleted means we are setting it to true)
    if (!step.isCompleted) {
        const photoCount = await prisma.stepPhoto.count({
            where: { stepId: params.stepId }
        });

        if (photoCount === 0) {
            return NextResponse.json(
                { error: 'Bu adımı tamamlamak için en az bir fotoğraf yüklemelisiniz.' },
                { status: 400 }
            )
        }
    }
    */

    // 2. Check if all substeps are completed
    const subSteps = await prisma.jobSubStep.findMany({
      where: { stepId: params.stepId }
    })

    if (!step.isCompleted && subSteps.length > 0) {
      const incompleteSubSteps = subSteps.filter(s => !s.isCompleted)
      if (incompleteSubSteps.length > 0) {
        return NextResponse.json(
          { error: 'Tüm alt görevleri tamamlamadan bu adımı tamamlayamazsınız.' },
          { status: 400 }
        )
      }
    }

    const updatedStep = await prisma.jobStep.update({
      where: { id: params.stepId },
      data: {
        isCompleted: !step.isCompleted,
        completedAt: !step.isCompleted ? new Date() : null,
        completedById: !step.isCompleted ? session.user.id : null,
        startedAt: !step.isCompleted && !step.startedAt ? new Date() : step.startedAt,
        approvalStatus: !step.isCompleted ? 'PENDING' : 'PENDING', // Reset to PENDING on change
        rejectionReason: !step.isCompleted ? null : step.rejectionReason, // Clear rejection reason if completing again
        approvedById: null,
        approvedAt: null
      }
    })

    return NextResponse.json(updatedStep)
  } catch (error) {
    console.error('Step toggle error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
