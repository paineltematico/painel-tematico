import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

export async function POST(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'imoveis.create')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await req.json()

  // Sessão "bootstrap" (login master sem email) não tem registo em admin_users
  const angariador_id = me.id && me.id !== 'bootstrap' ? me.id : null

  const { data, error } = await supabaseAdmin
    .from('imoveis')
    .insert({ ...body, angariador_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
