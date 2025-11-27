import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string; stepId: string; subStepId: string }> }
) {
    const params = await props.params
    try {
        const session = await verifyAuth(req)
        if (!session || !['WORKER', 'TEAM_LEAD', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const subStep = await prisma.jobSubStep.findUnique({
            where: { id: params.subStepId }
        })

        if (!subStep) {
            return NextResponse.json({ error: 'Substep not found' }, { status: 404 })
        }

        const updatedSubStep = await prisma.jobSubStep.update({
            where: { id: params.subStepId },
            data: {
                isCompleted: !subStep.isCompleted,
                completedAt: !subStep.isCompleted ? new Date() : null,
                startedAt: !subStep.isCompleted && !subStep.startedAt ? new Date() : subStep.startedAt
            }
        })

        // Check if all substeps are completed
        const allSubSteps = await prisma.jobSubStep.findMany({
            where: { stepId: params.stepId }
        })

        const allCompleted = allSubSteps.every(s => s.isCompleted)

        // Update parent step status
        await prisma.jobStep.update({
            where: { id: params.stepId },
            data: {
                isCompleted: allCompleted,
                completedAt: allCompleted ? new Date() : null
            }
        })

        return NextResponse.json(updatedSubStep)
    } catch (error) {
        console.error('Substep toggle error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
