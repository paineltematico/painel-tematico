import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'leads.archive')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params
  const { motivo } = await req.json()

  if (!motivo?.trim()) {
    return NextResponse.json({ error: 'Motivo obrigatório' }, { status: 400 })
  }

  const now = new Date().toISOString()

  // Soft delete
  const { error } = await supabaseAdmin
    .from('contactos_imoveis')
    .update({
      arquivado: true,
      arquivado_em: now,
      arquivado_por: me.id,
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Registar no histórico — tipo 'arquivamento' só visível para super_admin na UI
  await supabaseAdmin.from('lead_atividades').insert({
    lead_id: id,
    tipo: 'arquivamento',
    conteudo: `Arquivado por ${me.nome} — Motivo: ${motivo.trim()}`,
    created_at: now,
  })

  return NextResponse.json({ ok: true })
}
