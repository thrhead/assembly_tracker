import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { z } from 'zod'

const addCostSchema = z.object({
    description: z.string(),
    amount: z.number(),
    category: z.string()
})

export async function POST(
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
        const { description, amount, category } = addCostSchema.parse(body)

        const cost = await prisma.costTracking.create({
            data: {
                jobId: params.id,
                description,
                amount,
                category,
                createdById: session.user.id,
                status: 'APPROVED', // Admin added costs are auto-approved
                approvedById: session.user.id
            }
        })

        return NextResponse.json({ success: true, cost })
    } catch (error) {
        console.error('Add cost error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await verifyAuth(req)
        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const costId = searchParams.get('id')

        if (!costId) {
            return NextResponse.json({ error: 'Cost ID required' }, { status: 400 })
        }

        await prisma.costTracking.delete({
            where: { id: costId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete cost error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
