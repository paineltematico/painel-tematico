// Server-only — usa o service role client
import { supabaseAdmin } from './supabase-admin'
import { canUser } from './permissions'
import type { SessionPayload } from './auth'

/**
 * Roles sem `leads.view_all` (ex: comercial) só podem aceder a leads
 * onde são responsáveis ou criadores — mesma regra da listagem em
 * src/app/admin/leads/page.tsx, verificada server-side.
 */
export async function podeAcederLead(me: SessionPayload, leadId: string): Promise<boolean> {
  if (canUser(me, 'leads.view_all')) return true
  if (!me.id || me.id === 'bootstrap') return false

  const { data } = await supabaseAdmin
    .from('contactos_imoveis')
    .select('responsavel_id, criado_por')
    .eq('id', leadId)
    .single()

  if (!data) return false
  return data.responsavel_id === me.id || data.criado_por === me.id
}
