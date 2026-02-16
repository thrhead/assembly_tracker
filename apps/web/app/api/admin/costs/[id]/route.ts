import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { z } from 'zod'
import { sendUserNotification } from '@/lib/notification-helper'

const updateCostSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: z.string().nullable().optional()
})

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const session = await verifyAuth(req)
        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const data = updateCostSchema.parse(body)

        const cost = await prisma.costTracking.update({
            where: { id: params.id },
            data: {
                status: data.status,
                rejectionReason: data.status === 'REJECTED' ? data.rejectionReason : null,
                approvedById: session.user.id
            },
            include: {
                job: {
                    select: { title: true }
                }
            }
        })

        // Notify the user who created the cost
        if (cost.createdById) {
            const isApproved = data.status === 'APPROVED'
            await sendUserNotification(
                cost.createdById,
                isApproved ? 'Masraf Onaylandı ✅' : 'Masraf Reddedildi ❌',
                isApproved
                    ? `"${cost.job.title}" işi için girilen ${cost.amount} ${cost.currency} tutarındaki masraf onaylandı.`
                    : `"${cost.job.title}" işi için girilen ${cost.amount} ${cost.currency} tutarındaki masraf reddedildi. Sebep: ${data.rejectionReason}`,
                isApproved ? 'SUCCESS' : 'ERROR',
                `/worker/jobs/${cost.jobId}` // Redirect to job detail on mobile/web
            )
        }

        return NextResponse.json(cost)
    } catch (error) {
        console.error('Update cost error:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const session = await verifyAuth(req)
        if (!session || !['ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.costTracking.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete cost error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

