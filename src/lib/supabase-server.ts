import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client using the anon key for server-side reads.
 * No auth required — this is a public token-based system.
 * Use for read-only API route queries.
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase server environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }

  return createClient(url, anonKey)
}
