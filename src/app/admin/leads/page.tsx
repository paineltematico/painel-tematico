import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'
import { ESTADOS, formatRelativeDate } from '@/lib/crm'
import { Mail, Phone, Plus, TrendingUp, Archive, UserCircle2, Users as UsersIcon, Inbox } from 'lucide-react'
import type { LeadEstado } from '@/types/database'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface SearchParams { estado?: string; vista?: string }

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const me = await getCurrentUser()
  if (!me) redirect('/admin/login')

  const { estado, vista } = await searchParams
  const canViewAll    = canUser(me, 'leads.view_all')
  const canComerciais = canUser(me, 'leads.comerciais')
  const isSuperAdmin  = me.role === 'super_admin'
  const verArquivados = isSuperAdmin && vista === 'arquivados'

  // ── Lista (respeita visibilidade) ──
  let listQ = supabaseAdmin
    .from('contactos_imoveis')
    .select('*')
    .eq('arquivado', verArquivados)
    .order('updated_at', { ascending: false })
  if (!canViewAll) listQ = listQ.or(`responsavel_id.eq.${me.id},criado_por.eq.${me.id}`)
  if (estado) listQ = listQ.eq('estado', estado as LeadEstado)
  const { data: leadsData } = await listQ
  const leads = leadsData ?? []

  // ── Contagens (não-arquivados, mesma visibilidade) ──
  let countQ = supabaseAdmin
    .from('contactos_imoveis')
    .select('estado')
    .eq('arquivado', false)
  if (!canViewAll) countQ = countQ.or(`responsavel_id.eq.${me.id},criado_por.eq.${me.id}`)
  const { data: countRows } = await countQ
  const counts: Record<string, number> = {}
  for (const row of countRows ?? []) counts[row.estado] = (counts[row.estado] ?? 0) + 1

  // ── Contagem de arquivados (só super admin) ──
  let arquivadosCount = 0
  if (isSuperAdmin) {
    const { count } = await supabaseAdmin
      .from('contactos_imoveis')
      .select('*', { count: 'exact', head: true })
      .eq('arquivado', true)
    arquivadosCount = count ?? 0
  }

  // ── Mapa de responsáveis (nomes) ──
  const { data: users } = await supabaseAdmin.from('admin_users').select('id, nome')
  const userMap = new Map((users ?? []).map((u) => [u.id, u.nome as string]))

  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const ganhos = counts['ganho'] ?? 0
  const conversao = total > 0 ? Math.round((ganhos / total) * 100) : 0
  const novos = counts['novo'] ?? 0

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">CRM — Leads</h1>
          <p className="text-[#64748b] text-sm mt-0.5">
            {total} leads · {conversao}% conversão
            {!canViewAll && <span className="text-[#94a3b8]"> · só os meus</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canComerciais && (
            <Link
              href="/admin/leads/comerciais"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-[#1F3F44] font-semibold text-sm hover:bg-[#f8fafc] transition-colors"
            >
              <UsersIcon className="w-4 h-4" /> Comerciais
            </Link>
          )}
          <Link
            href="/admin/leads/novo"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Novo Lead
          </Link>
        </div>
      </div>

      {/* Tabs Ativos / Arquivados (super admin) */}
      {isSuperAdmin && (
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/admin/leads"
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-semibold border transition-colors',
              !verArquivados ? 'bg-[#1F3F44] text-white border-[#1F3F44]' : 'bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]'
            )}
          >
            Ativos
          </Link>
          <Link
            href="/admin/leads?vista=arquivados"
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors',
              verArquivados ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]'
            )}
          >
            <Archive className="w-3.5 h-3.5" /> Arquivados
            {arquivadosCount > 0 && (
              <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-bold', verArquivados ? 'bg-white/25' : 'bg-amber-100 text-amber-700')}>
                {arquivadosCount}
              </span>
            )}
          </Link>
        </div>
      )}

      {/* KPI + Pipeline — só na vista de ativos */}
      {!verArquivados && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total leads', value: total, sub: canViewAll ? 'todos os tempos' : 'atribuídos a mim' },
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
        </>
      )}

      {/* Título da vista arquivados */}
      {verArquivados && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <Archive className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>Leads arquivados</strong> — visíveis apenas para o Super Admin. O motivo de cada arquivo está no histórico do lead.
          </p>
        </div>
      )}

      {/* Lista */}
      {leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-16 text-center">
          {verArquivados ? <Inbox className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" /> : <Mail className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />}
          <p className="font-serif font-semibold text-[#1F3F44] mb-1">
            {verArquivados
              ? 'Nenhum lead arquivado'
              : estado ? `Sem leads em "${ESTADOS.find((e) => e.value === estado)?.label}"` : 'Sem leads ainda'}
          </p>
          <p className="text-[#94a3b8] text-sm">
            {verArquivados ? 'Os leads arquivados aparecerão aqui.' : 'Os contactos do site aparecerão aqui.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {leads.map((lead) => {
            const est = ESTADOS.find((e) => e.value === lead.estado) ?? ESTADOS[0]
            const responsavelNome = lead.responsavel_id ? userMap.get(lead.responsavel_id) : null
            return (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className={cn(
                  'flex items-center gap-4 bg-white rounded-2xl border p-4 hover:shadow-md transition-all group',
                  verArquivados ? 'border-amber-200/70 opacity-90 hover:opacity-100' : 'border-[#e2e8f0] hover:border-[#00545F]/30'
                )}
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
                    {verArquivados && <Archive className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                    {!lead.lido && !verArquivados && (
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

                {/* Responsável (gestão) */}
                {canViewAll && responsavelNome && (
                  <div className="hidden md:flex items-center gap-1.5 flex-shrink-0 max-w-[150px]">
                    <UserCircle2 className="w-3.5 h-3.5 text-[#94a3b8] flex-shrink-0" />
                    <span className="text-xs text-[#64748b] truncate">{responsavelNome}</span>
                  </div>
                )}

                {/* Property */}
                {lead.imovel_titulo && (
                  <div className="hidden lg:block flex-shrink-0 max-w-[160px]">
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
