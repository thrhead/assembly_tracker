import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
const { auth } = NextAuth(authConfig);
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from 'next-intl/middleware';

const ALLOWED_ORIGINS = [
  /^http:\/\/localhost:\d+$/,
  /^https:\/\/assembly-.*\.vercel\.app$/,
  /^https:\/\/assemblyweb\.vercel\.app$/
];

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'tr'],

  // Used when no locale matches
  defaultLocale: 'tr',

  // Don't prefix the default locale
  localePrefix: 'as-needed'
});

import { rateLimit } from "@/lib/rate-limit";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Rate Limit for Auth routes
  /*
  if (pathname.includes("/api/auth") || pathname === "/login") {
    if (!rateLimit(ip, 50, 60000)) { // 50 requests per minute
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }
  */

  // 1. CORS Handling for API
  if (pathname.startsWith("/api")) {
    const origin = req.headers.get("origin");
    const isAllowed = origin && ALLOWED_ORIGINS.some((pattern) => pattern.test(origin));

    if (isAllowed || !origin) {
      const response = NextResponse.next();
      if (origin) response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
      response.headers.set("Access-Control-Allow-Credentials", "true");
      return response;
    }
    return new NextResponse("CORS Error: Origin not allowed", { status: 403 });
  }

  // 2. Auth & Role Based Redirection
  if (isLoggedIn) {
    // If user is logged in and on login page, redirect to their dashboard
    if (pathname === "/login") {
      return NextResponse.redirect(new URL(getDashboardUrl(userRole), req.url));
    }

    // If user is on root, redirect to their dashboard
    if (pathname === "/") {
      return NextResponse.redirect(new URL(getDashboardUrl(userRole), req.url));
    }

    // Protection: Ensure users only access their role-specific pages
    // We need to account for locale prefix (e.g., /tr/admin, /en/admin)
    const pathWithoutLocale = pathname.replace(/^\/(tr|en)/, "") || "/";

    if (pathWithoutLocale.startsWith("/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathWithoutLocale.startsWith("/manager") && !["ADMIN", "MANAGER"].includes(userRole!)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathWithoutLocale.startsWith("/worker") && !["ADMIN", "MANAGER", "WORKER", "TEAM_LEAD"].includes(userRole!)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathWithoutLocale.startsWith("/customer") && userRole !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  } else {
    // If NOT logged in and trying to access protected pages
    const pathWithoutLocale = pathname.replace(/^\/(tr|en)/, "") || "/";
    const protectedPaths = ["/admin", "/manager", "/worker", "/customer"];
    if (protectedPaths.some(path => pathWithoutLocale.startsWith(path))) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 3. Internationalization (for non-API routes)
  if (!pathname.startsWith("/api") && !pathname.startsWith("/_next") && !pathname.includes(".")) {
    return intlMiddleware(req);
  }

  return NextResponse.next();
});

function getDashboardUrl(role?: string) {
  switch (role) {
    case "ADMIN": return "/admin";
    case "MANAGER": return "/manager";
    case "CUSTOMER": return "/customer";
    case "WORKER":
    case "TEAM_LEAD":
      return "/worker";
    default: return "/";
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)", "/api/:path*"],
};