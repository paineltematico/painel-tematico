import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

const CAMPOS = ['titulo', 'url', 'projeto', 'thumbnail', 'ordem', 'ativo']

// GET /api/admin/videos-obra — lista completa (inclui vídeos ocultos)
export async function GET() {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'construcao.view')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { data, error } = await supabaseAdmin
    .from('videos_obra')
    .select('*')
    .order('ordem')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'construcao.edit')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await req.json()

  const insert: Record<string, unknown> = {}
  for (const key of CAMPOS) {
    if (key in body) insert[key] = body[key]
  }
  if (!insert.titulo || !insert.url) {
    return NextResponse.json({ error: 'Título e URL obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('videos_obra')
    .insert(insert)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
