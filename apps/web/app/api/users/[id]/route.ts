
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { z } from 'zod'

const updateUserSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    role: z.enum(["ADMIN", "MANAGER", "TEAM_LEAD", "WORKER", "CUSTOMER"]).optional(),
    isActive: z.boolean().optional(),
    pushToken: z.string().optional(),
})

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        console.log(`[API] PUT /api/users/${(await params).id} started`)
        const session = await verifyAuth(req)
        console.log(`[API] PUT /api/users/${(await params).id} auth check done. Role: ${session?.user?.role}`)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const validatedData = updateUserSchema.parse(body)

        // Check permissions
        // Admin can update anyone. Users can update only their own pushToken (and maybe other safe fields).
        if (session.user.role !== 'ADMIN' && session.user.id !== id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // If it's a self-update by non-admin, limit what they can update
        let dataToUpdate = validatedData;
        if (session.user.role !== 'ADMIN') {
            // Only allow updating pushToken for now for self-updates to be safe, or safe fields
            // Allowing phone and name is also reasonable but let's stick to the plan.
            const { pushToken } = validatedData;
            dataToUpdate = { pushToken };
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: dataToUpdate,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                pushToken: true,
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 })
        }
        console.error('User update error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await verifyAuth(req)
        // Admin can view anyone. Users can view themselves.
        // Manager/TeamLead logic might be needed but for now:

        const { id } = await params;

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (session.user.role !== 'ADMIN' && session.user.id !== id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                pushToken: true,
                isActive: true,
                createdAt: true,
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('User fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
