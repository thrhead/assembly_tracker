import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const blockSchema = z.object({
    reason: z.enum(['POWER_OUTAGE', 'MATERIAL_SHORTAGE', 'BAD_WEATHER', 'EQUIPMENT_FAILURE', 'WAITING_APPROVAL', 'CUSTOMER_REQUEST', 'SAFETY_ISSUE', 'OTHER']),
    note: z.string().optional()
})

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

        const body = await req.json()
        const { reason, note } = blockSchema.parse(body)

        const step = await prisma.jobStep.findUnique({
            where: { id: params.stepId }
        })

        if (!step) {
            return NextResponse.json({ error: 'Step not found' }, { status: 404 })
        }

        const updatedStep = await prisma.jobStep.update({
            where: { id: params.stepId },
            data: {
                blockedAt: new Date(),
                blockedReason: reason,
                blockedNote: note || null
            }
        })

        return NextResponse.json(updatedStep)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }
        console.error('Step block error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// Unblock endpoint
export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string; stepId: string }> }
) {
    const params = await props.params
    try {
        const session = await auth()
        if (!session || (session.user.role !== 'WORKER' && session.user.role !== 'TEAM_LEAD')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const updatedStep = await prisma.jobStep.update({
            where: { id: params.stepId },
            data: {
                blockedAt: null,
                blockedReason: null,
                blockedNote: null
            }
        })

        return NextResponse.json(updatedStep)
    } catch (error) {
        console.error('Step unblock error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
