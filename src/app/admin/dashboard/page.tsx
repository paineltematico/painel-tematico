import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'
import { ROLE_LABELS } from '@/lib/auth'
import { ESTADOS } from '@/lib/crm'
import {
  TrendingUp, Users, Home, Building2, Calendar,
  ArrowRight, ArrowUpRight, Activity, Target,
  AlertTriangle, Flame, Clock, Phone, CheckCircle,
  Star, BarChart2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

/* ─────────── helpers ─────────── */
function formatDate(d: string) {
  return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
}
function diasSem(isoDate: string) {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000)
}
function mesLabel(iso: string) {
  return new Intl.DateTimeFormat('pt-PT', { month: 'short' }).format(new Date(iso))
}

/* ─────────── sub‑components ─────────── */
function KpiCard({ label, value, sub, icon: Icon, accent = false, warn = false, href }: {
  label: string; value: string | number; sub: string
  icon: React.ElementType; accent?: boolean; warn?: boolean; href?: string
}) {
  const inner = (
    <div className={cn(
      'bg-white rounded-2xl border p-5 flex items-start gap-4 transition-shadow hover:shadow-md',
      warn   ? 'border-red-200 shadow-sm'     :
      accent ? 'border-[#00545F]/30 shadow-sm' :
               'border-[#e2e8f0]'
    )}>
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
        warn   ? 'bg-red-50'   :
        accent ? 'bg-teal-50'  : 'bg-[#f8fafc]'
      )}>
        <Icon className={cn('w-5 h-5', warn ? 'text-red-500' : accent ? 'text-[#00545F]' : 'text-[#64748b]')} />
      </div>
      <div>
        <p className={cn('font-serif font-bold text-3xl', warn ? 'text-red-600' : accent ? 'text-[#00545F]' : 'text-[#1F3F44]')}>{value}</p>
        <p className="text-[#1F3F44] text-sm font-semibold mt-0.5">{label}</p>
        <p className="text-[#94a3b8] text-xs">{sub}</p>
      </div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

