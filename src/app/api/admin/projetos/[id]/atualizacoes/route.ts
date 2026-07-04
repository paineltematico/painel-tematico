import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

const CAMPOS = ['titulo', 'descricao', 'fase', 'percentagem_conclusao', 'data_atualizacao', 'fotos', 'publicado']

// GET /api/admin/projetos/[id]/atualizacoes — atualizações + nome do projeto
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'obra.view')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params
  const [{ data: atualizacoes, error }, { data: projeto }] = await Promise.all([
    supabaseAdmin
      .from('atualizacoes_obra')
      .select('*')
      .eq('projeto_id', id)
      .order('data_atualizacao', { ascending: false }),
    supabaseAdmin.from('projetos').select('nome').eq('id', id).single(),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ atualizacoes: atualizacoes ?? [], projeto })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'obra.edit')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  const insert: Record<string, unknown> = { projeto_id: id }
  for (const key of CAMPOS) {
    if (key in body) insert[key] = body[key]
  }
  if (!insert.titulo) {
    return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('atualizacoes_obra')
    .insert(insert)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
