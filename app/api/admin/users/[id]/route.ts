import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import { logger } from '@/lib/logger';

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
    logger.info(`[API] User Update Request for ID: ${params.id}`)
    try {
        const session = await verifyAuth(req)
        if (!session || session.user.role !== 'ADMIN') {
            logger.warn(`[API] User Update Unauthorized: ${session?.user?.role}`)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        logger.info(`[API] User Update Body: ${JSON.stringify(body)}`)
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

        logger.info(`[API] User Updated Successfully: ${updatedUser.email}`)

        return NextResponse.json(updatedUser)
    } catch (error) {
        logger.error(`[API] User Update Error: ${error}`)
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
    logger.info(`[API] User Delete Request for ID: ${params.id}`)
    try {
        const session = await verifyAuth(req)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Prevent deleting yourself
        if (params.id === session.user.id) {
            return NextResponse.json({ error: 'Kendinizi silemezsiniz' }, { status: 400 })
        }

        await prisma.user.delete({
            where: { id: params.id }
        })

        logger.info(`[API] User Deleted Successfully: ${params.id}`)

        return NextResponse.json({ success: true })
    } catch (error) {
        logger.error(`[API] User Delete Error: ${error}`)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
