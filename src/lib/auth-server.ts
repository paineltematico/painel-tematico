// Server-only module — imports next/headers (not safe in client bundles)
import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from './auth'
import { createClient } from '@supabase/supabase-js'
import type { SessionPayload } from './auth'

const supabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getCurrentUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    const session = verifyToken(token)
    if (!session) return null

    // Load per-user permission overrides from DB
    const { data } = await supabaseAdmin()
      .from('admin_users')
      .select('permissions_extra, permissions_denied')
      .eq('id', session.id)
      .single()

    return {
      ...session,
      permissions_extra:  data?.permissions_extra  ?? [],
      permissions_denied: data?.permissions_denied ?? [],
    }
  } catch {
    return null
  }
}

export type { SessionPayload }
