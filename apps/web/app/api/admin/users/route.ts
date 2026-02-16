import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/auth-helper'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import { createUserAdminSchema } from '@/lib/validations-edge'
import { logger } from '@/lib/logger'

export async function GET(req: Request) {
    try {
        const session = await verifyAdmin(req)

        if (!session) {
            console.warn(`Users API: Unauthorized access attempt`)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const role = searchParams.get('role')
        const search = searchParams.get('search')

        const where: any = {}

        if (role && role !== 'ALL') {
            where.role = role.toUpperCase()
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ]
        }

        const users = await prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
            }
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error('Users fetch error:', error)
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
        const data = createUserAdminSchema.parse(body)

        // Check if email exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (existingUser) {
            return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanımda' }, { status: 400 })
        }

        // Hash password (default: 123456 if not provided)
        const password = data.password || '123456'
        const passwordHash = await hash(password, 12)

        const newUser = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                role: data.role,
                passwordHash,
                isActive: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        })

        logger.audit(`User created: ${newUser.name} (${newUser.role})`, {
            userId: newUser.id,
            adminId: session.user.id
        });

        return NextResponse.json(newUser, { status: 201 })
    } catch (error) {
        console.error('User creation error:', error)
        logger.error('Failed to create user', { error: (error as Error).message });
        if (error instanceof z.ZodError) {
            const errorMessage = error.issues.map(issue => issue.message).join(', ')
            return NextResponse.json({ error: errorMessage, details: error.issues }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
