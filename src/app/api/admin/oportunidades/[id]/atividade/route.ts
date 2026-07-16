import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

// POST /api/admin/oportunidades/[id]/atividade — adiciona uma nota à timeline
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'oportunidades.edit')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }
  const { id } = await params
  const { tipo, conteudo } = await req.json()

  if (!conteudo?.trim()) {
    return NextResponse.json({ error: 'Conteúdo obrigatório' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('oportunidade_atividades')
    .insert({ oportunidade_id: id, tipo: tipo ?? 'nota', conteudo: conteudo.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
