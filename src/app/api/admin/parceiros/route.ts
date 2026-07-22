import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

// GET /api/admin/parceiros?arquivados=1 — lista de mediadores com as suas visitas
export async function GET(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'leads.view')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const arquivados = new URL(req.url).searchParams.get('arquivados') === '1'

  const { data, error } = await supabaseAdmin
    .from('parceiros')
    .select('*, visitas_parceiros(id)')
    .eq('arquivado', arquivados)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/admin/parceiros — criar mediador manualmente
export async function POST(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'leads.edit')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await req.json()
  const nome = typeof body.nome === 'string' ? body.nome.trim() : ''
  if (!nome) {
    return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('parceiros')
    .insert({
      nome,
      empresa: body.empresa || null,
      ami: body.ami || null,
      email: body.email || null,
      telefone: body.telefone || null,
      notas: null,
      ativo: true,
    })
    .select('*, visitas_parceiros(id)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
