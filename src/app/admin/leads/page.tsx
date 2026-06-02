import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ESTADOS, getPrioridade, formatRelativeDate } from '@/lib/crm'
import { Mail, Phone, Plus, TrendingUp } from 'lucide-react'
import type { LeadEstado } from '@/types/database'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface SearchParams { estado?: string }

async function getLeads(estado?: string) {
  let q = supabase
    .from('contactos_imoveis')
    .select('*')
    .order('updated_at', { ascending: false })
  if (estado) q = q.eq('estado', estado as LeadEstado)
  const { data } = await q
  return data ?? []
}

async function getCounts() {
  const { data } = await supabase
    .from('contactos_imoveis')
    .select('estado')
  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.estado] = (counts[row.estado] ?? 0) + 1
  }
  return counts
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { estado } = await searchParams
  const [leads, counts] = await Promise.all([getLeads(estado), getCounts()])

  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const ganhos = counts['ganho'] ?? 0
  const conversao = total > 0 ? Math.round((ganhos / total) * 100) : 0
  const novos = counts['novo'] ?? 0

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">CRM — Leads</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{total} leads · {conversao}% conversão</p>
        </div>
        <Link
          href="/admin/leads/novo"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Novo Lead
        </Link>
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total leads', value: total, sub: 'todos os tempos' },
          { label: 'Novos', value: novos, sub: 'por contactar', highlight: novos > 0 },
          { label: 'Ganhos', value: ganhos, sub: 'negócios fechados' },
          { label: 'Conversão', value: `${conversao}%`, sub: 'taxa de fecho' },
        ].map((k) => (
          <div key={k.label} className={cn('bg-white rounded-2xl border p-5', k.highlight ? 'border-[#00545F]/40 shadow-sm' : 'border-[#e2e8f0]')}>
            <p className={cn('font-serif font-bold text-3xl', k.highlight ? 'text-[#00545F]' : 'text-[#1F3F44]')}>{k.value}</p>
            <p className="text-[#1F3F44] text-sm font-medium mt-0.5">{k.label}</p>
            <p className="text-[#94a3b8] text-xs">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Pipeline funnel */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[#00545F]" />
          <span className="text-sm font-semibold text-[#1F3F44]">Pipeline</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {ESTADOS.map((e) => {
            const count = counts[e.value] ?? 0
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            const isActive = estado === e.value
            return (
              <Link
                key={e.value}
                href={isActive ? '/admin/leads' : `/admin/leads?estado=${e.value}`}
                className={cn(
                  'flex-1 min-w-[80px] rounded-xl border-2 p-3 text-center transition-all hover:shadow-sm',
                  isActive ? `${e.bg} border-current ${e.color}` : 'border-[#e2e8f0] hover:border-[#94a3b8]'
                )}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className={cn('w-2 h-2 rounded-full', e.dot)} />
                  <span className={cn('text-xs font-semibold', isActive ? e.color : 'text-[#64748b]')}>{e.label}</span>
                </div>
                <p className={cn('font-serif font-bold text-xl', isActive ? e.color : 'text-[#1F3F44]')}>{count}</p>
                <p className="text-[#94a3b8] text-xs">{pct}%</p>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Leads list */}
      {leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-16 text-center">
          <Mail className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
          <p className="font-serif font-semibold text-[#1F3F44] mb-1">
            {estado ? `Sem leads em "${ESTADOS.find(e => e.value === estado)?.label}"` : 'Sem leads ainda'}
          </p>
          <p className="text-[#94a3b8] text-sm">Os contactos do site aparecerão aqui.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leads.map((lead) => {
            const est = ESTADOS.find((e) => e.value === lead.estado) ?? ESTADOS[0]
            const pri = getPrioridade(lead.prioridade)
            return (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl border border-[#e2e8f0] p-4 hover:shadow-md hover:border-[#00545F]/30 transition-all group"
              >
                {/* Priority dot */}
                <div className="flex-shrink-0 w-2 h-10 rounded-full" style={{ background: lead.prioridade === 'alta' ? '#ef4444' : lead.prioridade === 'normal' ? '#f59e0b' : '#10b981' }} />

                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center flex-shrink-0 text-[#1F3F44] font-bold text-sm font-serif">
                  {lead.nome.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#1F3F44] text-sm group-hover:text-[#00545F] transition-colors">{lead.nome}</p>
                    {!lead.lido && (
                      <span className="w-2 h-2 rounded-full bg-[#00545F] flex-shrink-0" title="Não lido" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-[#64748b]">
                      <Mail className="w-3 h-3" />{lead.email}
                    </span>
                    {lead.telefone && (
                      <span className="flex items-center gap-1 text-xs text-[#64748b] hidden sm:flex">
                        <Phone className="w-3 h-3" />{lead.telefone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Property */}
                {lead.imovel_titulo && (
                  <div className="hidden md:block flex-shrink-0 max-w-[180px]">
                    <p className="text-xs text-[#94a3b8] truncate">{lead.imovel_titulo}</p>
                  </div>
                )}

                {/* Estado badge */}
                <div className="flex-shrink-0">
                  <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', est.bg, est.color)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', est.dot)} />
                    {est.label}
                  </span>
                </div>

                {/* Time */}
                <div className="flex-shrink-0 text-xs text-[#94a3b8] hidden lg:block">
                  {formatRelativeDate(lead.updated_at)}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
