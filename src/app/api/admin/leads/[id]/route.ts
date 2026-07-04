import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'
import { podeAcederLead } from '@/lib/crm-server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'leads.view')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params
  if (!(await podeAcederLead(me, id))) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }
  const { data, error } = await supabaseAdmin
    .from('contactos_imoveis')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'leads.edit')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params
  if (!(await podeAcederLead(me, id))) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }
  const body = await req.json()

  // Only allow safe fields to be updated via this endpoint
  const allowed = [
    'nome', 'email', 'telefone', 'mensagem', 'fonte', 'lido',
    'imovel_titulo', 'notas_interesse', 'notas', 'prioridade', 'temperatura',
  ]
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nada a atualizar' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('contactos_imoveis')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
