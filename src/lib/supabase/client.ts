import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

// Singleton instance — cegah Multiple GoTrueClient warning
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (typeof window === 'undefined') {
    // SSR fallback — buat baru tiap kali (server side tidak perlu singleton)
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Client side — pakai singleton agar tidak ada multiple instances
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  return browserClient
}

// Alias untuk konsistensi
export const getSupabaseClient = createClient
