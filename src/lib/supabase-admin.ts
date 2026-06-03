import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client com service role key.
 * Bypassa RLS — usar APENAS em API routes server-side, nunca no cliente.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
