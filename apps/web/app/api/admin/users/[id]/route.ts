import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import { logger } from '@/lib/logger'

const updateUserSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'TEAM_LEAD', 'WORKER', 'CUSTOMER']).optional(),
    password: z.string().min(6).optional(),
    isActive: z.boolean().optional(),
})

export async function PUT(
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
        const data = updateUserSchema.parse(body)

        const updateData: any = { ...data }

        if (data.password) {
            updateData.passwordHash = await hash(data.password, 12)
            delete updateData.password
        }

        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        })

        logger.audit(`User updated: ${updatedUser.name} (${updatedUser.role})`, {
            userId: updatedUser.id,
            updaterId: session.user.id,
            updates: Object.keys(data)
        });

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('User update error:', error)
        logger.error('Failed to update user', { error: (error as Error).message, userId: (await props.params).id });
        if (error instanceof z.ZodError) {
            const errorMessage = error.issues.map(issue => issue.message).join(', ')
            return NextResponse.json({ error: errorMessage, details: error.issues }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const session = await verifyAuth(req)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Prevent deleting yourself
        if (params.id === session.user.id) {
            return NextResponse.json({ error: 'Kendinizi silemezsiniz' }, { status: 400 })
        }

        // Get user details before deleting for log
        const userToDelete = await prisma.user.findUnique({
            where: { id: params.id },
            select: { name: true, email: true }
        })

        await prisma.user.delete({
            where: { id: params.id }
        })

        logger.audit(`User deleted: ${userToDelete?.name || params.id}`, {
            userId: params.id,
            deleterId: session.user.id,
            userEmail: userToDelete?.email
        });

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('User delete error:', error)
        logger.error('Failed to delete user', { error: (error as Error).message, userId: params.id });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
