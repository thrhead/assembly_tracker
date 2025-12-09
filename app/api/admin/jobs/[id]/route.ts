import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { z } from 'zod'
import { logger } from '@/lib/logger';

const updateJobSchema = z.object({
    startedAt: z.string().optional().nullable(),
    completedDate: z.string().optional().nullable(),
})

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await verifyAuth(req)
        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const params = await props.params
        const body = await req.json()
        const { startedAt, completedDate } = updateJobSchema.parse(body)

        const updatedJob = await prisma.job.update({
            where: { id: params.id },
            data: {
                startedAt: startedAt ? new Date(startedAt) : undefined,
                completedDate: completedDate ? new Date(completedDate) : undefined,
                status: completedDate ? 'COMPLETED' : undefined // Auto update status if completed date is set
            }
        })

        return NextResponse.json({ success: true, job: updatedJob })
    } catch (error) {
        logger.error(`Update job error: ${error instanceof Error ? error.message : String(error)}`)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
