import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { compare } from 'bcryptjs'
import { SignJWT } from 'jose'

// Generate a real JWT token compatible with verifyAuth
const generateToken = async (user: any) => {
    const secretKey = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback_secret"
    const secret = new TextEncoder().encode(secretKey)
    
    const token = await new SignJWT({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d') // Long expiration for mobile app
        .sign(secret)
        
    return token
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
        const token = await generateToken(user)
        
        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token: token 
        })

    } catch (error) {
        console.error('Mobile Login Error:', error)
        return NextResponse.json(
            { error: 'Giriş yapılamadı.' },
            { status: 500 }
        )
    }
}
