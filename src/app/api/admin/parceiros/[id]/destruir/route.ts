import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'parceiros.delete')) {
    return NextResponse.json({ error: 'Apenas o Super Admin ou o Diretor podem eliminar definitivamente.' }, { status: 403 })
  }

  const { id } = await params

  // Apaga as visitas do mediador antes de o remover (chave estrangeira)
  await supabaseAdmin.from('visitas_parceiros').delete().eq('parceiro_id', id)

  const { error } = await supabaseAdmin.from('parceiros').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
