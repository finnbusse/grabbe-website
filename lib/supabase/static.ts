import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

/**
 * Lightweight Supabase client for public read queries that run inside
 * `unstable_cache`. Unlike the SSR client in `server.ts`, this client does
 * NOT depend on `cookies()` and can therefore be called from cached functions.
 *
 * ⚠️  Only use for unauthenticated, public reads — never for mutations or
 *     anything that requires a user session.
 */
export function createStaticClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ''

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    ''

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your Vercel configuration.'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
