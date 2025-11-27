import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  console.log(`[Middleware] ${request.method} ${request.nextUrl.pathname} - Auth: ${request.headers.get("authorization") ? "Present" : "Missing"}`)

  // Skip middleware for mobile login to avoid NextAuth issues
  if (request.nextUrl.pathname.startsWith("/api/mobile/login")) {
    return NextResponse.next()
  }

  let session = null
  try {
    session = await auth()
  } catch (err) {
    console.error("[Middleware] Auth error:", err)
  }

  const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register")

  const isDashboardPage = request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/manager") ||
    request.nextUrl.pathname.startsWith("/worker") ||
    request.nextUrl.pathname.startsWith("/customer")

  // Eğer kullanıcı giriş yapmışsa ve auth sayfasındaysa, dashboard'a yönlendir
  if (session && isAuthPage) {
    const role = session.user?.role?.toLowerCase()
    return NextResponse.redirect(new URL(`/${role}`, request.url))
  }

  // Eğer kullanıcı giriş yapmamışsa ve protected sayfadaysa, login'e yönlendir  
  if (!session && isDashboardPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // CORS Handling
  const origin = request.headers.get("origin")

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
        "Access-Control-Allow-Credentials": "true",
      },
    })
  }

  // Role-based access control
  if (session && isDashboardPage) {
    const role = session.user?.role?.toLowerCase()
    const currentPath = request.nextUrl.pathname

    // Kullanıcı kendi rolüne ait olmayan bir sayfaya erişmeye çalışıyorsa
    if (!currentPath.startsWith(`/${role}`) && !currentPath.startsWith("/api")) {
      return NextResponse.redirect(new URL(`/${role}`, request.url))
    }
  }

  const response = NextResponse.next()

  // Add CORS headers to response
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version")
  }

  return response
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/manager/:path*",
    "/worker/:path*",
    "/customer/:path*",
    "/login",
    "/register",
    "/api/:path*",
  ],
}
