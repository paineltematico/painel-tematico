import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'
import { criarEventoDia, apagarEvento } from '@/lib/calendar'
import { getTipo } from '@/lib/oportunidades'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'oportunidades.view')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }
  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('oportunidades')
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
  if (!me || !canUser(me, 'oportunidades.edit')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }
  const { id } = await params
  const body = await req.json()

  const allowed = [
    'pessoa_nome', 'pessoa_email', 'pessoa_telefone', 'tipo',
    'localizacao', 'morada', 'cidade', 'codigo_postal', 'mapa_url',
    'tipologia', 'area_m2', 'preco_esperado_min', 'preco_esperado_max',
    'estimativa', 'notas', 'descricao', 'fotos', 'documentos',
    'estado', 'follow_up_data', 'follow_up_nota',
  ]
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nada a atualizar' }, { status: 400 })
  }

  // Se a data de follow-up mudou → repor flag de email e recriar evento no calendário
  if ('follow_up_data' in update) {
    update.follow_up_email_sent = false

    const { data: atual } = await supabaseAdmin
      .from('oportunidades')
      .select('gcal_event_id, pessoa_nome, tipo, localizacao')
      .eq('id', id)
      .single()

    if (atual?.gcal_event_id) {
      await apagarEvento(atual.gcal_event_id)
    }
    update.gcal_event_id = null

    const novaData = update.follow_up_data as string | null
    if (novaData && atual) {
      const nota = (('follow_up_nota' in update ? update.follow_up_nota : null) as string | null) ?? ''
      const eventId = await criarEventoDia({
        summary: `Oportunidade — ${atual.pessoa_nome}`,
        description: [
          `${getTipo(atual.tipo).label}${atual.localizacao ? ` · ${atual.localizacao}` : ''}`,
          nota ? `\n📝 ${nota}` : '',
          `\nAbrir: https://painel-tematico.vercel.app/admin/oportunidades/${id}`,
        ].filter(Boolean).join('\n'),
        data: novaData,
      })
      update.gcal_event_id = eventId
    }
  }

  const { data, error } = await supabaseAdmin
    .from('oportunidades')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'oportunidades.delete')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }
  const { id } = await params

  const { data: atual } = await supabaseAdmin
    .from('oportunidades')
    .select('gcal_event_id')
    .eq('id', id)
    .single()
  if (atual?.gcal_event_id) await apagarEvento(atual.gcal_event_id)

  // Atividades filhas caem por ON DELETE CASCADE, mas apagamos explicitamente por segurança
  await supabaseAdmin.from('oportunidade_atividades').delete().eq('oportunidade_id', id)
  const { error } = await supabaseAdmin.from('oportunidades').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
