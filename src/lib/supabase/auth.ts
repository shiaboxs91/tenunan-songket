import { getSupabaseClient } from './client'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthResponse {
  user: User | null
  session: Session | null
  error: Error | null
}

export interface UserMetadata {
  full_name?: string
  phone?: string
  avatar_url?: string
}

export async function signUp(
  email: string,
  password: string,
  metadata?: UserMetadata
): Promise<AuthResponse> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })

  return {
    user: data.user,
    session: data.session,
    error: error as Error | null,
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return {
    user: data.user,
    session: data.session,
    error: error as Error | null,
  }
}

export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  return { error: error as Error | null }
}

export async function signInWithFacebook(): Promise<{ error: Error | null }> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  return { error: error as Error | null }
}

export async function signInWithApple(): Promise<{ error: Error | null }> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  return { error: error as Error | null }
}

export async function signOut(): Promise<{ error: Error | null }> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()
  return { error: error as Error | null }
}

export async function resetPassword(email: string): Promise<{ error: Error | null }> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  return { error: error as Error | null }
}

export async function updatePassword(newPassword: string): Promise<{ error: Error | null }> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  return { error: error as Error | null }
}

export async function getSession(): Promise<Session | null> {
  const supabase = getSupabaseClient()
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getUser(): Promise<User | null> {
  const supabase = getSupabaseClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}

export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  const supabase = getSupabaseClient()
  return supabase.auth.onAuthStateChange(callback)
}
