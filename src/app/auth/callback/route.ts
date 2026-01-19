import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Custom OAuth Callback Handler
 * 
 * Ini memungkinkan URL callback menggunakan domain kustom
 * instead of langsung ke Supabase
 * 
 * URL: /auth/callback
 * 
 * Google/Facebook/Apple akan redirect ke:
 * https://tenunansongket.com/auth/callback?code=xxx
 * 
 * Kemudian kita exchange code dengan Supabase
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle error from OAuth provider
  if (error) {
    console.error('OAuth Error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    );
  }

  if (code) {
    const supabase = await createClient();
    
    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Code exchange error:', exchangeError.message);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      );
    }
  }

  // Redirect to the next page or home
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
