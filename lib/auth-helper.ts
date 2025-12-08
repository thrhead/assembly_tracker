import { auth } from "@/lib/auth"
import { jwtVerify } from "jose"

export async function verifyAuth(req: Request) {
    // 1. Check Authorization header (Mobile) first for performance
    const authHeader = req.headers.get("Authorization")
    console.log("verifyAuth: Auth header present:", !!authHeader, authHeader ? authHeader.substring(0, 20) + "..." : "none")

    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1]
        try {
            const secretKey = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback_secret"
            // console.log("verifyAuth: Verifying token with secret length:", secretKey.length)
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
            // If token is invalid, we don't fall back to cookie auth for security reasons
            // (if a token is provided, it must be valid)
            return null
        }
    } else {
        console.log("verifyAuth: No Bearer token found in header, falling back to cookies")
    }

    // 2. Fallback to NextAuth session (Web / Cookies)
    try {
        const start = Date.now();
        const session = await auth()
        console.log(`verifyAuth: Cookie auth took ${Date.now() - start}ms`)
        if (session) return session
    } catch (e) {
        console.error("verifyAuth: NextAuth auth() failed:", e)
    }

    return null
}
