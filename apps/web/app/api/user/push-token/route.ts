import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'

export async function POST(req: Request) {
    try {
        const session = await verifyAuth(req)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { token } = body
        
        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 })
        }

        // Upsert push token for the user
        await prisma.pushToken.upsert({
            where: { token },
            update: { 
                userId: session.user.id,
                updatedAt: new Date()
            },
            create: { 
                token, 
                userId: session.user.id 
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[PUSH_TOKEN_POST]', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await verifyAuth(req)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { token } = body
        
        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 })
        }

        // Delete specific token for this user
        await prisma.pushToken.deleteMany({
            where: { 
                token,
                userId: session.user.id 
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[PUSH_TOKEN_DELETE]', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}