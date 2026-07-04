import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'
import { podeAcederLead } from '@/lib/crm-server'

// POST /api/admin/leads/[id]/estado — muda o estado do lead e regista a atividade
export async function POST(
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
  const { estado, estado_anterior } = await req.json()

  if (!estado) {
    return NextResponse.json({ error: 'Estado obrigatório' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('contactos_imoveis')
    .update({ estado })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { error: logError } = await supabaseAdmin.from('lead_atividades').insert({
    lead_id: id,
    tipo: 'mudanca_estado',
    estado_anterior: estado_anterior ?? null,
    estado_novo: estado,
  })

  if (logError) return NextResponse.json({ error: logError.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
