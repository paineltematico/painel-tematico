import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

const CAMPOS = ['titulo', 'slug', 'resumo', 'conteudo', 'imagem', 'categoria', 'publicado', 'publicado_em']

export async function POST(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'blog.create')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await req.json()

  const insert: Record<string, unknown> = {}
  for (const key of CAMPOS) {
    if (key in body) insert[key] = body[key]
  }
  if (!insert.titulo || !insert.slug) {
    return NextResponse.json({ error: 'Título e slug obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .insert(insert)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
