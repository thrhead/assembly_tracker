import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register")

    if (isAuthPage) {
      if (isAuth) {
        const role = token?.role?.toString().toLowerCase()
        return NextResponse.redirect(new URL(`/${role}`, req.url))
      }
      return null
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    const role = token?.role?.toString().toLowerCase()
    const path = req.nextUrl.pathname

    // Role based access control
    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(`/${role}`, req.url))
    }
    if (path.startsWith("/manager") && role !== "manager") {
      return NextResponse.redirect(new URL(`/${role}`, req.url))
    }
    if (path.startsWith("/worker") && role !== "worker") {
      return NextResponse.redirect(new URL(`/${role}`, req.url))
    }
    if (path.startsWith("/customer") && role !== "customer") {
      return NextResponse.redirect(new URL(`/${role}`, req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // Let the middleware function handle the logic
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/manager/:path*",
    "/worker/:path*",
    "/customer/:path*",
    "/login",
    "/register",
  ],
}
