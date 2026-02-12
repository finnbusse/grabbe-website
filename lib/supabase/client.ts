import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database.types'

export function createClient() {
  // Support multiple environment variable naming conventions
  // Note: In browser context, only NEXT_PUBLIC_* variables are accessible
  const supabaseUrl = 
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    ''
  
  // Check both ANON_KEY (standard) and PUBLISHABLE_KEY (Vercel integration naming)
  const supabaseKey = 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ''

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) in your Vercel environment variables.')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}
