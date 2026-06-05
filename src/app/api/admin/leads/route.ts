import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

export async function POST(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'leads.create')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await req.json()

  const { data, error } = await supabaseAdmin
    .from('contactos_imoveis')
    .insert({
      ...body,
      criado_por: me.id,
      responsavel_id: body.responsavel_id ?? me.id,
      estado: 'novo',
      temperatura: 'frio',
      score: 0,
      lido: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
