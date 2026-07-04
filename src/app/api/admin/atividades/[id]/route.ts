import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'
import { podeAcederLead } from '@/lib/crm-server'

const NAO_EDITAVEIS = ['mudanca_estado', 'arquivamento', 'transferencia']

// PATCH /api/admin/atividades/[id] — edita o conteúdo de uma atividade,
// guardando a versão anterior no histórico (coluna versoes)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'leads.edit')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params
  const { conteudo } = await req.json()

  if (typeof conteudo !== 'string' || !conteudo.trim()) {
    return NextResponse.json({ error: 'Conteúdo obrigatório' }, { status: 400 })
  }

  const { data: atual, error: fetchError } = await supabaseAdmin
    .from('lead_atividades')
    .select('lead_id, tipo, conteudo, created_at, updated_at, versoes')
    .eq('id', id)
    .single()

  if (fetchError || !atual) {
    return NextResponse.json({ error: 'Atividade não encontrada' }, { status: 404 })
  }
  if (!(await podeAcederLead(me, atual.lead_id))) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }
  if (NAO_EDITAVEIS.includes(atual.tipo)) {
    return NextResponse.json({ error: 'Esta atividade não é editável' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const versoes = [
    ...(atual.versoes ?? []),
    { conteudo: atual.conteudo ?? '', editado_em: atual.updated_at ?? atual.created_at },
  ]

  const { data, error } = await supabaseAdmin
    .from('lead_atividades')
    .update({ conteudo, updated_at: now, versoes })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
