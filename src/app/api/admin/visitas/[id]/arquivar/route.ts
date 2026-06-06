import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'parceiros.archive')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params
  const { arquivado } = await req.json()
  const arquivar = arquivado !== false
  const arquivado_por = me.id && me.id !== 'bootstrap' ? me.id : null

  const { error } = await supabaseAdmin
    .from('visitas_parceiros')
    .update({
      arquivado: arquivar,
      arquivado_em: arquivar ? new Date().toISOString() : null,
      arquivado_por: arquivar ? arquivado_por : null,
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
