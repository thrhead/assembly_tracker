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
    props: { params: Promise<{ id: string; stepId: string; sid: string }> }
) {
    const params = await props.params
    try {
        const session = await auth()
        if (!session || (session.user.role !== 'WORKER' && session.user.role !== 'TEAM_LEAD')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { reason, note } = blockSchema.parse(body)

        const subStep = await prisma.jobSubStep.findUnique({
            where: { id: params.sid }
        })

        if (!subStep) {
            return NextResponse.json({ error: 'Substep not found' }, { status: 404 })
        }

        const updatedSubStep = await prisma.jobSubStep.update({
            where: { id: params.sid },
            data: {
                blockedAt: new Date(),
                blockedReason: reason,
                blockedNote: note || null
            }
        })

        return NextResponse.json(updatedSubStep)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }
        console.error('Substep block error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string; stepId: string; sid: string }> }
) {
    const params = await props.params
    try {
        const session = await auth()
        if (!session || (session.user.role !== 'WORKER' && session.user.role !== 'TEAM_LEAD')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const updatedSubStep = await prisma.jobSubStep.update({
            where: { id: params.sid },
            data: {
                blockedAt: null,
                blockedReason: null,
                blockedNote: null
            }
        })

        return NextResponse.json(updatedSubStep)
    } catch (error) {
        console.error('Substep unblock error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
