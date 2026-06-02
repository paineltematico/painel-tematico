import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  // Verify admin session
  const session = request.cookies.get('admin_session')?.value
  if (session !== 'authenticated') {
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

    const { error } = await supabase
      .from('site_settings')
      .upsert(rows, { onConflict: 'key' })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Settings save error:', err)
    return NextResponse.json({ error: 'Erro ao guardar' }, { status: 500 })
  }
}
