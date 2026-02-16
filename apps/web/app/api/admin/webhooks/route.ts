
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/auth-helper'
import { z } from 'zod'

const webhookSchema = z.object({
    url: z.string().url('Geçerli bir URL giriniz'),
    event: z.string().min(1, 'Olay türü gereklidir'),
    secret: z.string().optional()
})

export async function GET(req: Request) {
    try {
        const session = await verifyAdmin(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const webhooks = await prisma.webhook.findMany({
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(webhooks)
    } catch (error) {
        console.error('Webhook fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await verifyAdmin(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const data = webhookSchema.parse(body)

        const newWebhook = await prisma.webhook.create({
            data: {
                url: data.url,
                event: data.event,
                secret: data.secret,
                isActive: true
            }
        })

        return NextResponse.json(newWebhook, { status: 201 })
    } catch (error) {
        console.error('Webhook creation error:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
