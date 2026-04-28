import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  // Guard against browser usage - service role key must never be exposed client-side
  if (typeof window !== 'undefined') {
    throw new TypeError('Admin client cannot be used in browser context')
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin environment variables: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  // Server-only admin client: service role key for privileged writes.
  return createClient(url, serviceRoleKey)
}