import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendEmail, emailLembreteOportunidade } from '@/lib/email'
import { getTipo } from '@/lib/oportunidades'

// Chamado diariamente pela Vercel Cron — envia lembretes de follow-up.
// Aceita o header custom `x-cron-secret` OU o `Authorization: Bearer` da Vercel.
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  const authBearer = req.headers.get('authorization')?.replace('Bearer ', '')
  const ok = secret === process.env.CRON_SECRET || authBearer === process.env.CRON_SECRET
  if (!ok && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const hoje = new Date().toISOString().slice(0, 10)

  const { data: pendentes, error } = await supabaseAdmin
    .from('oportunidades')
    .select('id, pessoa_nome, tipo, localizacao, follow_up_nota, criado_por')
    .lte('follow_up_data', hoje)
    .eq('follow_up_email_sent', false)
    .in('estado', ['nova', 'em_analise'])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let enviados = 0
  for (const op of pendentes ?? []) {
    // Email de quem criou a oportunidade
    let destinatario: string | null = null
    if (op.criado_por) {
      const { data: user } = await supabaseAdmin
        .from('admin_users')
        .select('email')
        .eq('id', op.criado_por)
        .single()
      destinatario = user?.email ?? null
    }
    destinatario = destinatario ?? process.env.RESEND_TO_ADMIN ?? null
    if (!destinatario) continue

    const html = emailLembreteOportunidade({
      pessoaNome: op.pessoa_nome,
      localizacao: op.localizacao ?? '',
      tipo: getTipo(op.tipo).label,
      nota: op.follow_up_nota ?? '',
      oportunidadeId: op.id,
    })
    const res = await sendEmail(destinatario, `⏰ Lembrete: ${op.pessoa_nome}`, html)
    if (res.ok) {
      await supabaseAdmin
        .from('oportunidades')
        .update({ follow_up_email_sent: true })
        .eq('id', op.id)
      enviados++
    }
  }

  return NextResponse.json({ ok: true, verificados: pendentes?.length ?? 0, enviados })
}
