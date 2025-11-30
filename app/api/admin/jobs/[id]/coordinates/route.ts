import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { z } from 'zod'

const coordinatesSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
})

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const session = await verifyAuth(req)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { latitude, longitude } = coordinatesSchema.parse(body)

        const job = await prisma.job.update({
            where: { id: params.id },
            data: {
                latitude,
                longitude
            }
        })

        return NextResponse.json(job)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
        }
        console.error('Update coordinates error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
