import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

// GET /api/admin/visitas?arquivados=1 — visitas de parceiros com imóvel e mediador
export async function GET(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'leads.view')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const arquivados = new URL(req.url).searchParams.get('arquivados') === '1'

  const { data, error } = await supabaseAdmin
    .from('visitas_parceiros')
    .select('*, imoveis(titulo, tipologia, cidade), parceiros(nome, empresa, ami)')
    .eq('arquivado', arquivados)
    .order('data_visita', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
