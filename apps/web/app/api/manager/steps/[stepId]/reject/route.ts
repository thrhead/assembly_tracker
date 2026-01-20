import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'

export async function POST(
    req: Request,
    props: { params: Promise<{ stepId: string }> }
) {
    const params = await props.params
    try {
        const session = await verifyAuth(req)
        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { reason } = body

        if (!reason) {
            return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
        }

        const step = await prisma.jobStep.findUnique({
            where: { id: params.stepId },
            include: { job: true }
        })

        if (!step) {
            return NextResponse.json({ error: 'Step not found' }, { status: 404 })
        }

        const updatedStep = await prisma.jobStep.update({
            where: { id: params.stepId },
            data: {
                approvalStatus: 'REJECTED',
                rejectionReason: reason,
                isCompleted: false, // Mark as incomplete so worker can redo it
                completedAt: null,
                completedById: null,
                approvedById: session.user.id, // Record who rejected it
                approvedAt: new Date(),
                subSteps: {
                    updateMany: {
                        where: {},
                        data: {
                            isCompleted: false,
                            completedAt: null
                        }
                    }
                }
            }
        })

        // Explicitly update job status to IN_PROGRESS if it was COMPLETED
        // This ensures the job reappears in the active list
        await prisma.job.update({
            where: { id: step.jobId },
            data: { status: 'IN_PROGRESS' }
        })

        // Notify the worker who completed the step (or assigned worker if completedBy is null)
        const workerId = step.completedById // || step.job.assignments[0]?.workerId (would need to fetch assignments)

        if (workerId) {
            await prisma.notification.create({
                data: {
                    userId: workerId,
                    title: 'İş Adımı Reddedildi ❌',
                    message: `"${step.job.title}" işindeki "${step.title}" adımı reddedildi. Sebep: ${reason}`,
                    type: 'ERROR',
                    link: `/jobs/${step.jobId}`
                }
            })
        }

        return NextResponse.json(updatedStep)
    } catch (error) {
        console.error('Step rejection error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
