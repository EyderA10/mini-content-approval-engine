import { createBrowserClient } from '@supabase/ssr'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

/**
 * Creates and caches a memoized Supabase browser client.
 * Uses singleton pattern to avoid creating multiple instances.
 */
export function getMemoizedClient() {
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      throw new Error(
        'Missing Supabase browser environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      )
    }

    browserClient = createBrowserClient(url, anonKey)
  }

  return browserClient
}

// Re-export the type for convenience
export type { SupabaseClient } from '@supabase/supabase-js'