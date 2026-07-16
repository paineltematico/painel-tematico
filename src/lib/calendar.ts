// Server-only — integração Google Calendar (service account JWT).
// Reutiliza o padrão já usado em src/app/api/agendar-visita/route.ts.

function isConfigured() {
  return !!process.env.GOOGLE_CALENDAR_ID && !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY
}

async function getCalendar() {
  const { google } = await import('googleapis')
  const keyJson = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!)
  const auth = new google.auth.JWT({
    email: keyJson.client_email,
    key:   keyJson.private_key,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })
  return google.calendar({ version: 'v3', auth })
}

/**
 * Cria um evento all-day no dia indicado. Devolve o eventId ou null
 * (se o calendário não estiver configurado ou em caso de erro — nunca lança).
 */
export async function criarEventoDia(opts: {
  summary: string
  description: string
  data: string // YYYY-MM-DD
}): Promise<string | null> {
  if (!isConfigured()) {
    console.warn('[GCal] Variáveis não configuradas — evento ignorado')
    return null
  }
  try {
    const calendar = await getCalendar()
    // Evento all-day: end.date é exclusivo, por isso +1 dia.
    const start = opts.data
    const end = new Date(new Date(opts.data + 'T00:00:00').getTime() + 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10)
    const res = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      requestBody: {
        summary: opts.summary,
        description: opts.description,
        start: { date: start },
        end:   { date: end },
      },
    })
    return res.data.id ?? null
  } catch (e) {
    console.error('[GCal] Erro ao criar evento:', e instanceof Error ? e.message : String(e))
    return null
  }
}

/** Apaga um evento do calendário. Silencioso em caso de erro. */
export async function apagarEvento(eventId: string): Promise<void> {
  if (!isConfigured() || !eventId) return
  try {
    const calendar = await getCalendar()
    await calendar.events.delete({ calendarId: process.env.GOOGLE_CALENDAR_ID!, eventId })
  } catch (e) {
    console.error('[GCal] Erro ao apagar evento:', e instanceof Error ? e.message : String(e))
  }
}
