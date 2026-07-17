import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

export async function POST(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'oportunidades.create')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await req.json()

  if (!body.pessoa_nome?.trim()) {
    return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('oportunidades')
    .insert({
      pessoa_nome:      body.pessoa_nome.trim(),
      pessoa_email:     body.pessoa_email || null,
      pessoa_telefone:  body.pessoa_telefone || null,
      tipo:             body.tipo ?? 'venda',
      localizacao:      body.localizacao || null,
      morada:           body.morada || null,
      cidade:           body.cidade || null,
      codigo_postal:    body.codigo_postal || null,
      mapa_url:         body.mapa_url || null,
      tipologia:        body.tipologia || null,
      area_m2:          body.area_m2 ?? null,
      preco_esperado_min: body.preco_esperado_min ?? null,
      preco_esperado_max: body.preco_esperado_max ?? null,
      descricao:        body.descricao || null,
      notas:            body.notas || null,
      estado:           'nova',
      // O login master (bootstrap) não tem UUID — guardar null nesse caso
      criado_por:       me.id === 'bootstrap' ? null : me.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
