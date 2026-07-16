import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

// POST /api/admin/oportunidades/[id]/estado — muda o estado e regista atividade
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'oportunidades.edit')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }
  const { id } = await params
  const { estado, estado_anterior } = await req.json()
  if (!estado) return NextResponse.json({ error: 'Estado obrigatório' }, { status: 400 })

  const update: Record<string, unknown> = { estado }
  if (estado === 'arquivada') update.arquivado_em = new Date().toISOString()

  const { error } = await supabaseAdmin
    .from('oportunidades')
    .update(update)
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('oportunidade_atividades').insert({
    oportunidade_id: id,
    tipo: 'mudanca_estado',
    estado_anterior: estado_anterior ?? null,
    estado_novo: estado,
  })

  return NextResponse.json({ ok: true })
}
