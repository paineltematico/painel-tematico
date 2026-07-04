import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

const CAMPOS = ['nome', 'cargo', 'bio', 'foto', 'email', 'telefone', 'linkedin', 'ordem', 'ativo']

// GET /api/admin/equipa — lista completa (inclui membros ocultos)
export async function GET() {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'equipa.view')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { data, error } = await supabaseAdmin
    .from('equipa')
    .select('*')
    .order('ordem')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'equipa.edit')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await req.json()

  const insert: Record<string, unknown> = {}
  for (const key of CAMPOS) {
    if (key in body) insert[key] = body[key]
  }
  if (!insert.nome || !insert.cargo) {
    return NextResponse.json({ error: 'Nome e cargo obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('equipa')
    .insert(insert)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
