import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth-server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'super_admin') {
    return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })
  }

  const { userId, permissions_extra, permissions_denied } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId em falta.' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('admin_users')
    .update({ permissions_extra, permissions_denied })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
