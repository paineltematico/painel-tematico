import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'
import { Home, Clock, Mail, Phone, MapPin, Ruler, Calendar, BedDouble, AlertTriangle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import AvaliacaoActions from '@/components/admin/AvaliacaoActions'

export const dynamic = 'force-dynamic'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  novo:        { label: 'Novo',        color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',    dot: 'bg-blue-500' },
  contactado:  { label: 'Contactado',  color: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200', dot: 'bg-violet-500' },
  em_analise:  { label: 'Em análise',  color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',   dot: 'bg-amber-500' },
  concluido:   { label: 'Concluído',   color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200',dot: 'bg-emerald-500' },
}

const URGENCIA_MAP: Record<string, { label: string; emoji: string }> = {
  sem_pressa:  { label: 'Sem pressa',  emoji: '🌿' },
  seis_meses:  { label: '6 meses',     emoji: '📅' },
  tres_meses:  { label: '3 meses',     emoji: '⏳' },
  urgente:     { label: 'Urgente',     emoji: '🔥' },
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'Hoje'
  if (d === 1) return 'Ontem'
  return `Há ${d} dias`
}

export default async function AvaliacoesAdminPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/admin/login')
  if (!canUser(user, 'avaliacoes.view')) redirect('/admin/dashboard')

  const { data: avaliacoes } = await supabaseAdmin
    .from('avaliacoes_imovel')
    .select('*')
    .order('created_at', { ascending: false })

  const all = avaliacoes ?? []
  const novos = all.filter(a => a.status === 'novo').length
  const emAnalise = all.filter(a => a.status === 'em_analise').length
  const concluidos = all.filter(a => a.status === 'concluido').length

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Avaliações</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Pedidos de avaliação gratuita do site</p>
        </div>
        <div className="flex gap-3 text-sm">
          {[
            { label: 'Novos', value: novos, color: 'text-blue-600 bg-blue-50 border-blue-200' },
            { label: 'Em análise', value: emAnalise, color: 'text-amber-600 bg-amber-50 border-amber-200' },
            { label: 'Concluídos', value: concluidos, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
          ].map(k => (
            <div key={k.label} className={cn('px-3 py-1.5 rounded-xl border font-semibold', k.color)}>
              {k.value} {k.label}
            </div>
          ))}
        </div>
      </div>

      {all.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#e2e8f0]">
          <Home className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
          <p className="font-semibold text-[#1F3F44]">Ainda sem pedidos de avaliação</p>
          <p className="text-[#94a3b8] text-sm mt-1">Os pedidos do site aparecem aqui automaticamente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {all.map(a => {
            const st = STATUS_MAP[a.status] ?? STATUS_MAP.novo
            const urg = a.urgencia ? URGENCIA_MAP[a.urgencia] : null
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-[#e2e8f0] p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4 flex-wrap">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-[#1F3F44] flex items-center justify-center text-white font-serif font-bold text-lg flex-shrink-0">
                    {a.nome?.charAt(0).toUpperCase() ?? '?'}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="font-semibold text-[#1F3F44]">{a.nome}</h2>
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border', st.bg, st.color)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', st.dot)} />{st.label}
                      </span>
                      {urg && (
                        <span className="text-xs font-medium text-[#475569]">{urg.emoji} {urg.label}</span>
                      )}
                      {a.status === 'novo' && !a.email_2_sent && (
                        <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Novo ·
                        </span>
                      )}
                    </div>

                    {/* Contact */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#64748b]">
                      <a href={`mailto:${a.email}`} className="flex items-center gap-1 hover:text-[#00545F]">
                        <Mail className="w-3.5 h-3.5" />{a.email}
                      </a>
                      {a.telefone && (
                        <a href={`tel:${a.telefone}`} className="flex items-center gap-1 hover:text-[#00545F]">
                          <Phone className="w-3.5 h-3.5" />{a.telefone}
                        </a>
                      )}
                      <span className="flex items-center gap-1 text-[#94a3b8]">
                        <Clock className="w-3.5 h-3.5" />{timeAgo(a.created_at)}
                      </span>
                    </div>

                    {/* Property details */}
                    <div className="flex flex-wrap gap-3 mt-2">
                      {a.tipo && (
                        <span className="flex items-center gap-1 text-xs text-[#475569] bg-[#f8fafc] px-2 py-1 rounded-lg border border-[#e2e8f0]">
                          <Home className="w-3 h-3" />{a.tipo}
                        </span>
                      )}
                      {a.cidade && (
                        <span className="flex items-center gap-1 text-xs text-[#475569] bg-[#f8fafc] px-2 py-1 rounded-lg border border-[#e2e8f0]">
                          <MapPin className="w-3 h-3" />{a.cidade}
                        </span>
                      )}
                      {a.area_m2 && (
                        <span className="flex items-center gap-1 text-xs text-[#475569] bg-[#f8fafc] px-2 py-1 rounded-lg border border-[#e2e8f0]">
                          <Ruler className="w-3 h-3" />{a.area_m2} m²
                        </span>
                      )}
                      {a.quartos != null && (
                        <span className="flex items-center gap-1 text-xs text-[#475569] bg-[#f8fafc] px-2 py-1 rounded-lg border border-[#e2e8f0]">
                          <BedDouble className="w-3 h-3" />T{a.quartos}
                        </span>
                      )}
                      {a.valor_esperado && (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                          ~{Number(a.valor_esperado).toLocaleString('pt-PT')} €
                        </span>
                      )}
                    </div>

                    {/* Email sequence status */}
                    <div className="flex gap-2 mt-2">
                      {[
                        { sent: true,          label: 'Confirmação' },
                        { sent: a.email_2_sent, label: 'Pedido fotos' },
                        { sent: a.email_3_sent, label: 'Estudo pronto' },
                      ].map((e, i) => (
                        <span key={i} className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                          e.sent
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-[#f1f5f9] text-[#94a3b8]'
                        )}>
                          {e.sent ? '✓' : '·'} {e.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <AvaliacaoActions id={a.id} status={a.status} email={a.email} nome={a.nome} tipo={a.tipo} cidade={a.cidade} avaliacaoId={a.id} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
