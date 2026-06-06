import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'imoveis.edit')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params
  const { perdida, motivo } = await req.json()

  const { error } = await supabaseAdmin
    .from('imoveis')
    .update({
      angariacao_perdida: perdida,
      angariacao_perdida_em:     perdida ? new Date().toISOString() : null,
      angariacao_perdida_motivo: perdida ? (motivo ?? null) : null,
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
