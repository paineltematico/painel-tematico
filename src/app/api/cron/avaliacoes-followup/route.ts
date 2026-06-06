import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendEmail, emailFollowUp1, emailFollowUp2 } from '@/lib/email'

// Called by Vercel Cron daily — sends follow-up emails at day 1 and day 3
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const day1Start = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() // >1 day ago
  const day1End   = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString() // <2 days ago
  const day3Start = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()
  const day3End   = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()

  // Email 2 (day 1): ask for photos
  const { data: toEmail2 } = await supabaseAdmin
    .from('avaliacoes_imovel')
    .select('*')
    .eq('email_2_sent', false)
    .neq('status', 'concluido')
    .gte('created_at', day1Start)
    .lte('created_at', day1End)

  for (const a of toEmail2 ?? []) {
    await sendEmail(
      a.email,
      'Precisamos de algumas fotos para melhorar a sua avaliação 📸 — Painel Temático',
      emailFollowUp1(a.nome, a.tipo ?? 'imóvel', a.cidade ?? 'Portugal', a.id)
    )
    await supabaseAdmin.from('avaliacoes_imovel').update({ email_2_sent: true }).eq('id', a.id)
  }

  // Email 3 (day 3): study almost ready
  const { data: toEmail3 } = await supabaseAdmin
    .from('avaliacoes_imovel')
    .select('*')
    .eq('email_3_sent', false)
    .neq('status', 'concluido')
    .gte('created_at', day3Start)
    .lte('created_at', day3End)

  for (const a of toEmail3 ?? []) {
    await sendEmail(
      a.email,
      'O seu estudo de mercado está quase pronto ✅ — Painel Temático',
      emailFollowUp2(a.nome, a.tipo ?? 'imóvel', a.cidade ?? 'Portugal')
    )
    await supabaseAdmin.from('avaliacoes_imovel').update({ email_3_sent: true }).eq('id', a.id)
  }

  return NextResponse.json({
    ok: true,
    email2_sent: (toEmail2 ?? []).length,
    email3_sent: (toEmail3 ?? []).length,
  })
}
