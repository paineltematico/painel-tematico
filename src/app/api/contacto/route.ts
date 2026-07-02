import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import { sendAdminEmail, emailAdminNovoLead } from '@/lib/email'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// POST /api/contacto — formulário público "Pedir informações" (ContactForm)
export async function POST(request: Request) {
  if (!rateLimit(`contacto:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Demasiados pedidos. Tente novamente dentro de alguns minutos.' },
      { status: 429 }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 })
  }

  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

  // Honeypot: humanos nunca preenchem este campo escondido — responder ok sem gravar
  if (str(body.website)) return NextResponse.json({ ok: true })

  const nome = str(body.nome)
  const email = str(body.email).toLowerCase()
  const telefone = str(body.telefone)
  const mensagem = str(body.mensagem)
  const imovelId = str(body.imovel_id)
  const projetoId = str(body.projeto_id)
  const imovelTitulo = str(body.imovel_titulo)

  if (nome.length < 2 || nome.length > 120) {
    return NextResponse.json({ error: 'Nome obrigatório (2 a 120 caracteres).' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ error: 'Email inválido.' }, { status: 400 })
  }
  if (telefone.length > 30 || mensagem.length > 2000 || imovelTitulo.length > 200) {
    return NextResponse.json({ error: 'Campos demasiado longos.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('contactos_imoveis')
    .insert({
      nome,
      email,
      telefone: telefone || null,
      mensagem: mensagem || null,
      imovel_id: UUID_RE.test(imovelId) ? imovelId : null,
      imovel_titulo: imovelTitulo || null,
      projeto_interesse: UUID_RE.test(projetoId) ? projetoId : null,
      lido: false,
      estado: 'novo',
      prioridade: 'normal',
      fonte: 'site',
      temperatura: 'morno',
      score: 20,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[contacto] insert error:', error)
    return NextResponse.json({ error: 'Erro ao enviar mensagem.' }, { status: 500 })
  }

  await sendAdminEmail(
    `📩 Novo contacto — ${nome}${imovelTitulo ? ` · ${imovelTitulo}` : ''}`,
    emailAdminNovoLead({
      Nome: nome,
      Email: email,
      Telefone: telefone || '—',
      Interesse: imovelTitulo || '—',
      Mensagem: mensagem || '—',
    })
  )

  return NextResponse.json({ ok: true, id: data.id })
}
