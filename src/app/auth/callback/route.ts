import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * OAuth callback handler
 * This route handles the callback from OAuth providers (Google, etc.)
 * It exchanges the code for a session and redirects the user
 * 
 * Also handles password recovery tokens by redirecting to reset-password page
 */
export async function GET(request: Request) {
  const { searchParams, origin, hash } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  // Check if this is a password recovery callback
  // Recovery tokens come as hash fragments, but we can check for type=recovery in query params
  const type = searchParams.get('type')
  if (type === 'recovery' || hash.includes('type=recovery')) {
    // Redirect to reset password page - the token will be in the hash fragment
    return NextResponse.redirect(new URL('/reset-password', origin))
  }

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const redirectUrl = new URL('/login', origin)
    redirectUrl.searchParams.set('error', error)
    if (errorDescription) {
      redirectUrl.searchParams.set('error_description', errorDescription)
    }
    return NextResponse.redirect(redirectUrl)
  }

  if (code) {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      const redirectUrl = new URL('/login', origin)
      redirectUrl.searchParams.set('error', 'auth_error')
      redirectUrl.searchParams.set('error_description', exchangeError.message)
      return NextResponse.redirect(redirectUrl)
    }

    // Successful authentication - redirect to the intended destination
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    
    if (isLocalEnv) {
      // In development, redirect to localhost
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      // In production with a proxy, use the forwarded host
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      // Default redirect
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(new URL('/login', origin))
}
