import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './types'

/**
 * Creates a Supabase client for use in middleware
 * Handles session refresh automatically
 */
export async function createMiddlewareClient(request: NextRequest) {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  return { supabase, response }
}

/**
 * Protected routes that require authentication
 */
export const PROTECTED_ROUTES = [
  '/account',
  '/checkout',
  '/orders',
  '/wishlist',
]

/**
 * Admin-only routes
 */
export const ADMIN_ROUTES = [
  '/admin',
]

/**
 * Auth routes (redirect to home if already logged in)
 */
export const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
]

/**
 * Check if a path matches any of the protected routes
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

/**
 * Check if a path matches any of the admin routes
 */
export function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

/**
 * Check if a path matches any of the auth routes
 */
export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

/**
 * Handle authentication in middleware
 * - Refreshes session if needed
 * - Redirects unauthenticated users from protected routes
 * - Redirects authenticated users from auth routes
 * - Checks admin role for admin routes
 */
export async function handleAuth(request: NextRequest) {
  const { supabase, response } = await createMiddlewareClient(request)
  const { pathname } = request.nextUrl

  // Refresh session - this is important for keeping the session alive
  // The getUser() call will refresh the session if needed
  const { data: { user }, error } = await supabase.auth.getUser()

  // Handle protected routes - require authentication
  if (isProtectedRoute(pathname)) {
    if (!user || error) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Handle admin routes - require admin role
  if (isAdminRoute(pathname)) {
    if (!user || error) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      // Redirect non-admin users to home
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Handle auth routes - redirect to home if already logged in
  if (isAuthRoute(pathname)) {
    if (user && !error) {
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/'
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
  }

  return response
}
