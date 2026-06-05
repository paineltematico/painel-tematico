import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || me.role !== 'super_admin') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params

  // Apagar atividades primeiro (FK)
  await supabaseAdmin.from('lead_atividades').delete().eq('lead_id', id)

  // Apagar lead permanentemente
  const { error } = await supabaseAdmin
    .from('contactos_imoveis')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
