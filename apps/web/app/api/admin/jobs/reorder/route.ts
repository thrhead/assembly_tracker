
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdminOrManager } from '@/lib/auth-helper'
import { z } from 'zod'

const reorderSchema = z.object({
    orders: z.array(z.object({
        id: z.string(),
        ganttOrder: z.number()
    }))
})

export async function PATCH(req: Request) {
    try {
        const session = await verifyAdminOrManager(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { orders } = reorderSchema.parse(body)

        // Perform updates in a transaction
        await prisma.$transaction(
            orders.map((item) =>
                prisma.job.update({
                    where: { id: item.id },
                    data: { ganttOrder: item.ganttOrder }
                })
            )
        )

        return NextResponse.json({ message: 'Orders updated successfully' })
    } catch (error) {
        console.error('Reorder error:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
