import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

/** PATCH /api/admin/content/record
 *  Body: { table: string, id: string, column: string, value: string }
 *  Updates a single column on any whitelisted table. Requires admin auth.
 */

// Whitelist — only allow updating specific columns to prevent arbitrary DB writes
const ALLOWED: Record<string, string[]> = {
  equipa:   ['foto', 'nome', 'cargo', 'bio'],
  projetos: ['imagem', 'nome', 'subtitulo', 'descricao'],
  imoveis:  ['descricao'],
  artigos:  ['imagem', 'titulo', 'resumo'],
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json() as {
    table?: string
    id?: string
    column?: string
    value?: string
  }
  const { table, id, column, value } = body

  if (!table || !id || !column || typeof value !== 'string') {
    return NextResponse.json({ error: 'table, id, column e value são obrigatórios' }, { status: 400 })
  }

  if (!ALLOWED[table]?.includes(column)) {
    return NextResponse.json({ error: `Edição de ${table}.${column} não permitida` }, { status: 403 })
  }

  const { error } = await supabaseAdmin()
    .from(table)
    .update({ [column]: value })
    .eq('id', id)

  if (error) {
    console.error('[content/record PATCH]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
