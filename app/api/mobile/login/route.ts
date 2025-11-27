import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { compare } from "bcryptjs"
import { loginSchema } from "@/lib/validations"
import { SignJWT } from "jose"

export async function POST(req: Request) {
    console.log("Mobile login request received")
    try {
        const body = await req.json()
        const { email, password } = loginSchema.parse(body)

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user || !user.isActive) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı veya aktif değil" }, { status: 401 })
        }

        const isPasswordValid = await compare(password, user.passwordHash)

        if (!isPasswordValid) {
            return NextResponse.json({ error: "Hatalı şifre" }, { status: 401 })
        }

        // Create a simple JWT token for the mobile app using jose
        const secret = new TextEncoder().encode(
            process.env.NEXTAUTH_SECRET || "fallback_secret"
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
        })
    } catch (error) {
        console.error("Mobile login error:", error)
        return NextResponse.json({
            error: "Giriş yapılamadı",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
