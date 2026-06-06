import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'
import { Home, TrendingUp, Target, Users, UserCircle2, Star, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

/* ─── Helpers ─── */
function ptMonth(iso: string) {
  return new Intl.DateTimeFormat('pt-PT', { month: 'short' }).format(new Date(iso))
}
function ptMonthFull(iso: string) {
  return new Intl.DateTimeFormat('pt-PT', { month: 'short', year: '2-digit' }).format(new Date(iso))
}
function isoMonth(iso: string) {
  return iso.slice(0, 7) // "YYYY-MM"
}

/* ─── SVG Bar Chart ─── */
function BarChart({ data }: { data: { label: string; value: number; value2?: number; color?: string; color2?: string }[] }) {
  const max = Math.max(...data.map(d => Math.max(d.value, d.value2 ?? 0)), 1)
  const H = 120
  const barW = 100 / data.length

  return (
    <svg viewBox={`0 0 100 ${H + 16}`} className="w-full" style={{ overflow: 'visible' }}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1="0" y1={H - f * H} x2="100" y2={H - f * H} stroke="#e2e8f0" strokeWidth="0.3" />
      ))}
      {data.map((d, i) => {
        const x = i * barW
        const w1 = d.value2 !== undefined ? barW * 0.38 : barW * 0.6
        const w2 = barW * 0.38
        const gap = d.value2 !== undefined ? barW * 0.06 : 0
        const xOff = d.value2 !== undefined ? barW * 0.1 : barW * 0.2
        const h1 = (d.value / max) * H
        const h2 = ((d.value2 ?? 0) / max) * H
        return (
          <g key={i}>
            {/* Bar 1 */}
            <rect x={x + xOff} y={H - h1} width={w1} height={h1} fill={d.color ?? '#00545F'} rx="1" opacity="0.9" />
            {/* Bar 2 (optional) */}
            {d.value2 !== undefined && (
              <rect x={x + xOff + w1 + gap} y={H - h2} width={w2} height={h2} fill={d.color2 ?? '#ef4444'} rx="1" opacity="0.8" />
            )}
            {/* Label */}
            <text x={x + barW / 2} y={H + 10} textAnchor="middle" fontSize="4.5" fill="#94a3b8" className="font-sans">{d.label}</text>
            {/* Value on top of bar 1 */}
            {d.value > 0 && <text x={x + xOff + w1 / 2} y={H - h1 - 2} textAnchor="middle" fontSize="4" fill={d.color ?? '#00545F'} fontWeight="bold">{d.value}</text>}
            {d.value2 !== undefined && d.value2 > 0 && (
              <text x={x + xOff + w1 + gap + w2 / 2} y={H - h2 - 2} textAnchor="middle" fontSize="4" fill="#ef4444" fontWeight="bold">{d.value2}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ─── Funnel ─── */
function FunnelChart({ stages }: { stages: { label: string; count: number; color: string; dot: string }[] }) {
  const max = Math.max(...stages.map(s => s.count), 1)
  return (
    <div className="space-y-2">
      {stages.filter(s => !['perdido'].includes(s.label.toLowerCase())).map((s, i) => {
        const pct = Math.round((s.count / max) * 100)
        const conv = i === 0 ? 100 : stages[0].count > 0 ? Math.round((s.count / stages[0].count) * 100) : 0
        return (
          <div key={s.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-1.5">
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', s.dot)} />
                <span className="text-[#475569] font-medium">{s.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#94a3b8] text-[10px]">{conv}% do total</span>
                <span className="font-bold text-[#1F3F44] w-6 text-right">{s.count}</span>
              </div>
            </div>
            <div className="h-4 bg-[#f1f5f9] rounded-lg overflow-hidden" style={{ width: '100%' }}>
              <div
                className={cn('h-full rounded-lg transition-all duration-700', s.dot.replace('bg-', 'bg-'))}
                style={{ width: `${pct}%`, opacity: 0.85 }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Fonte donut (CSS-only) ─── */
const FONTE_COLORS: Record<string, string> = {
  site:      '#00545F',
  telefone:  '#3b82f6',
  referencia:'#f59e0b',
  portal:    '#8b5cf6',
  manual:    '#64748b',
}

function FonteBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#475569] capitalize font-medium">{label}</span>
        <span className="text-[#94a3b8]">{pct}% · {count}</span>
      </div>
      <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default async function EstatisticasPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/admin/login')
  if (!canUser(user, 'estatisticas.view')) redirect('/admin/dashboard')

  const canViewAll = canUser(user, 'leads.view_all')

  const now = new Date()
  const twelveAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // ── Fetch data ──
  const [
    { data: angariacoesRaw },
    { data: leadsRaw },
    { data: users },
  ] = await Promise.all([
    supabaseAdmin
      .from('imoveis')
      .select('id, created_at, disponivel, angariacao_perdida, angariador_id, cidade, tipologia')
      .not('angariador_id', 'is', null)
      .gte('created_at', twelveAgo)
      .order('created_at', { ascending: true }),
    // leads visibility
    (() => {
      let q = supabaseAdmin
        .from('contactos_imoveis')
        .select('id, estado, fonte, created_at, responsavel_id, arquivado, temperatura')
        .eq('arquivado', false)
      if (!canViewAll) q = q.or(`responsavel_id.eq.${user.id},criado_por.eq.${user.id}`)
      return q
    })(),
    supabaseAdmin.from('admin_users').select('id, nome, role').eq('ativo', true),
  ])

  const angs  = angariacoesRaw ?? []
  const leads = leadsRaw ?? []
  const allUsers = users ?? []

  // ── Angariações por mês ──
  const mesMap: Record<string, { ganhas: number; perdidas: number }> = {}
  // Build last 12 months
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    mesMap[d.toISOString().slice(0, 7)] = { ganhas: 0, perdidas: 0 }
  }
  for (const a of angs) {
    const key = isoMonth(a.created_at)
    if (!mesMap[key]) continue
    if (a.angariacao_perdida) mesMap[key].perdidas++
    else mesMap[key].ganhas++
  }
  const angsBarData = Object.entries(mesMap).map(([k, v]) => ({
    label: ptMonth(k + '-01'),
    value: v.ganhas,
    value2: v.perdidas,
    color: '#00545F',
    color2: '#ef4444',
  }))

  const angsTotal    = angs.length
  const angsPerdidas = angs.filter(a => a.angariacao_perdida).length
  const angsAtivas   = angs.filter(a => !a.angariacao_perdida && a.disponivel).length
  const angsVendidas = angs.filter(a => !a.angariacao_perdida && !a.disponivel).length
  const taxaPerda    = angsTotal > 0 ? Math.round((angsPerdidas / angsTotal) * 100) : 0
  const angsEsteMes  = angs.filter(a => a.created_at >= startOfMonth && !a.angariacao_perdida).length

  // ── Leads ──
  const totalLeads   = leads.length
  const ganhos       = leads.filter(l => l.estado === 'ganho').length
  const perdidos     = leads.filter(l => l.estado === 'perdido').length
  const ativos       = leads.filter(l => !['ganho','perdido'].includes(l.estado)).length
  const conversao    = totalLeads > 0 ? Math.round((ganhos / totalLeads) * 100) : 0
  const leadsMes     = leads.filter(l => l.created_at >= startOfMonth).length

  // ── Funil ──
  const ESTADOS_FUNIL = [
    { value: 'novo',            label: 'Novo',         dot: 'bg-blue-500',    color: 'text-blue-700' },
    { value: 'contactado',      label: 'Contactado',   dot: 'bg-violet-500',  color: 'text-violet-700' },
    { value: 'qualificado',     label: 'Qualificado',  dot: 'bg-indigo-500',  color: 'text-indigo-700' },
    { value: 'visita_agendada', label: 'Visita',       dot: 'bg-teal-500',    color: 'text-teal-700' },
    { value: 'negociacao',      label: 'Negociação',   dot: 'bg-amber-500',   color: 'text-amber-700' },
    { value: 'reserva',         label: 'Reserva',      dot: 'bg-orange-500',  color: 'text-orange-700' },
    { value: 'ganho',           label: 'Ganho',        dot: 'bg-emerald-500', color: 'text-emerald-700' },
  ]
  const funnelStages = ESTADOS_FUNIL.map(e => ({
    ...e,
    count: leads.filter(l => l.estado === e.value).length,
  }))

  // ── Leads por mês (bar chart) ──
  const leadsMesMap: Record<string, number> = {}
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    leadsMesMap[d.toISOString().slice(0, 7)] = 0
  }
  for (const l of leads) {
    const key = isoMonth(l.created_at)
    if (leadsMesMap[key] !== undefined) leadsMesMap[key]++
  }
  const leadsBarData = Object.entries(leadsMesMap).map(([k, v]) => ({
    label: ptMonth(k + '-01'),
    value: v,
    color: '#1F3F44',
  }))

  // ── Leads por fonte ──
  const fonteCounts: Record<string, number> = {}
  for (const l of leads) {
    const f = l.fonte ?? 'site'
    fonteCounts[f] = (fonteCounts[f] ?? 0) + 1
  }
  const FONTE_LABELS: Record<string, string> = { site: 'Site', telefone: 'Telefone', referencia: 'Referência', portal: 'Portal', manual: 'Manual' }

  // ── Performance por comercial (só para quem vê tudo) ──
  type PerfRow = { id: string; nome: string; role: string; total: number; ativos: number; ganhos: number; angs: number; conv: number }
  let perfRows: PerfRow[] = []
  if (canViewAll) {
    const comerciaisIds = allUsers.filter(u => ['comercial','diretor','super_admin'].includes(u.role)).map(u => u.id)
    const { data: todasAngs } = await supabaseAdmin.from('imoveis').select('angariador_id, angariacao_perdida').not('angariador_id', 'is', null)
    perfRows = comerciaisIds.map(id => {
      const userLeads = leads.filter(l => l.responsavel_id === id)
      const ganhadosPess = userLeads.filter(l => l.estado === 'ganho').length
      const totalPess = userLeads.length
      return {
        id,
        nome: allUsers.find(u => u.id === id)?.nome ?? id,
        role: allUsers.find(u => u.id === id)?.role ?? '',
        total: totalPess,
        ativos: userLeads.filter(l => !['ganho','perdido'].includes(l.estado)).length,
        ganhos: ganhadosPess,
        angs: (todasAngs ?? []).filter(a => a.angariador_id === id && !a.angariacao_perdida).length,
        conv: totalPess > 0 ? Math.round((ganhadosPess / totalPess) * 100) : 0,
      }
    }).filter(r => r.total > 0 || r.angs > 0).sort((a, b) => b.total - a.total)
  }

  const ROLE_LABEL: Record<string, string> = { super_admin: 'Super Admin', diretor: 'Diretor', comercial: 'Comercial' }

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Estatísticas</h1>
          <p className="text-[#64748b] text-sm mt-0.5">
            Análise de performance · {canViewAll ? 'Toda a equipa' : 'Os meus dados'}
          </p>
        </div>
        <Link href="/admin/dashboard" className="text-[#00545F] text-sm font-semibold hover:underline">← Dashboard</Link>
      </div>

      {/* KPIs topo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Angariações', value: angsTotal, sub: `${angsEsteMes} este mês`, icon: Home, accent: true },
          { label: 'Ativas em carteira', value: angsAtivas, sub: `${angsVendidas} vendidas/arrendadas`, icon: Star, accent: true },
          { label: 'Perdidas', value: angsPerdidas, sub: `taxa de perda ${taxaPerda}%`, icon: AlertTriangle, warn: angsPerdidas > 0 },
          { label: 'Conversão leads', value: `${conversao}%`, sub: `${ganhos} negócios · ${totalLeads} total`, icon: Target },
        ].map(k => (
          <div key={k.label} className={cn('bg-white rounded-2xl border p-5 flex items-start gap-4',
            k.warn ? 'border-red-200' : k.accent ? 'border-[#00545F]/20' : 'border-[#e2e8f0]'
          )}>
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              k.warn ? 'bg-red-50' : k.accent ? 'bg-teal-50' : 'bg-[#f8fafc]'
            )}>
              <k.icon className={cn('w-5 h-5', k.warn ? 'text-red-500' : k.accent ? 'text-[#00545F]' : 'text-[#64748b]')} />
            </div>
            <div>
              <p className={cn('font-serif font-bold text-3xl', k.warn ? 'text-red-600' : k.accent ? 'text-[#00545F]' : 'text-[#1F3F44]')}>{k.value}</p>
              <p className="text-sm font-semibold text-[#1F3F44] mt-0.5">{k.label}</p>
              <p className="text-xs text-[#94a3b8]">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos linha 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Angariações por mês */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-serif font-semibold text-[#1F3F44]">Angariações por mês</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#00545F]" /> Conseguidas</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400" /> Perdidas</span>
            </div>
          </div>
          <p className="text-xs text-[#94a3b8] mb-4">Últimos 12 meses</p>
          <BarChart data={angsBarData} />
        </div>

        {/* Leads por mês */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <h2 className="font-serif font-semibold text-[#1F3F44] mb-1">Leads por mês</h2>
          <p className="text-xs text-[#94a3b8] mb-4">Últimos 12 meses · {leadsMes} este mês</p>
          <BarChart data={leadsBarData} />
        </div>
      </div>

      {/* Funil + Fontes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Funil de conversão */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-serif font-semibold text-[#1F3F44]">Funil de Vendas</h2>
            <span className="text-xs text-[#94a3b8]">{ativos} ativos · {ganhos} ganhos</span>
          </div>
          <p className="text-xs text-[#94a3b8] mb-5">Cada barra = % relativa ao estado com mais leads</p>
          <FunnelChart stages={funnelStages} />
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Em negociação', value: funnelStages.find(s => s.value === 'negociacao')?.count ?? 0, color: 'text-amber-600' },
              { label: 'Em reserva',    value: funnelStages.find(s => s.value === 'reserva')?.count ?? 0,    color: 'text-orange-600' },
              { label: 'Ganhos',        value: ganhos,  color: 'text-emerald-600' },
            ].map(s => (
              <div key={s.label} className="bg-[#f8fafc] rounded-xl p-3">
                <p className={cn('font-serif font-bold text-2xl', s.color)}>{s.value}</p>
                <p className="text-xs text-[#94a3b8]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leads por fonte */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <h2 className="font-serif font-semibold text-[#1F3F44] mb-2">Origem dos Leads</h2>
          <p className="text-xs text-[#94a3b8] mb-6">Por canal de captação</p>
          <div className="space-y-4">
            {Object.entries(fonteCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([fonte, count]) => (
                <FonteBar
                  key={fonte}
                  label={FONTE_LABELS[fonte] ?? fonte}
                  count={count}
                  total={totalLeads}
                  color={FONTE_COLORS[fonte] ?? '#64748b'}
                />
              ))}
            {Object.keys(fonteCounts).length === 0 && (
              <p className="text-[#94a3b8] text-sm text-center py-4">Sem dados de fonte ainda.</p>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-[#f1f5f9]">
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Temperatura atual</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { e: 'frio',         emoji: '🔵', label: 'Frios' },
                { e: 'morno',        emoji: '🟡', label: 'Mornos' },
                { e: 'quente',       emoji: '🟠', label: 'Quentes' },
                { e: 'muito_quente', emoji: '🔴', label: 'Muito Q.' },
              ].map(t => (
                <div key={t.e} className="bg-[#f8fafc] rounded-xl p-2">
                  <p className="text-base">{t.emoji}</p>
                  <p className="font-serif font-bold text-lg text-[#1F3F44]">{leads.filter(l => l.temperatura === t.e).length}</p>
                  <p className="text-[10px] text-[#94a3b8]">{t.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance por comercial (admin/diretor only) */}
      {canViewAll && perfRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif font-semibold text-[#1F3F44]">Performance por Comercial</h2>
              <p className="text-xs text-[#94a3b8] mt-0.5">Leads atribuídos · Angariações · Conversão</p>
            </div>
            <Link href="/admin/leads/comerciais" className="text-[#00545F] text-xs font-semibold hover:underline flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Gerir comerciais
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  {['Comercial', 'Leads totais', 'Ativos', 'Ganhos', 'Angariações', 'Conversão'].map(h => (
                    <th key={h} className="text-left pb-3 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {perfRows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        {i === 0 && <span title="Top performer">🏆</span>}
                        <div className="w-8 h-8 rounded-lg bg-[#1F3F44] flex items-center justify-center text-white font-bold text-xs font-serif flex-shrink-0">
                          {r.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[#1F3F44]">{r.nome}</p>
                          <p className="text-xs text-[#94a3b8]">{ROLE_LABEL[r.role] ?? r.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-serif font-bold text-[#1F3F44] text-lg">{r.total}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{r.ativos}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">{r.ganhos}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1.5">
                        <Home className="w-3 h-3 text-[#00545F]" />
                        <span className="font-medium text-[#1F3F44]">{r.angs}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden w-16">
                          <div className="h-full bg-[#00545F] rounded-full" style={{ width: `${r.conv}%` }} />
                        </div>
                        <span className={cn('text-xs font-bold', r.conv >= 20 ? 'text-emerald-600' : r.conv >= 10 ? 'text-amber-600' : 'text-[#94a3b8]')}>
                          {r.conv}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!canViewAll && (
        <div className="bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] p-6 text-center">
          <UserCircle2 className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#1F3F44]">Estás a ver os teus dados pessoais</p>
          <p className="text-xs text-[#94a3b8] mt-1">Leads atribuídos a ti e angariações feitas por ti.</p>
        </div>
      )}
    </div>
  )
}
