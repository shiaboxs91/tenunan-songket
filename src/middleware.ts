import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { handleAuth, isProtectedRoute, isAdminRoute, isAuthRoute } from "./lib/supabase/middleware";

// Cache server status for 30 seconds to avoid hitting DB on every request
let cachedStatus: { is_active: boolean; timestamp: number } | null = null;
const CACHE_TTL = 30_000; // 30 seconds

async function checkServerActive(): Promise<boolean> {
  // Return cached value if fresh
  if (cachedStatus && Date.now() - cachedStatus.timestamp < CACHE_TTL) {
    return cachedStatus.is_active;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return true; // default active if no config

    const res = await fetch(
      `${supabaseUrl}/rest/v1/site_settings?key=eq.server_status&select=value`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 30 },
      }
    );

    if (!res.ok) return true; // default active on error

    const data = await res.json();
    const is_active = data?.[0]?.value?.is_active ?? true;

    cachedStatus = { is_active, timestamp: Date.now() };
    return is_active;
  } catch {
    return true; // default active on error
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for these paths (static assets, API routes, etc.)
  const excludedPaths = [
    "/server-expired",
    "/maintenance",
    "/atur-server",
    "/api",
    "/_next",
    "/favicon.ico",
    "/images",
    "/sw.js",
    "/manifest.json",
    "/icons",
    "/auth/callback",
  ];

  // Check if path should be excluded
  if (excludedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check server status from database
  const isActive = await checkServerActive();
  if (!isActive) {
    return NextResponse.redirect(new URL("/server-expired", request.url));
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
