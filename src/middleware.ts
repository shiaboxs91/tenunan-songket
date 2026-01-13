import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for these paths
  const excludedPaths = [
    "/maintenance",
    "/atur-server",
    "/api",
    "/_next",
    "/favicon.ico",
    "/images",
    "/sw.js",
    "/manifest.json",
    "/icons",
  ];

  // Check if path should be excluded
  if (excludedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check maintenance mode from environment variable (highest priority)
  const envMaintenanceMode = process.env.MAINTENANCE_MODE === "true";
  
  // Check maintenance mode from cookie (for admin toggle)
  const cookieMaintenanceMode = request.cookies.get("maintenanceMode")?.value === "true";

  // If either is true, redirect to maintenance
  if (envMaintenanceMode || cookieMaintenanceMode) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
