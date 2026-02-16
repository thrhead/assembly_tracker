import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/auth-helper'
import { z } from 'zod'
import { generateApiKey, hashApiKey } from '@/lib/api-security'

const apiKeySchema = z.object({
    name: z.string().min(1, 'İsim gereklidir'),
    scopes: z.array(z.string()).default(['jobs:read'])
})

export async function GET(req: Request) {
    try {
        const session = await verifyAdmin(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const apiKeys = await prisma.apiKey.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                scopes: true,
                isActive: true,
                lastUsedAt: true,
                createdAt: true,
                updatedAt: true
            }
        })

        return NextResponse.json(apiKeys)
    } catch (error) {
        console.error('API Key fetch error:', error)
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
        const { name, scopes } = apiKeySchema.parse(body)

        // Generate a random API key using our security utility
        const rawKey = generateApiKey()

        // Hash the key using SHA-256 for storage
        const hashedKey = hashApiKey(rawKey)

        const newApiKey = await prisma.apiKey.create({
            data: {
                name,
                scopes,
                key: hashedKey,
                userId: session.user.id
            },
            select: {
                id: true,
                name: true,
                scopes: true,
                isActive: true,
                createdAt: true
            }
        })

        return NextResponse.json({
            ...newApiKey,
            apiKey: rawKey
        }, { status: 201 })
    } catch (error) {
        console.error('API Key creation error:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}