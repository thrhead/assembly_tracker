import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { compare } from "bcryptjs"
import { loginSchema } from "@/lib/validations"
import { SignJWT } from "jose"

// CORS headers helper
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

import * as fs from 'fs';
import * as path from 'path';

const LOG_FILE = path.join(process.cwd(), 'api_debug.log');

function logToFile(message: string) {
    const timestamp = new Date().toISOString();
    try {
        fs.appendFileSync(LOG_FILE, `${timestamp} - ${message}\n`);
    } catch (e) {
        console.error('Failed to write to log file:', e);
    }
}

export async function POST(req: Request) {
    logToFile("Mobile login request received (POST /api/mobile/login)")
    try {
        const body = await req.json()
        logToFile(`Login attempt for email: ${body.email}`)
        const { email, password } = loginSchema.parse(body)

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user || !user.isActive) {
            logToFile(`Login failed: User not found or inactive (${email})`)
            return NextResponse.json({ error: "Kullanıcı bulunamadı veya aktif değil" }, { status: 401, headers: corsHeaders })
        }

        const isPasswordValid = await compare(password, user.passwordHash)

        if (!isPasswordValid) {
            logToFile(`Login failed: Invalid password for ${email}`)
            return NextResponse.json({ error: "Hatalı şifre" }, { status: 401, headers: corsHeaders })
        }

        logToFile(`Login success: ${email} (Role: ${user.role})`)

        // Create a simple JWT token for the mobile app using jose
        const secret = new TextEncoder().encode(
            process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback_secret"
        )

        const token = await new SignJWT({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('30d')
            .sign(secret)

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                phone: user.phone,
            },
            token
        }, { headers: corsHeaders })
    } catch (error) {
        logToFile(`Mobile login error: ${error}`)
        console.error("Mobile login error:", error)
        return NextResponse.json({
            error: "Giriş yapılamadı",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500, headers: corsHeaders })
    }
}
