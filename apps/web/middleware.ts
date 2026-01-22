import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  /^http:\/\/localhost:\d+$/,
  /^https:\/\/assembly-.*\.vercel\.app$/, // Allow all assembly-* Vercel subdomains
  /^https:\/\/assemblyweb\.vercel\.app$/
];

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const { pathname } = request.nextUrl;

  // Only apply CORS to /api routes
  if (pathname.startsWith("/api")) {
    // Check if origin is allowed
    const isAllowed = origin && ALLOWED_ORIGINS.some((pattern) => pattern.test(origin));

    if (isAllowed || !origin) {
      const response = NextResponse.next();

      if (origin) {
        response.headers.set("Access-Control-Allow-Origin", origin);
      }
      
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
      response.headers.set("Access-Control-Allow-Credentials", "true");

      return response;
    }
    
    // Block disallowed origins
    return new NextResponse("CORS Error: Origin not allowed", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
