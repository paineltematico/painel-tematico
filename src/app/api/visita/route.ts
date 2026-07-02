import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, clientIp } from '@/lib/rate-limit'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  if (!rateLimit(`visita:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Demasiados pedidos. Tente novamente dentro de alguns minutos.' }, { status: 429 })
  }

  const body = await request.json()
  const { nome, email, telefone, imovel_id, imovel_outro, data_visita, hora_visita, notas } = body

  if (!nome || !email || !telefone || !data_visita || !hora_visita) {
    return NextResponse.json({ error: 'Campos obrigatórios em falta.' }, { status: 400 })
  }

  // Registar visita (sem parceiro — cliente direto)
  const { data: visita, error } = await supabaseAdmin
    .from('visitas_parceiros')
    .insert({
      parceiro_id:   null,
      imovel_id:     imovel_id || null,
      imovel_outro:  imovel_outro || null,
      cliente_nome:  nome,
      cliente_email: email,
      cliente_telef: telefone,
      data_visita,
      hora_visita,
      notas: notas || null,
      estado: 'pendente',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Resolver nome do imóvel para o calendário
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

  // Google Calendar
  const gcalId  = process.env.GOOGLE_CALENDAR_ID
  const gcalKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY

  if (gcalId && gcalKey) {
    try {
      const eventId = await criarEventoCalendario({
        cliente: { nome, email, telefone },
        imovel:  imovelNome,
        data:    data_visita,
        hora:    hora_visita,
        notas,
      })
      if (eventId) {
        await supabaseAdmin.from('visitas_parceiros').update({ gcal_event_id: eventId }).eq('id', visita.id)
      }
    } catch (e: unknown) {
      console.error('[GCal] ERRO visita cliente:', e instanceof Error ? e.message : String(e))
    }
  }

  return NextResponse.json({ ok: true, id: visita.id })
}

async function criarEventoCalendario(data: {
  cliente:  { nome: string; email: string; telefone: string }
  imovel:   string
  data:     string
  hora:     string
  notas?:   string
}) {
  const { google } = await import('googleapis')
  const keyJson = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!)

  const auth = new google.auth.JWT({
    email:  keyJson.client_email,
    key:    keyJson.private_key,
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
    `👤 Cliente: ${data.cliente.nome}`,
    `✉️  ${data.cliente.email}`,
    `📞 ${data.cliente.telefone}`,
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
