import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'leads.edit')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params
  const { tipo, conteudo } = await req.json()

  if (!conteudo?.trim()) {
    return NextResponse.json({ error: 'Conteúdo obrigatório' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('lead_atividades')
    .insert({ lead_id: id, tipo, conteudo: conteudo.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Mark lead as read
  await supabaseAdmin
    .from('contactos_imoveis')
    .update({ lido: true })
    .eq('id', id)

  return NextResponse.json(data)
}
