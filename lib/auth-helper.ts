import { auth } from "@/lib/auth"
import { jwtVerify } from "jose"

export async function verifyAuth(req: Request) {
    // 1. Check NextAuth session (Cookies)
    const session = await auth()
    if (session) return session

    // 2. Check Authorization header (Mobile)
    const authHeader = req.headers.get("Authorization")
    console.log("verifyAuth: Auth header:", authHeader)
    if (!authHeader) console.log("verifyAuth: No auth header found")

    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1]
        try {
            const secretKey = process.env.NEXTAUTH_SECRET || "fallback_secret"
            console.log("verifyAuth: Verifying token with secret length:", secretKey.length)
            const secret = new TextEncoder().encode(secretKey)
            const { payload } = await jwtVerify(token, secret)
            console.log("verifyAuth: Token verified, role:", payload.role)

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
            // Token invalid or expired
            return null
        }
    } else {
        console.log("verifyAuth: No Bearer token found in header")
    }

    return null
}
