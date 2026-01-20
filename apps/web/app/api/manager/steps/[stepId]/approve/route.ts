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
                approvalStatus: 'APPROVED',
                approvedById: session.user.id,
                approvedAt: new Date(),
                rejectionReason: null
            }
        })

        // Notify the worker who completed the step
        if (step.completedById) {
            await prisma.notification.create({
                data: {
                    userId: step.completedById,
                    title: 'İş Adımı Onaylandı ✅',
                    message: `"${step.job.title}" işindeki "${step.title}" adımı onaylandı.`,
                    type: 'SUCCESS',
                    link: `/jobs/${step.jobId}`
                }
            })
        }

        return NextResponse.json(updatedStep)
    } catch (error) {
        console.error('Step approval error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
