import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.json()

  const {
    nome, empresa, ami, email, telefone,
    imovel_id, imovel_outro,
    cliente_nome, cliente_email, cliente_telef,
    data_visita, hora_visita, notas,
  } = body

  // Validação mínima
  if (!nome || !ami || !data_visita || !hora_visita || !cliente_nome) {
    return NextResponse.json({ error: 'Campos obrigatórios em falta.' }, { status: 400 })
  }

  // Upsert parceiro por AMI
  let parceiro_id: string | null = null
  const { data: existente } = await supabaseAdmin
    .from('parceiros')
    .select('id')
    .eq('ami', ami)
    .single()

  if (existente) {
    parceiro_id = existente.id
    // Atualizar dados se necessário
    await supabaseAdmin.from('parceiros').update({ nome, empresa, email, telefone }).eq('id', parceiro_id)
  } else {
    const { data: novo } = await supabaseAdmin
      .from('parceiros')
      .insert({ nome, empresa, email, telefone, ami })
      .select('id')
      .single()
    parceiro_id = novo?.id ?? null
  }

  // Registar visita
  const { data: visita, error } = await supabaseAdmin
    .from('visitas_parceiros')
    .insert({
      parceiro_id,
      imovel_id:    imovel_id || null,
      imovel_outro: imovel_outro || null,
      cliente_nome,
      cliente_email: cliente_email || null,
      cliente_telef: cliente_telef || null,
      data_visita,
      hora_visita,
      notas:  notas || null,
      estado: 'pendente',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Resolver nome do imóvel
  let imovelNome = imovel_outro || 'Imóvel não especificado'
  if (imovel_id) {
    const { data: imovelData } = await supabaseAdmin
      .from('imoveis')
      .select('titulo, tipologia, cidade')
      .eq('id', imovel_id)
      .single()
    if (imovelData) {
      imovelNome = [imovelData.titulo, imovelData.tipologia, imovelData.cidade]
        .filter(Boolean).join(' · ')
    }
  }

  // Google Calendar — só se estiver configurado
  const gcalId = process.env.GOOGLE_CALENDAR_ID
  const gcalKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY

  if (gcalId && gcalKey) {
    try {
      console.log('[GCal] A criar evento para', data_visita, hora_visita)
      const eventId = await criarEventoCalendario({
        parceiro: { nome, empresa, ami, email },
        cliente:  { nome: cliente_nome, email: cliente_email, tel: cliente_telef },
        imovel:   imovelNome,
        data:     data_visita,
        hora:     hora_visita,
        notas,
      })
      console.log('[GCal] Evento criado:', eventId)
      if (eventId) {
        await supabaseAdmin.from('visitas_parceiros').update({ gcal_event_id: eventId }).eq('id', visita.id)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[GCal] ERRO:', msg)
      // Não falha — a visita fica registada mesmo sem o calendário
    }
  } else {
    console.warn('[GCal] Variáveis não configuradas — gcalId:', !!gcalId, 'gcalKey:', !!gcalKey)
  }

  return NextResponse.json({ ok: true, id: visita.id })
}

async function criarEventoCalendario(data: {
  parceiro: { nome: string; empresa?: string; ami: string; email?: string }
  cliente:  { nome: string; email?: string; tel?: string }
  imovel:   string
  data:     string
  hora:     string
  notas?:   string
}) {
  const { google } = await import('googleapis')
  const keyJson = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!)

  const auth = new google.auth.JWT({
    email: keyJson.client_email,
    key:   keyJson.private_key,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })

  const calendar = google.calendar({ version: 'v3', auth })

  const startTime = `${data.data}T${data.hora}:00`
  const [h, m]    = data.hora.split(':').map(Number)
  const endHour   = String(h + 1).padStart(2, '0')
  const endTime   = `${data.data}T${endHour}:${String(m).padStart(2, '0')}:00`

  const description = [
    `🏠 Imóvel: ${data.imovel}`,
    ``,
    `👤 Agente: ${data.parceiro.nome}${data.parceiro.empresa ? ` — ${data.parceiro.empresa}` : ''}`,
    `📋 AMI: ${data.parceiro.ami}`,
    data.parceiro.email ? `✉️  ${data.parceiro.email}` : '',
    ``,
    `👥 Cliente: ${data.cliente.nome}`,
    data.cliente.email ? `✉️  ${data.cliente.email}` : '',
    data.cliente.tel   ? `📞 ${data.cliente.tel}` : '',
    data.notas ? `\n📝 ${data.notas}` : '',
  ].filter(Boolean).join('\n')

  const res = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    requestBody: {
      summary:     `Visita — ${data.imovel}`,
      description,
      start: { dateTime: startTime, timeZone: 'Europe/Lisbon' },
      end:   { dateTime: endTime,   timeZone: 'Europe/Lisbon' },
    },
  })

  return res.data.id ?? null
}
