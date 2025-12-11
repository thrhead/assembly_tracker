import { auth } from "@/lib/auth"
import { jwtVerify } from "jose"

export async function verifyAuth(req: Request) {
    // 1. Check Authorization header (Mobile) first for performance
    const authHeader = req.headers.get("Authorization")
    // console.log("verifyAuth: Auth header present:", !!authHeader)

    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1]
        try {
            const secretKey = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback_secret"
            const secret = new TextEncoder().encode(secretKey)
            const { payload } = await jwtVerify(token, secret)
            // console.log("verifyAuth: Token verified, role:", payload.role)

            // Return a session-like object
            return {
                user: {
                    id: payload.id as string,
                    email: payload.email as string,
                    role: payload.role as string,
                    name: payload.name as string,
                    phone: payload.phone as string | undefined
                },
                expires: new Date(payload.exp! * 1000).toISOString()
            }
        } catch (err) {
            console.error("verifyAuth: Token verification failed:", err)
            // If token is invalid, we don't fall back to cookie auth for security reasons
            // (if a token is provided, it must be valid)
            return null
        }
    }

    // 2. Fallback to NextAuth session (Web / Cookies)
    try {
        const session = await auth()
        if (session) return session
    } catch (e) {
        console.error("verifyAuth: NextAuth auth() failed:", e)
    }

    return null
}

export async function verifyAdminOrManager(req: Request) {
    const session = await verifyAuth(req)
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
        return null
    }
    return session
}
