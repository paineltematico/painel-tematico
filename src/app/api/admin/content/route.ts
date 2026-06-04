import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

/** PATCH /api/admin/content
 *  Body: { key: string, value: string }
 *  Upserts a site_settings row. Requires admin auth.
 */
export async function PATCH(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json() as { key?: string; value?: string }
  const { key, value } = body

  if (!key || typeof value !== 'string') {
    return NextResponse.json({ error: 'key e value são obrigatórios' }, { status: 400 })
  }

  const { error } = await supabaseAdmin()
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

  if (error) {
    console.error('[content PATCH]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
