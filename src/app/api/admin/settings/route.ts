import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'definicoes.edit')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const settings: Record<string, string> = await request.json()

    // Upsert each key-value pair
    const rows = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert(rows, { onConflict: 'key' })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Settings save error:', err)
    return NextResponse.json({ error: 'Erro ao guardar' }, { status: 500 })
  }
}