/* ══════════════════════════════════════════
   DASHBOARD COMERCIAL
══════════════════════════════════════════ */
async function getComercialData(userId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const threshold3d  = new Date(Date.now() - 3 * 86_400_000).toISOString()
  const threshold7d  = new Date(Date.now() - 7 * 86_400_000).toISOString()

  const [
    { data: meusLeads },
    { data: minhasAngariações },
    { data: recentAtividades },
  ] = await Promise.all([
    supabaseAdmin
      .from('contactos_imoveis')
      .select('*')
      .eq('arquivado', false)
      .or(`responsavel_id.eq.${userId},criado_por.eq.${userId}`)
      .order('updated_at', { ascending: false }),
    supabaseAdmin
      .from('imoveis')
      .select('id, titulo, cidade, tipologia, disponivel, angariacao_perdida, angariacao_perdida_motivo, created_at')
      .eq('angariador_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabaseAdmin
      .from('lead_atividades')
      .select('lead_id, created_at')
      .order('created_at', { ascending: false })
      .limit(500),
  ])

  const leads = meusLeads ?? []
  const angs  = minhasAngariações ?? []

  // última atividade por lead
  const ultimaAtiv: Record<string, string> = {}
  for (const a of recentAtividades ?? []) {
    if (!ultimaAtiv[a.lead_id]) ultimaAtiv[a.lead_id] = a.created_at
  }

  // pipeline counts
  const pipelineCounts: Record<string, number> = {}
  for (const l of leads) {
    if (!['ganho','perdido'].includes(l.estado)) {
      pipelineCounts[l.estado] = (pipelineCounts[l.estado] ?? 0) + 1
    }
  }

  const ativos    = leads.filter(l => !['ganho','perdido'].includes(l.estado))
  const ganhos    = leads.filter(l => l.estado === 'ganho')
  const conversao = leads.length > 0 ? Math.round((ganhos.length / leads.length) * 100) : 0

  // alertas
  const semContacto = ativos.filter(l => {
    const ultima = ultimaAtiv[l.id] ?? l.updated_at
    return ultima < threshold3d
  })
  const leadsQuentes = ativos.filter(l =>
    ['quente','muito_quente'].includes(l.temperatura) && (ultimaAtiv[l.id] ?? l.updated_at) < threshold7d
  )
  const avançados = ativos.filter(l =>
    ['negociacao','reserva'].includes(l.estado) && (ultimaAtiv[l.id] ?? l.updated_at) < threshold7d
  )

  // angariações este mês
  const angsEsteMes = angs.filter(a => a.created_at >= startOfMonth)
  const angsPerdidas = angs.filter(a => a.angariacao_perdida)
  const angsAtivas  = angs.filter(a => !a.angariacao_perdida && a.disponivel)

  return {
    leads, ativos, ganhos, conversao, pipelineCounts,
    semContacto, leadsQuentes, avançados,
    angs, angsEsteMes, angsPerdidas, angsAtivas,
  }
}

async function ComercialDashboard({ userId, nome, role }: { userId: string; nome: string; role: string }) {
  const d = await getComercialData(userId)

  const TEMP_CFG: Record<string, { label: string; cor: string; emoji: string }> = {
    frio:        { label: 'Frio',        cor: 'text-blue-600',   emoji: '🔵' },
    morno:       { label: 'Morno',       cor: 'text-amber-600',  emoji: '🟡' },
    quente:      { label: 'Quente',      cor: 'text-orange-600', emoji: '🟠' },
    muito_quente:{ label: 'Muito Quente',cor: 'text-red-600',    emoji: '🔴' },
  }

  const alertaCount = d.semContacto.length + d.leadsQuentes.length + d.avançados.length

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Saudação */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">
          Bom dia, {nome.split(' ')[0]} 👋
        </h1>
        <p className="text-[#64748b] text-sm mt-0.5">
          {ROLE_LABELS[role as keyof typeof ROLE_LABELS]} · {new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
        </p>
      </div>

      {/* Alertas */}
      {alertaCount > 0 && (
        <div className="space-y-2">
          {d.semContacto.length > 0 && (
            <Link href="/admin/leads" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 transition-colors">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800 font-medium">
                <strong>{d.semContacto.length} {d.semContacto.length === 1 ? 'lead' : 'leads'}</strong> sem contacto há mais de 3 dias — precisam de atenção
              </p>
              <ArrowRight className="w-4 h-4 text-red-400 ml-auto flex-shrink-0" />
            </Link>
          )}
          {d.avançados.length > 0 && (
            <Link href="/admin/leads" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors">
              <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <p className="text-sm text-orange-800 font-medium">
                <strong>{d.avançados.length} {d.avançados.length === 1 ? 'negócio em curso' : 'negócios em curso'}</strong> em negociação/reserva parados há +7 dias
              </p>
              <ArrowRight className="w-4 h-4 text-orange-400 ml-auto flex-shrink-0" />
            </Link>
          )}
          {d.leadsQuentes.length > 0 && (
            <Link href="/admin/leads" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors">
              <Flame className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800 font-medium">
                <strong>{d.leadsQuentes.length} {d.leadsQuentes.length === 1 ? 'lead quente' : 'leads quentes'}</strong> sem atividade esta semana — não deixes arrefecer
              </p>
              <ArrowRight className="w-4 h-4 text-amber-400 ml-auto flex-shrink-0" />
            </Link>
          )}
        </div>
      )}
      {alertaCount === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-800 font-medium">Tudo em dia — sem alertas pendentes 🎉</p>
        </div>
      )}

      {/* KPIs pessoais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Leads ativos"       value={d.ativos.length}       sub="na minha carteira"    icon={Users}     accent href="/admin/leads" />
        <KpiCard label="Angariações ativas" value={d.angsAtivas.length}   sub="imóveis em carteira"  icon={Home}      accent href="/admin/imoveis" />
        <KpiCard label="Sem contacto"       value={d.semContacto.length}  sub="há mais de 3 dias"    icon={Phone}     warn={d.semContacto.length > 0} href="/admin/leads" />
        <KpiCard label="Conversão"          value={`${d.conversao}%`}     sub={`${d.ganhos.length} negócios fechados`} icon={Target} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pipeline pessoal */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif font-semibold text-[#1F3F44] text-lg">O Meu Pipeline</h2>
            <Link href="/admin/leads" className="text-[#00545F] text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {d.ativos.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
              <p className="text-sm text-[#94a3b8]">Sem leads ativos ainda.</p>
              <Link href="/admin/leads/novo" className="inline-block mt-3 px-4 py-2 rounded-xl bg-[#00545F] text-white text-xs font-semibold hover:bg-[#006B78] transition-colors">+ Novo Lead</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {ESTADOS.filter(e => !['perdido'].includes(e.value)).map(stage => {
                const count = d.pipelineCounts[stage.value] ?? 0
                const maxCount = Math.max(...Object.values(d.pipelineCounts), 1)
                const pct = Math.round((count / maxCount) * 100)
                return (
                  <Link key={stage.value} href={`/admin/leads?estado=${stage.value}`} className="block group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('w-2 h-2 rounded-full flex-shrink-0', stage.dot)} />
                        <span className="text-sm text-[#475569] font-medium group-hover:text-[#1F3F44] transition-colors">{stage.label}</span>
                      </div>
                      <span className="text-sm font-bold text-[#1F3F44]">{count}</span>
                    </div>
                    <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all duration-500', count === 0 ? 'bg-[#e2e8f0]' : stage.dot.replace('bg-', 'bg-'))} style={{ width: `${pct}%` }} />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Acesso rápido */}
          <div className="mt-5 pt-4 border-t border-[#f1f5f9] flex gap-2 flex-wrap">
            <Link href="/admin/leads/novo" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00545F] text-white text-xs font-semibold hover:bg-[#006B78] transition-colors">
              + Novo Lead
            </Link>
            <Link href="/admin/imoveis/novo" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2e8f0] text-[#475569] text-xs font-semibold hover:bg-[#f8fafc] transition-colors">
              + Angariar Imóvel
            </Link>
            <Link href="/admin/estatisticas" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2e8f0] text-[#475569] text-xs font-semibold hover:bg-[#f8fafc] transition-colors">
              <BarChart2 className="w-3 h-3" /> Estatísticas
            </Link>
          </div>
        </div>

        {/* Painel direito: atenção + angariações */}
        <div className="space-y-4">

          {/* Leads que precisam de ação */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <h2 className="font-serif font-semibold text-[#1F3F44] mb-4 text-base flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" /> Para Agir Agora
            </h2>
            {[...d.avançados, ...d.leadsQuentes].slice(0, 5).length === 0 ? (
              <p className="text-xs text-[#94a3b8] text-center py-3">Nenhum lead urgente. 👍</p>
            ) : (
              <div className="space-y-2.5">
                {[...d.avançados, ...d.leadsQuentes]
                  .filter((l, i, arr) => arr.findIndex(x => x.id === l.id) === i) // deduplicate
                  .slice(0, 5)
                  .map(lead => {
                    const est = ESTADOS.find(e => e.value === lead.estado) ?? ESTADOS[0]
                    const temp = TEMP_CFG[lead.temperatura] ?? TEMP_CFG.frio
                    const dias = diasSem(lead.updated_at)
                    return (
                      <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f8fafc] transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center flex-shrink-0 font-bold text-xs text-[#1F3F44] font-serif group-hover:bg-teal-50 transition-colors">
                          {lead.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1F3F44] truncate group-hover:text-[#00545F]">{lead.nome}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full border', est.bg, est.color)}>{est.label}</span>
                            <span className="text-[10px] text-[#94a3b8]">{temp.emoji} · {dias}d</span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#00545F] flex-shrink-0" />
                      </Link>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Minhas angariações */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif font-semibold text-[#1F3F44] text-base flex items-center gap-2">
                <Home className="w-4 h-4 text-[#00545F]" /> Angariações
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-semibold">
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{d.angsAtivas.length} ativas</span>
                {d.angsPerdidas.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">{d.angsPerdidas.length} perdidas</span>}
              </div>
            </div>
            {d.angs.length === 0 ? (
              <div className="text-center py-3">
                <p className="text-xs text-[#94a3b8] mb-2">Nenhum imóvel angariado ainda.</p>
                <Link href="/admin/imoveis/novo" className="inline-block px-3 py-1.5 rounded-lg bg-[#00545F] text-white text-xs font-semibold hover:bg-[#006B78] transition-colors">
                  + Angariar
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {d.angs.slice(0, 5).map(ang => (
                  <Link key={ang.id} href={`/admin/imoveis/${ang.id}`} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#f8fafc] transition-colors group">
                    <div className={cn('w-2 h-2 rounded-full flex-shrink-0', ang.angariacao_perdida ? 'bg-red-400' : ang.disponivel ? 'bg-emerald-400' : 'bg-[#94a3b8]')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1F3F44] truncate group-hover:text-[#00545F]">{ang.titulo}</p>
                      <p className="text-[10px] text-[#94a3b8]">{ang.cidade ?? ''}{ang.tipologia ? ` · ${ang.tipologia}` : ''}</p>
                    </div>
                    {ang.angariacao_perdida && <span className="text-[10px] font-semibold text-red-500 flex-shrink-0">Perdida</span>}
                  </Link>
                ))}
                {d.angs.length > 5 && (
                  <Link href="/admin/imoveis" className="block text-center text-xs text-[#00545F] font-semibold py-1 hover:underline">
                    Ver todas ({d.angs.length})
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leads sem contacto (lista) */}
      {d.semContacto.length > 0 && (
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-semibold text-[#1F3F44] text-lg flex items-center gap-2">
              <Phone className="w-4 h-4 text-red-500" /> Para Contactar — Urgente
            </h2>
            <Link href="/admin/leads" className="text-[#00545F] text-xs font-semibold flex items-center gap-1">Ver todos <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {d.semContacto.slice(0, 6).map(lead => {
              const est = ESTADOS.find(e => e.value === lead.estado) ?? ESTADOS[0]
              const dias = diasSem(lead.updated_at)
              return (
                <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-[#e2e8f0] hover:border-red-200 hover:bg-red-50 transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-[#f1f5f9] flex items-center justify-center font-serif font-bold text-sm text-[#1F3F44] flex-shrink-0">
                    {lead.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1F3F44] truncate group-hover:text-red-700">{lead.nome}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn('text-[10px] font-semibold', est.color)}>{est.label}</span>
                      <span className="text-[10px] text-red-400 font-semibold">há {dias} dias</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-red-500 flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   DASHBOARD ADMIN / DIRETOR (existente + melhorado)
══════════════════════════════════════════ */
async function getAdminData() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: totalLeads },
    { count: leadsThisMonth },
    { count: leadsNovos },
    { data: leadsByEstado },
    { count: totalImoveis },
    { count: imoveisDisponiveis },
    { count: totalProjetos },
    { data: recentLeads },
    { count: angsTotal },
    { count: angsPerdidas },
  ] = await Promise.all([
    supabaseAdmin.from('contactos_imoveis').select('*', { count: 'exact', head: true }).eq('arquivado', false),
    supabaseAdmin.from('contactos_imoveis').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth).eq('arquivado', false),
    supabaseAdmin.from('contactos_imoveis').select('*', { count: 'exact', head: true }).eq('estado', 'novo').eq('arquivado', false),
    supabaseAdmin.from('contactos_imoveis').select('estado').eq('arquivado', false),
    supabaseAdmin.from('imoveis').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('imoveis').select('*', { count: 'exact', head: true }).eq('disponivel', true),
    supabaseAdmin.from('projetos').select('*', { count: 'exact', head: true }).eq('ativo', true),
    supabaseAdmin.from('contactos_imoveis').select('id,nome,email,estado,created_at').eq('arquivado', false).order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('imoveis').select('*', { count: 'exact', head: true }).not('angariador_id', 'is', null),
    supabaseAdmin.from('imoveis').select('*', { count: 'exact', head: true }).eq('angariacao_perdida', true),
  ])

  const counts: Record<string, number> = {}
  for (const row of leadsByEstado ?? []) counts[row.estado] = (counts[row.estado] ?? 0) + 1

  const ganhos = counts['ganho'] ?? 0
  const conversao = (totalLeads ?? 0) > 0 ? Math.round((ganhos / (totalLeads ?? 1)) * 100) : 0

  return {
    totalLeads: totalLeads ?? 0, leadsThisMonth: leadsThisMonth ?? 0,
    leadsNovos: leadsNovos ?? 0, ganhos, conversao,
    totalImoveis: totalImoveis ?? 0, imoveisDisponiveis: imoveisDisponiveis ?? 0,
    totalProjetos: totalProjetos ?? 0, counts,
    recentLeads: recentLeads ?? [],
    angsTotal: angsTotal ?? 0,
    angsPerdidas: angsPerdidas ?? 0,
  }
}

const PIPELINE = [
  { key: 'novo',           label: 'Novos',        color: 'bg-blue-500' },
  { key: 'contactado',     label: 'Contactados',   color: 'bg-violet-500' },
  { key: 'qualificado',    label: 'Qualificados',  color: 'bg-indigo-500' },
  { key: 'visita_agendada',label: 'Visita',        color: 'bg-amber-500' },
  { key: 'negociacao',     label: 'Negociação',    color: 'bg-orange-500' },
  { key: 'reserva',        label: 'Reserva',       color: 'bg-teal-500' },
  { key: 'ganho',          label: 'Ganhos',        color: 'bg-emerald-500' },
]

async function AdminDashboard({ nome, role }: { nome: string; role: string }) {
  const d = await getAdminData()
  const maxCount = Math.max(...PIPELINE.map(p => d.counts[p.key] ?? 0), 1)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Olá, {nome.split(' ')[0]} 👋</h1>
        <p className="text-[#64748b] text-sm mt-0.5">
          {ROLE_LABELS[role as keyof typeof ROLE_LABELS]} · {new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Leads este mês"     value={d.leadsThisMonth}     sub="novos contactos"                icon={TrendingUp} accent href="/admin/leads" />
        <KpiCard label="Por contactar"      value={d.leadsNovos}         sub="aguardam resposta"              icon={Activity}   accent={d.leadsNovos > 0} warn={d.leadsNovos > 0} href="/admin/leads?estado=novo" />
        <KpiCard label="Angariações"        value={d.angsTotal}          sub={`${d.angsPerdidas} perdidas`}   icon={Star}       href="/admin/imoveis" />
        <KpiCard label="Conversão"          value={`${d.conversao}%`}    sub={`${d.ganhos} negócios fechados`} icon={Target} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Total leads"         value={d.totalLeads}          sub="todos os tempos"         icon={Users}     href="/admin/leads" />
        <KpiCard label="Imóveis disponíveis" value={d.imoveisDisponiveis}  sub={`de ${d.totalImoveis} total`} icon={Home} href="/admin/imoveis" />
        <KpiCard label="Projetos ativos"     value={d.totalProjetos}       sub="em curso"                icon={Building2} href="/admin/projetos" />
        <Link href="/admin/estatisticas" className="bg-[#1F3F44] rounded-2xl p-5 flex flex-col justify-between hover:bg-[#162e32] transition-colors">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5" /> Estatísticas</p>
          <p className="font-serif font-bold text-2xl text-white">Ver análise</p>
          <p className="text-slate-400 text-xs mt-1">Funil · Angariações · Performance</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif font-semibold text-[#1F3F44] text-lg">Pipeline da Equipa</h2>
            <Link href="/admin/leads" className="flex items-center gap-1 text-[#00545F] text-xs font-semibold hover:gap-2 transition-all">Ver todos <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3">
            {PIPELINE.map(stage => {
              const count = d.counts[stage.key] ?? 0
              const pct = Math.round((count / maxCount) * 100)
              return (
                <Link key={stage.key} href={`/admin/leads?estado=${stage.key}`} className="block group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#475569] font-medium group-hover:text-[#1F3F44]">{stage.label}</span>
                    <span className="text-sm font-bold text-[#1F3F44]">{count}</span>
                  </div>
                  <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${stage.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif font-semibold text-[#1F3F44] text-lg">Recentes</h2>
            <Link href="/admin/leads" className="text-[#00545F] text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all">Ver todos <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3">
            {d.recentLeads.length === 0 && <p className="text-[#94a3b8] text-sm text-center py-4">Sem leads ainda</p>}
            {d.recentLeads.map(lead => (
              <Link key={lead.id as string} href={`/admin/leads/${lead.id}`} className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#1F3F44] font-bold text-xs font-serif flex-shrink-0 group-hover:bg-teal-50 transition-colors">
                  {(lead.nome as string).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1F3F44] truncate group-hover:text-[#00545F] transition-colors">{lead.nome as string}</p>
                  <p className="text-xs text-[#94a3b8] truncate">{formatDate(lead.created_at as string)}</p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#94a3b8] flex-shrink-0 group-hover:text-[#00545F] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   PAGE ENTRY
══════════════════════════════════════════ */
export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/admin/login')
  if (!canUser(user, 'dashboard.view')) redirect('/admin/imoveis')

  if (user.role === 'comercial') {
    return <ComercialDashboard userId={user.id} nome={user.nome} role={user.role} />
  }

  return <AdminDashboard nome={user.nome} role={user.role} />
}
