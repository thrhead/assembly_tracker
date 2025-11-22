import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string; stepId: string; subStepId: string }> }
) {
    const params = await props.params
    try {
        const session = await auth()
        if (!session || (session.user.role !== 'WORKER' && session.user.role !== 'TEAM_LEAD')) {
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

        return NextResponse.json(updatedSubStep)
    } catch (error) {
        console.error('Substep toggle error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
