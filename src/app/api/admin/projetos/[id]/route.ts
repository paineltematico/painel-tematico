import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

interface Ctx { params: Promise<{ id: string }> }

/** PUT /api/admin/projetos/[id] — atualizar projeto */
export async function PUT(req: Request, { params }: Ctx) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const { error } = await supabaseAdmin()
    .from('projetos')
    .update(body)
    .eq('id', id)

  if (error) {
    console.error('[projetos PUT]', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  return NextResponse.json({ ok: true })
}
