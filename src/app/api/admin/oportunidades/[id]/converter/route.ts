import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'
import { isImagem, totalEstimativa, moradaCompleta } from '@/lib/oportunidades'

const TIPOLOGIAS_VALIDAS = ['T0', 'T1', 'T2', 'T3', 'T4', 'T4+']

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

// POST /api/admin/oportunidades/[id]/converter  body: { destino: 'lead' | 'imovel' }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'oportunidades.edit')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }
  const { id } = await params
  const { destino } = await req.json()
  if (destino !== 'lead' && destino !== 'imovel') {
    return NextResponse.json({ error: 'Destino inválido' }, { status: 400 })
  }
  // O login master (bootstrap) não tem UUID — guardar null nesse caso
  const meId = me.id === 'bootstrap' ? null : me.id

  const { data: op, error: opErr } = await supabaseAdmin
    .from('oportunidades')
    .select('*')
    .eq('id', id)
    .single()
  if (opErr || !op) return NextResponse.json({ error: 'Oportunidade não encontrada' }, { status: 404 })
  if (op.convertido_id) {
    return NextResponse.json({ error: 'Esta oportunidade já foi convertida.' }, { status: 409 })
  }

  let novoId: string
  let redirect: string

  if (destino === 'lead') {
    if (!canUser(me, 'leads.create')) {
      return NextResponse.json({ error: 'Sem permissão para criar leads' }, { status: 403 })
    }
    const notas = [
      op.notas,
      op.descricao,
      op.follow_up_nota ? `Follow-up: ${op.follow_up_nota}` : '',
      op.estimativa?.length ? `\nEstimativa: ${totalEstimativa(op.estimativa)} €` : '',
    ].filter(Boolean).join('\n')

    const { data: lead, error } = await supabaseAdmin
      .from('contactos_imoveis')
      .insert({
        nome: op.pessoa_nome,
        email: op.pessoa_email ?? '',
        telefone: op.pessoa_telefone,
        mensagem: op.descricao,
        notas: notas || null,
        imovel_titulo: moradaCompleta(op) !== '—' ? `${moradaCompleta(op)}${op.tipologia ? ` · ${op.tipologia}` : ''}` : null,
        fonte: 'oportunidade',
        estado: 'novo',
        temperatura: 'frio',
        score: 0,
        lido: true,
        criado_por: meId,
        responsavel_id: meId,
      })
      .select('id')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    novoId = lead.id
    redirect = `/admin/leads/${lead.id}`
  } else {
    if (!canUser(me, 'imoveis.create')) {
      return NextResponse.json({ error: 'Sem permissão para criar imóveis' }, { status: 403 })
    }
    const tipologia = op.tipologia && TIPOLOGIAS_VALIDAS.includes(op.tipologia) ? op.tipologia : null
    const zona = op.localizacao ?? op.cidade ?? op.morada
    const titulo = [op.tipologia, zona].filter(Boolean).join(' — ') || op.pessoa_nome
    // Fotos do campo próprio + imagens que tenham ficado nos documentos
    const fotos = [...(op.fotos ?? []), ...(op.documentos ?? []).filter(isImagem)]
    // Preço sugerido: total da estimativa, senão o intervalo esperado
    const totalEst = totalEstimativa(op.estimativa)
    const preco = totalEst > 0 ? totalEst : (op.preco_esperado_max ?? op.preco_esperado_min ?? null)

    const { data: imovel, error } = await supabaseAdmin
      .from('imoveis')
      .insert({
        titulo,
        slug: `${slugify(titulo)}-${Date.now().toString(36)}`,
        tipo: op.tipo === 'arrendamento' ? 'Arrendamento' : 'Venda',
        tipologia,
        preco,
        area_m2: op.area_m2,
        localizacao: [op.morada, op.localizacao].filter(Boolean).join(', ') || null,
        cidade: op.cidade ?? op.localizacao,
        descricao: op.descricao,
        fotos,
        plantas: [],
        destaque: false,
        disponivel: false, // rascunho — não publicado até revisão
      })
      .select('id')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    novoId = imovel.id
    redirect = `/admin/imoveis/${imovel.id}`
  }

  // Marca a oportunidade como convertida + regista atividade
  await supabaseAdmin
    .from('oportunidades')
    .update({ estado: 'convertida', convertido_tipo: destino, convertido_id: novoId })
    .eq('id', id)

  await supabaseAdmin.from('oportunidade_atividades').insert({
    oportunidade_id: id,
    tipo: 'mudanca_estado',
    estado_novo: 'convertida',
    conteudo: destino === 'lead' ? 'Convertida em Lead' : 'Convertida em Imóvel',
  })

  return NextResponse.json({ ok: true, id: novoId, redirect })
}
