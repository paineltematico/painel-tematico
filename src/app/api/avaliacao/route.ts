import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  sendEmail, sendAdminEmail,
  emailConfirmacao, emailAdminNovaAvaliacao
} from '@/lib/email'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    // Step 1
    tipo, morada, cidade, area_m2, ano_construcao,
    // Step 2
    estado_geral, quartos, casas_banho, garagem, jardim, outras_caracteristicas,
    // Step 3
    motivo_venda, valor_esperado, urgencia, tem_imobiliaria,
    // Step 4
    nome, email, telefone, horario_contacto,
  } = body

  if (!nome || !email) {
    return NextResponse.json({ error: 'Nome e email obrigatórios' }, { status: 400 })
  }

  // Save to DB
  const { data, error } = await supabaseAdmin
    .from('avaliacoes_imovel')
    .insert({
      tipo, morada, cidade, area_m2, ano_construcao,
      estado_geral, quartos, casas_banho, garagem, jardim, outras_caracteristicas,
      motivo_venda, valor_esperado, urgencia, tem_imobiliaria,
      nome, email, telefone, horario_contacto,
      status: 'novo',
    })
    .select()
    .single()

  if (error) {
    console.error('[avaliacao] insert error:', error)
    return NextResponse.json({ error: 'Erro ao guardar pedido' }, { status: 500 })
  }

  // Also create a lead in CRM
  await supabaseAdmin.from('contactos_imoveis').insert({
    nome,
    email,
    telefone: telefone ?? null,
    mensagem: `Pedido de avaliação: ${tipo ?? '—'} em ${cidade ?? '—'}, ${area_m2 ? area_m2 + 'm²' : '—'}. Urgência: ${urgencia ?? '—'}.`,
    fonte: 'site',
    estado: 'novo',
    prioridade: urgencia === 'urgente' ? 'alta' : urgencia === 'tres_meses' ? 'alta' : 'normal',
    temperatura: urgencia === 'urgente' ? 'muito_quente' : urgencia === 'tres_meses' ? 'quente' : 'morno',
    lido: false,
  })

  // Email 1: Confirmação ao utilizador
  await sendEmail(
    email,
    'Recebemos o seu pedido de avaliação — Painel Temático',
    emailConfirmacao(nome, tipo ?? 'imóvel', cidade ?? 'Portugal')
  )

  // Email admin notification
  await sendAdminEmail(
    `🏠 Nova avaliação — ${nome} · ${tipo ?? '?'} em ${cidade ?? '?'}`,
    emailAdminNovaAvaliacao({
      Nome: nome,
      Email: email,
      Telefone: telefone ?? '—',
      Tipo: tipo ?? '—',
      Morada: morada ?? '—',
      Cidade: cidade ?? '—',
      'Área (m²)': area_m2 ?? '—',
      'Ano construção': ano_construcao ?? '—',
      'Estado geral': estado_geral ?? '—',
      Quartos: quartos ?? '—',
      Urgência: urgencia ?? '—',
      'Valor esperado': valor_esperado ? `${Number(valor_esperado).toLocaleString('pt-PT')} €` : '—',
      'Tem imobiliária': tem_imobiliaria ? 'Sim' : 'Não',
      'Horário contacto': horario_contacto ?? '—',
    })
  )

  return NextResponse.json({ ok: true, id: data.id })
}
