import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'leads.comerciais')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params
  const { responsavel_id, responsavel_nome, motivo } = await req.json()

  if (!responsavel_id) {
    return NextResponse.json({ error: 'Responsável obrigatório' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('contactos_imoveis')
    .update({ responsavel_id })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('lead_atividades').insert({
    lead_id: id,
    tipo: 'transferencia',
    conteudo: `Lead transferido para ${responsavel_nome} por ${me.nome}${motivo ? ` — ${motivo}` : ''}`,
    created_at: new Date().toISOString(),
  })

  return NextResponse.json({ ok: true })
}
