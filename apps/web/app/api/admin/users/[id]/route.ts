import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import * as fs from 'fs';
import * as path from 'path';

const LOG_FILE = path.join(process.cwd(), 'api_debug.log');

function logToFile(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
    try {
        fs.appendFileSync(LOG_FILE, logMessage);
    } catch (e) {
        console.error('Failed to write to log file:', e);
    }
}

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
    logToFile(`[API] User Update Request for ID: ${params.id}`)
    try {
        const session = await verifyAuth(req)
        if (!session || session.user.role !== 'ADMIN') {
            logToFile(`[API] User Update Unauthorized: ${session?.user?.role}`)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        logToFile(`[API] User Update Body: ${JSON.stringify(body)}`)
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

        logToFile(`[API] User Updated Successfully: ${updatedUser.email}`)

        return NextResponse.json(updatedUser)
    } catch (error) {
        logToFile(`[API] User Update Error: ${error}`)
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
    logToFile(`[API] User Delete Request for ID: ${params.id}`)
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

        logToFile(`[API] User Deleted Successfully: ${params.id}`)

        return NextResponse.json({ success: true })
    } catch (error) {
        logToFile(`[API] User Delete Error: ${error}`)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
