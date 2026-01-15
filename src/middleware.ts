import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { handleAuth, isProtectedRoute, isAdminRoute, isAuthRoute } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for these paths (static assets, API routes, etc.)
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
    "/auth/callback", // OAuth callback route
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

  // Handle authentication for protected, admin, and auth routes
  const requiresAuthHandling = 
    isProtectedRoute(pathname) || 
    isAdminRoute(pathname) || 
    isAuthRoute(pathname);

  if (requiresAuthHandling) {
    return handleAuth(request);
  }

  // For all other routes, still refresh the session if user is logged in
  // This ensures the session stays alive across the site
  try {
    const authResponse = await handleAuth(request);
    return authResponse;
  } catch {
    // If auth handling fails, continue without auth
    return NextResponse.next();
  }
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
