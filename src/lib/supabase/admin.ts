import { createClient } from '@supabase/supabase-js'

/**
 * Service role Supabase client.
 * WARNING: NEVER use on the client side.
 * This client bypasses Row Level Security and is reserved for server-side
 * admin actions, authenticated API routes, and backend workers.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn(
        '[Supabase Admin] WARNING: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment.'
      )
    }
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
