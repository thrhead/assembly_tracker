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

const createUserSchema = z.object({
    name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    role: z.enum(['ADMIN', 'MANAGER', 'TEAM_LEAD', 'WORKER', 'CUSTOMER']),
    password: z.string().optional().transform(val => val || undefined), // Convert empty string to undefined
})

export async function GET(req: Request) {
    logToFile("Users API: GET Request received")
    try {
        const session = await verifyAuth(req)
        logToFile(`Users API: Session: ${session ? "Found" : "Null"}, Role: ${session?.user?.role}`)

        if (!session || session.user.role !== 'ADMIN') {
            logToFile("Users API: Unauthorized access attempt")
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
                { name: { contains: search } },
                { email: { contains: search } }
            ]
        }

        logToFile(`[API] Users Fetch Query: ${JSON.stringify(where)}`)

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
                // Exclude passwordHash
            }
        })

        return NextResponse.json(users)
    } catch (error) {
        logToFile(`Users fetch error: ${error}`)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await verifyAuth(req)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        logToFile(`[API] User Create Request Body: ${JSON.stringify(body)}`)
        const data = createUserSchema.parse(body)

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

        return NextResponse.json(newUser, { status: 201 })
    } catch (error) {
        logToFile(`[API] User Create Error: ${error}`)
        if (error instanceof z.ZodError) {
            const errorMessage = error.issues.map(issue => issue.message).join(', ')
            return NextResponse.json({ error: errorMessage, details: error.issues }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
