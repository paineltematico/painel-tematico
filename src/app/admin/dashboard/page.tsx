import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ROLE_LABELS } from '@/lib/auth'
import { getCurrentUser } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import {
  TrendingUp, Users, Home, Building2, Calendar,
  ArrowRight, ArrowUpRight, Activity, Target,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
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
  ] = await Promise.all([
    supabase.from('contactos_imoveis').select('*', { count: 'exact', head: true }),
    supabase.from('contactos_imoveis').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    supabase.from('contactos_imoveis').select('*', { count: 'exact', head: true }).eq('estado', 'novo'),
    supabase.from('contactos_imoveis').select('estado'),
    supabase.from('imoveis').select('*', { count: 'exact', head: true }),
    supabase.from('imoveis').select('*', { count: 'exact', head: true }).eq('disponivel', true),
    supabase.from('projetos').select('*', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('contactos_imoveis').select('id,nome,email,estado,created_at,imovel_titulo').order('created_at', { ascending: false }).limit(5),
  ])

  const counts: Record<string, number> = {}
  for (const row of leadsByEstado ?? []) {
    counts[row.estado] = (counts[row.estado] ?? 0) + 1
  }

  const ganhos = counts['ganho'] ?? 0
  const conversao = (totalLeads ?? 0) > 0 ? Math.round((ganhos / (totalLeads ?? 1)) * 100) : 0

  return {
    totalLeads: totalLeads ?? 0,
    leadsThisMonth: leadsThisMonth ?? 0,
    leadsNovos: leadsNovos ?? 0,
    ganhos,
    conversao,
    totalImoveis: totalImoveis ?? 0,
    imoveisDisponiveis: imoveisDisponiveis ?? 0,
    totalProjetos: totalProjetos ?? 0,
    counts,
    recentLeads: recentLeads ?? [],
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

function StatCard({ label, value, sub, icon: Icon, accent = false, href }: {
  label: string; value: string | number; sub: string
  icon: React.ElementType; accent?: boolean; href?: string
}) {
  const inner = (
    <div className={`bg-white rounded-2xl border p-5 flex items-start gap-4 hover:shadow-md transition-shadow ${accent ? 'border-[#00545F]/30 shadow-sm' : 'border-[#e2e8f0]'}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent ? 'bg-teal-50' : 'bg-[#f8fafc]'}`}>
        <Icon className={`w-5 h-5 ${accent ? 'text-[#00545F]' : 'text-[#64748b]'}`} />
      </div>
      <div>
        <p className={`font-serif font-bold text-3xl ${accent ? 'text-[#00545F]' : 'text-[#1F3F44]'}`}>{value}</p>
        <p className="text-[#1F3F44] text-sm font-semibold mt-0.5">{label}</p>
        <p className="text-[#94a3b8] text-xs">{sub}</p>
      </div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr))
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/admin/login')

  const d = await getDashboardData()
  const maxCount = Math.max(...PIPELINE.map((p) => d.counts[p.key] ?? 0), 1)

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">
          Olá, {user.nome.split(' ')[0]} 👋
        </h1>
        <p className="text-[#64748b] text-sm mt-0.5">
          {ROLE_LABELS[user.role]} · {new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Leads este mês"     value={d.leadsThisMonth}     sub="novos contactos"             icon={TrendingUp} accent href="/admin/leads" />
        <StatCard label="Por contactar"      value={d.leadsNovos}         sub="aguardam resposta"           icon={Activity}   accent={d.leadsNovos > 0} href="/admin/leads?estado=novo" />
        <StatCard label="Total leads"        value={d.totalLeads}         sub="todos os tempos"             icon={Users}      href="/admin/leads" />
        <StatCard label="Taxa de conversão"  value={`${d.conversao}%`}    sub={`${d.ganhos} negócios fechados`} icon={Target} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Imóveis disponíveis" value={d.imoveisDisponiveis} sub={`de ${d.totalImoveis} total`} icon={Home}     href="/admin/imoveis" />
        <StatCard label="Projetos ativos"     value={d.totalProjetos}      sub="em curso"                    icon={Building2} href="/admin/projetos" />
        <div className="col-span-2 bg-[#1F3F44] rounded-2xl p-5 flex flex-col justify-between">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Receita potencial</p>
          <p className="font-serif font-bold text-3xl text-white">Em construção</p>
          <p className="text-slate-400 text-xs mt-1">Ligação de preços em breve</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pipeline funnel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif font-semibold text-[#1F3F44] text-lg">Pipeline de Vendas</h2>
            <Link href="/admin/leads" className="flex items-center gap-1 text-[#00545F] text-xs font-semibold hover:gap-2 transition-all">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {PIPELINE.map((stage) => {
              const count = d.counts[stage.key] ?? 0
              const pct = Math.round((count / maxCount) * 100)
              return (
                <div key={stage.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#475569] font-medium">{stage.label}</span>
                    <span className="text-sm font-bold text-[#1F3F44]">{count}</span>
                  </div>
                  <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${stage.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent leads */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif font-semibold text-[#1F3F44] text-lg">Recentes</h2>
            <Link href="/admin/leads" className="text-[#00545F] text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {d.recentLeads.length === 0 && (
              <p className="text-[#94a3b8] text-sm text-center py-4">Sem leads ainda</p>
            )}
            {d.recentLeads.map((lead) => (
              <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#1F3F44] font-bold text-xs font-serif flex-shrink-0 group-hover:bg-teal-50 transition-colors">
                  {(lead.nome as string).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1F3F44] truncate group-hover:text-[#00545F] transition-colors">
                    {lead.nome as string}
                  </p>
                  <p className="text-xs text-[#94a3b8] truncate">
                    {formatDate(lead.created_at as string)}
                  </p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#94a3b8] flex-shrink-0 group-hover:text-[#00545F] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/admin/imoveis/novo',  label: 'Novo imóvel',   icon: Home },
          { href: '/admin/leads/novo',    label: 'Novo lead',     icon: Users },
          { href: '/admin/projetos/novo', label: 'Novo projeto',  icon: Building2 },
          { href: '/admin/blog/novo',     label: 'Novo artigo',   icon: Calendar },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white border border-[#e2e8f0] text-sm font-semibold text-[#475569] hover:text-[#1F3F44] hover:border-[#00545F]/30 hover:shadow-sm transition-all"
          >
            <Icon className="w-4 h-4 text-[#00545F]" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
