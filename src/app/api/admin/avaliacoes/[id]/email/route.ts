import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'
import { sendEmail, emailFollowUp1, emailFollowUp2 } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser()
  if (!me || !canUser(me, 'avaliacoes.view')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params
  const { emailType, email, nome, tipo, cidade, avaliacaoId } = await req.json()

  if (emailType === 'followup1') {
    await sendEmail(
      email,
      'Precisamos de algumas fotos para melhorar a sua avaliação 📸 — Painel Temático',
      emailFollowUp1(nome, tipo ?? 'imóvel', cidade ?? 'Portugal', avaliacaoId)
    )
    await supabaseAdmin.from('avaliacoes_imovel').update({ email_2_sent: true }).eq('id', id)
  } else if (emailType === 'followup2') {
    await sendEmail(
      email,
      'O seu estudo de mercado está quase pronto ✅ — Painel Temático',
      emailFollowUp2(nome, tipo ?? 'imóvel', cidade ?? 'Portugal')
    )
    await supabaseAdmin.from('avaliacoes_imovel').update({ email_3_sent: true }).eq('id', id)
  }

  return NextResponse.json({ ok: true })
}
