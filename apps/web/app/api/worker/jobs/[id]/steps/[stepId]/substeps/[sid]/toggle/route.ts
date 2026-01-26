import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { sendAdminNotification } from '@/lib/notification-helper'
import { broadcast } from '@/lib/socket'

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string; stepId: string; sid: string }> }
) {
    const params = await props.params
    try {
        const session = await verifyAuth(req)
        if (!session || !['WORKER', 'TEAM_LEAD', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const subStep = await prisma.jobSubStep.findUnique({
            where: { id: params.sid },
            include: {
                step: {
                    include: { job: { select: { title: true } } }
                }
            }
        })

        if (!subStep) {
            return NextResponse.json({ error: 'Substep not found' }, { status: 404 })
        }

        // MANDATORY PHOTO CHECK
        // If we are marking as completed (!subStep.isCompleted means we are setting it to true)
        if (!subStep.isCompleted) {
            const photoCount = await prisma.stepPhoto.count({
                where: { subStepId: params.sid }
            });

            if (photoCount === 0) {
                return NextResponse.json(
                    { error: 'bu iş emrini kapatabilmeniz için öncelikle en az 1 adet fotoğraf yüklemeniz gerekmektedir' },
                    { status: 400 }
                )
            }
        }

        const updatedSubStep = await prisma.jobSubStep.update({
            where: { id: params.sid },
            data: {
                isCompleted: !subStep.isCompleted,
                completedAt: !subStep.isCompleted ? new Date() : null,
                startedAt: !subStep.isCompleted && !subStep.startedAt ? new Date() : subStep.startedAt,
                // If completing and was rejected, reset to pending for re-approval
                approvalStatus: (!subStep.isCompleted && subStep.approvalStatus === 'REJECTED') ? 'PENDING' : subStep.approvalStatus,
                rejectionReason: (!subStep.isCompleted && subStep.approvalStatus === 'REJECTED') ? null : subStep.rejectionReason
            }
        })

        console.log('Toggle Substep:', {
            id: params.sid,
            oldStatus: subStep.approvalStatus,
            oldCompleted: subStep.isCompleted,
            newStatus: updatedSubStep.approvalStatus,
            newCompleted: updatedSubStep.isCompleted
        })

        // Notify admins when substep is completed (toggled ON)
        if (updatedSubStep.isCompleted && !subStep.isCompleted) {
            // Socket.IO broadcast for real-time web notifications
            broadcast('substep:completed', {
                substepId: params.sid,
                jobId: params.id,
                jobTitle: subStep.step.job.title,
                substepTitle: subStep.title,
                completedBy: session.user.name || session.user.email
            })

            // Send push notification to admins (DB + Push)
            await sendAdminNotification(
                'Alt Adım Tamamlandı',
                `"${subStep.step.job.title}" - "${subStep.title}" tamamlandı (${session.user.name || session.user.email})`,
                'SUCCESS',
                `/admin/jobs/${params.id}`,
                session.user.id
            )
        }

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
