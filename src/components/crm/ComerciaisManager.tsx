'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftRight, ChevronDown, ChevronUp, Loader2, UserCircle2,
  Users, X, Inbox, Crown,
} from 'lucide-react'
import { ESTADOS } from '@/lib/crm'
import { cn } from '@/lib/utils'
import type { Lead } from '@/types/database'

interface BasicUser { id: string; nome: string; email: string; role: string }

interface Props {
  leads: Lead[]
  users: BasicUser[]
  meId: string
}

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super Admin',
  diretor: 'Diretor',
  comercial: 'Comercial',
  marketing: 'Marketing',
  gestor_projeto: 'Gestor de Projeto',
}

function statsOf(list: Lead[]) {
  const total = list.length
  const novos = list.filter((l) => l.estado === 'novo').length
  const ganhos = list.filter((l) => l.estado === 'ganho').length
  const ativos = list.filter((l) => !['ganho', 'perdido'].includes(l.estado)).length
  const conv = total ? Math.round((ganhos / total) * 100) : 0
  return { total, novos, ganhos, ativos, conv }
}

export default function ComerciaisManager({ leads, users, meId }: Props) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [transfer, setTransfer] = useState<Lead | null>(null)
  const [targetId, setTargetId] = useState('')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const { cards, unassigned } = useMemo(() => {
    const byUser = new Map<string, Lead[]>()
    for (const u of users) byUser.set(u.id, [])
    const unassigned: Lead[] = []
    for (const l of leads) {
      if (l.responsavel_id && byUser.has(l.responsavel_id)) byUser.get(l.responsavel_id)!.push(l)
      else unassigned.push(l)
    }
    const cards = users
      .map((user) => ({ user, list: byUser.get(user.id) ?? [] }))
      .filter((c) => c.list.length > 0 || ['comercial', 'diretor', 'super_admin'].includes(c.user.role))
      .sort((a, b) => b.list.length - a.list.length)
    return { cards, unassigned }
  }, [leads, users])

  const userName = (id: string | null) => users.find((u) => u.id === id)?.nome ?? '—'

  const openTransfer = (lead: Lead) => {
    setTransfer(lead)
    setTargetId('')
    setMotivo('')
    setErro('')
  }
  const closeTransfer = () => { setTransfer(null); setLoading(false) }

  const doTransfer = async () => {
    if (!targetId) { setErro('Escolhe o novo responsável.'); return }
    setLoading(true)
    setErro('')
    const target = users.find((u) => u.id === targetId)
    const res = await fetch(`/api/admin/leads/${transfer!.id}/transferir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        responsavel_id: targetId,
        responsavel_nome: target?.nome ?? 'colega',
        motivo: motivo.trim() || undefined,
      }),
    })
    if (res.ok) {
      closeTransfer()
      router.refresh()
    } else {
      const d = await res.json().catch(() => ({}))
      setErro(d.error ?? 'Erro ao transferir.')
      setLoading(false)
    }
  }

  const totalLeads = leads.length
  const totalGanhos = leads.filter((l) => l.estado === 'ganho').length
  const totalNovos = leads.filter((l) => l.estado === 'novo').length

  const renderLeadRow = (lead: Lead) => {
    const est = ESTADOS.find((e) => e.value === lead.estado) ?? ESTADOS[0]
    return (
      <div key={lead.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f8fafc] transition-colors group">
        <Link href={`/admin/leads/${lead.id}`} className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#f1f5f9] flex items-center justify-center flex-shrink-0 text-[#1F3F44] font-bold text-xs font-serif">
            {lead.nome.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1F3F44] truncate group-hover:text-[#00545F] transition-colors">{lead.nome}</p>
            {lead.imovel_titulo && <p className="text-xs text-[#94a3b8] truncate">{lead.imovel_titulo}</p>}
          </div>
          <span className={cn('hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0', est.bg, est.color)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', est.dot)} />{est.label}
          </span>
        </Link>
        <button
          onClick={() => openTransfer(lead)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] text-[#64748b] text-xs font-semibold hover:bg-white hover:text-[#00545F] hover:border-[#00545F]/30 transition-colors flex-shrink-0"
          title="Transferir para outro comercial"
        >
          <ArrowLeftRight className="w-3 h-3" /> <span className="hidden sm:inline">Transferir</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Comerciais', value: cards.length, sub: 'com leads ativos' },
          { label: 'Leads ativos', value: totalLeads, sub: 'não arquivados' },
          { label: 'Novos', value: totalNovos, sub: 'por contactar' },
          { label: 'Ganhos', value: totalGanhos, sub: 'negócios fechados' },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <p className="font-serif font-bold text-3xl text-[#1F3F44]">{k.value}</p>
            <p className="text-[#1F3F44] text-sm font-medium mt-0.5">{k.label}</p>
            <p className="text-[#94a3b8] text-xs">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Cards por comercial */}
      <div className="space-y-3">
        {cards.map(({ user, list }) => {
          const s = statsOf(list)
          const isOpen = expanded === user.id
          const isMe = user.id === meId
          return (
            <div key={user.id} className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
              {/* Header do comercial */}
              <button
                onClick={() => setExpanded(isOpen ? null : user.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-[#f8fafc] transition-colors text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1F3F44] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-serif font-bold">{user.nome.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#1F3F44] truncate">{user.nome}</p>
                    {user.role === 'super_admin' && <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                    {isMe && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#00545F]/10 text-[#00545F]">eu</span>}
                  </div>
                  <p className="text-xs text-[#94a3b8]">{ROLE_LABEL[user.role] ?? user.role}</p>
                </div>

                {/* Mini stats */}
                <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
                  <div className="text-center">
                    <p className="font-serif font-bold text-lg text-[#1F3F44]">{s.total}</p>
                    <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Leads</p>
                  </div>
                  <div className="text-center">
                    <p className="font-serif font-bold text-lg text-[#00545F]">{s.ativos}</p>
                    <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Ativos</p>
                  </div>
                  <div className="text-center">
                    <p className="font-serif font-bold text-lg text-emerald-600">{s.ganhos}</p>
                    <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Ganhos</p>
                  </div>
                  <div className="text-center">
                    <p className="font-serif font-bold text-lg text-[#1F3F44]">{s.conv}%</p>
                    <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Conv.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="sm:hidden inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-[#f1f5f9] text-xs font-bold text-[#1F3F44]">{s.total}</span>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-[#94a3b8]" /> : <ChevronDown className="w-5 h-5 text-[#94a3b8]" />}
                </div>
              </button>

              {/* Lista de leads do comercial */}
              {isOpen && (
                <div className="border-t border-[#e2e8f0] p-2">
                  {list.length === 0 ? (
                    <p className="text-center text-sm text-[#94a3b8] py-6">Sem leads atribuídos.</p>
                  ) : (
                    <div className="space-y-0.5">{list.map(renderLeadRow)}</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sem responsável */}
      {unassigned.length > 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-amber-300 overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === '__none__' ? null : '__none__')}
            className="w-full flex items-center gap-4 p-4 hover:bg-amber-50/50 transition-colors text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Inbox className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#1F3F44]">Sem responsável atribuído</p>
              <p className="text-xs text-[#94a3b8]">{unassigned.length} {unassigned.length === 1 ? 'lead' : 'leads'} à espera de atribuição</p>
            </div>
            {expanded === '__none__' ? <ChevronUp className="w-5 h-5 text-[#94a3b8]" /> : <ChevronDown className="w-5 h-5 text-[#94a3b8]" />}
          </button>
          {expanded === '__none__' && (
            <div className="border-t border-amber-200 p-2">
              <div className="space-y-0.5">{unassigned.map(renderLeadRow)}</div>
            </div>
          )}
        </div>
      )}

      {cards.length === 0 && unassigned.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-16 text-center">
          <Users className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
          <p className="font-serif font-semibold text-[#1F3F44] mb-1">Sem comerciais com leads</p>
          <p className="text-[#94a3b8] text-sm">Atribui leads aos comerciais para os veres aqui.</p>
        </div>
      )}

      {/* Modal Transferir */}
      {transfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeTransfer} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00545F]/10 flex items-center justify-center">
                  <ArrowLeftRight className="w-5 h-5 text-[#00545F]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F3F44] text-base">Transferir Lead</h3>
                  <p className="text-xs text-[#94a3b8] truncate max-w-[220px]">{transfer.nome}</p>
                </div>
              </div>
              <button onClick={closeTransfer} className="p-1.5 rounded-lg text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#1F3F44] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-2 text-xs text-[#64748b] bg-[#f8fafc] rounded-lg p-3 border border-[#e2e8f0]">
              <UserCircle2 className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
              Responsável atual: <strong className="text-[#1F3F44]">{userName(transfer.responsavel_id)}</strong>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Novo responsável *</label>
              <select
                autoFocus
                value={targetId}
                onChange={(e) => { setTargetId(e.target.value); setErro('') }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all bg-white"
              >
                <option value="">— Escolher comercial —</option>
                {users
                  .filter((u) => u.id !== transfer.responsavel_id)
                  .map((u) => (
                    <option key={u.id} value={u.id}>{u.nome} · {ROLE_LABEL[u.role] ?? u.role}</option>
                  ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Motivo (opcional)</label>
              <input
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: redistribuição de carteira"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all"
              />
            </div>

            {erro && <p className="text-red-500 text-xs mb-4">{erro}</p>}

            <div className="flex gap-3">
              <button onClick={closeTransfer} className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-[#475569] text-sm font-semibold hover:bg-[#f8fafc] transition-colors">
                Cancelar
              </button>
              <button
                onClick={doTransfer}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-[#00545F] text-white text-sm font-semibold hover:bg-[#006B78] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />}
                Transferir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
