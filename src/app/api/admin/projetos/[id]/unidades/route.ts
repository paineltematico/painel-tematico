import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

const CAMPOS = [
  'referencia', 'tipologia', 'area_m2', 'preco', 'estado', 'piso', 'descricao',
  'planta', 'ordem', 'area_lote', 'area_exterior', 'percentagem_conclusao',
]

// GET /api/admin/projetos/[id]/unidades — unidades + nome/tipo do projeto
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'unidades.view')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params
  const [{ data: unidades, error }, { data: projeto }] = await Promise.all([
    supabaseAdmin.from('unidades').select('*').eq('projeto_id', id).order('ordem'),
    supabaseAdmin.from('projetos').select('nome, tipo_projeto').eq('id', id).single(),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ unidades: unidades ?? [], projeto })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'unidades.edit')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  const insert: Record<string, unknown> = { projeto_id: id }
  for (const key of CAMPOS) {
    if (key in body) insert[key] = body[key]
  }
  if (!insert.referencia) {
    return NextResponse.json({ error: 'Referência obrigatória' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('unidades')
    .insert(insert)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
