import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || me.role !== 'super_admin') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params

  const { error } = await supabaseAdmin
    .from('contactos_imoveis')
    .update({
      arquivado: false,
      arquivado_em: null,
      arquivado_por: null,
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Registar no histórico
  await supabaseAdmin.from('lead_atividades').insert({
    lead_id: id,
    tipo: 'arquivamento',
    conteudo: `Lead restaurado por ${me.nome}`,
    created_at: new Date().toISOString(),
  })

  return NextResponse.json({ ok: true })
}
