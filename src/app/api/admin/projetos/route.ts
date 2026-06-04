import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

/** POST /api/admin/projetos — criar projeto */
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { error, data } = await supabaseAdmin()
    .from('projetos')
    .insert(body)
    .select()
    .single()

  if (error) {
    console.error('[projetos POST]', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  return NextResponse.json(data)
}
