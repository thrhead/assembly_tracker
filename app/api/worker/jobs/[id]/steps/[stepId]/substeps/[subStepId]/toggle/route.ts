import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string; stepId: string; subStepId: string }> }
) {
    const params = await props.params
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user.role !== 'WORKER' && session.user.role !== 'TEAM_LEAD')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const subStep = await prisma.jobSubStep.findUnique({
            where: { id: params.subStepId }
        })

        if (!subStep) {
            return NextResponse.json({ error: 'Substep not found' }, { status: 404 })
        }

        // Get custom times from request body (if provided)
        const body = await req.json().catch(() => ({}))
        const customStartTime = body.startTime ? new Date(body.startTime) : null
        const customEndTime = body.endTime ? new Date(body.endTime) : null

        // Toggle substep
        const updatedSubStep = await prisma.jobSubStep.update({
            where: { id: params.subStepId },
            data: {
                isCompleted: !subStep.isCompleted,
                completedAt: !subStep.isCompleted
                    ? (customEndTime || new Date())
                    : null,
                startedAt: !subStep.isCompleted && !subStep.startedAt
                    ? (customStartTime || new Date())
                    : subStep.startedAt
            }
        })

        // Check if we should auto-complete or un-complete the parent step
        if (updatedSubStep.isCompleted) {
            // SubStep was just completed - check if all substeps are now complete
            const allSubSteps = await prisma.jobSubStep.findMany({
                where: { stepId: params.stepId },
                orderBy: { completedAt: 'desc' }
            })

            const allCompleted = allSubSteps.every(sub => sub.isCompleted)

            if (allCompleted && allSubSteps.length > 0) {
                // Get the latest completion time from all substeps
                const latestCompletedTime = allSubSteps[0].completedAt || new Date()

                // Auto-complete the parent step
                await prisma.jobStep.update({
                    where: { id: params.stepId },
                    data: {
                        isCompleted: true,
                        completedAt: latestCompletedTime,
                        completedById: session.user.id
                    }
                })
            }
        } else {
            // SubStep was un-completed - un-complete the parent step as well
            await prisma.jobStep.update({
                where: { id: params.stepId },
                data: {
                    isCompleted: false,
                    completedAt: null,
                    completedById: null
                }
            })
        }

        return NextResponse.json(updatedSubStep)
    } catch (error) {
        console.error('Substep toggle error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
