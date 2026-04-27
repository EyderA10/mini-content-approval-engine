import { createClient } from '@supabase/supabase-js'

export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase server environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }

  // Server request client with anon key for unprivileged server reads.
  return createClient(url, anonKey)
}