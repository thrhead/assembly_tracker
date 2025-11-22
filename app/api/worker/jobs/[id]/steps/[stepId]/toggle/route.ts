import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string; stepId: string }> }
) {
  const params = await props.params
  try {
    const session = await auth()
    if (!session || (session.user.role !== 'WORKER' && session.user.role !== 'TEAM_LEAD')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const step = await prisma.jobStep.findUnique({
      where: { id: params.stepId }
    })

    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

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
        startedAt: !step.isCompleted && !step.startedAt ? new Date() : step.startedAt
      }
    })

    return NextResponse.json(updatedStep)
  } catch (error) {
    console.error('Step toggle error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
