import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { compare } from 'bcryptjs'

// Simple mock token generation (in production use JWT)
const generateToken = (userId: string) => {
    return Buffer.from(`${userId}:${Date.now()}`).toString('base64')
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email ve şifre gereklidir.' },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user || !user.isActive) {
            return NextResponse.json(
                { error: 'Kullanıcı bulunamadı veya pasif.' },
                { status: 401 }
            )
        }

        const isPasswordValid = await compare(password, user.passwordHash)

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Hatalı şifre.' },
                { status: 401 }
            )
        }

        // Return user info and a "token" (for mobile app compatibility)
        // Note: Mobile app currently expects { user, token } structure
        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token: generateToken(user.id) // Mock token, replace with JWT if needed
        })

    } catch (error) {
        console.error('Mobile Login Error:', error)
        return NextResponse.json(
            { error: 'Giriş yapılamadı.' },
            { status: 500 }
        )
    }
}
