'use client'

import { useState, useEffect } from 'react'
import {
  Handshake, ExternalLink, Calendar, Building2, Copy, Check, User,
  ChevronDown, ChevronRight, Plus, X, Loader2,
  Archive, Trash2, RotateCcw, AlertTriangle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { canUser } from '@/lib/permissions'
import type { AdminRole } from '@/lib/auth'

interface Visita {
  id: string
  parceiro_id: string | null
  cliente_nome: string
  data_visita: string
  hora_visita: string
  estado: string
  notas: string | null
  imovel_outro: string | null
  created_at: string
  arquivado?: boolean
  imoveis?: { titulo: string; tipologia: string; cidade: string } | null
  parceiros?: { nome: string; empresa: string | null; ami: string | null } | null
}

interface Parceiro {
  id: string
  nome: string
  empresa: string | null
  email: string | null
  telefone: string | null
  ami: string | null
  ativo: boolean
  created_at: string
  arquivado?: boolean
  visitas_parceiros?: { id: string }[]
}

interface Me {
  role: AdminRole
  permissions_extra?: string[]
  permissions_denied?: string[]
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d))
}

const ESTADO_COLORS: Record<string, string> = {
  pendente:   'bg-amber-100 text-amber-700 border-amber-200',
  confirmado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelado:  'bg-red-100 text-red-600 border-red-200',
  realizado:  'bg-[#00545F]/10 text-[#00545F] border-[#00545F]/20',
}

const ESTADO_LABELS: Record<string, string> = {
  pendente: 'Pendente', confirmado: 'Confirmado', cancelado: 'Cancelado', realizado: 'Realizado'
}

const EMPTY_FORM = { nome: '', empresa: '', ami: '', email: '', telefone: '' }

export default function ParceirosPage() {
  const [visitas, setVisitas]       = useState<Visita[]>([])
  const [parceiros, setParceiros]   = useState<Parceiro[]>([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState<'visitas' | 'parceiros'>('visitas')
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [copied, setCopied]         = useState(false)
  const [showForm, setShowForm]     = useState(false)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState('')
  const [me, setMe]                 = useState<Me | null>(null)
  const [verArquivados, setVerArquivados] = useState(false)
  const [confirmDestroy, setConfirmDestroy] = useState<{ type: 'parceiro' | 'visita'; id: string; nome: string } | null>(null)
  const [busy, setBusy]             = useState<string | null>(null)

  const canArchive = me ? canUser(me, 'parceiros.archive') : false
  const canDelete  = me ? canUser(me, 'parceiros.delete')  : false

  const bookingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/agendar-visita`
    : '/agendar-visita'

  useEffect(() => {
    let active = true
    ;(async () => {
      const [{ data: v }, { data: p }] = await Promise.all([
        supabase
          .from('visitas_parceiros')
          .select('*, imoveis(titulo, tipologia, cidade), parceiros(nome, empresa, ami)')
          .eq('arquivado', verArquivados)
          .order('data_visita', { ascending: false }),
        supabase
          .from('parceiros')
          .select('*, visitas_parceiros(id)')
          .eq('arquivado', verArquivados)
          .order('created_at', { ascending: false }),
      ])
      if (!active) return
      setVisitas((v ?? []) as Visita[])
      setParceiros((p ?? []) as Parceiro[])
      setLoading(false)
    })()
    return () => { active = false }
  }, [verArquivados])

  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d?.user) setMe(d.user) })
      .catch(() => {})
  }, [])

  const updateEstado = async (id: string, estado: string) => {
    await supabase.from('visitas_parceiros').update({ estado } as never).eq('id', id)
    setVisitas(vs => vs.map(v => v.id === id ? { ...v, estado } : v))
  }

  // ── Arquivar / Restaurar / Destruir ──
  const archiveParceiro = async (id: string, arquivar: boolean) => {
    setBusy(id)
    const res = await fetch(`/api/admin/parceiros/${id}/arquivar`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ arquivado: arquivar }),
    })
    if (res.ok) setParceiros(ps => ps.filter(p => p.id !== id))
    setBusy(null)
  }
  const archiveVisita = async (id: string, arquivar: boolean) => {
    setBusy(id)
    const res = await fetch(`/api/admin/visitas/${id}/arquivar`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ arquivado: arquivar }),
    })
    if (res.ok) setVisitas(vs => vs.filter(v => v.id !== id))
    setBusy(null)
  }
  const doDestroy = async () => {
    if (!confirmDestroy) return
    const { type, id } = confirmDestroy
    setBusy(id)
    const url = type === 'parceiro' ? `/api/admin/parceiros/${id}/destruir` : `/api/admin/visitas/${id}/destruir`
    const res = await fetch(url, { method: 'DELETE' })
    if (res.ok) {
      if (type === 'parceiro') setParceiros(ps => ps.filter(p => p.id !== id))
      else setVisitas(vs => vs.filter(v => v.id !== id))
    }
    setBusy(null)
    setConfirmDestroy(null)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const createParceiro = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome.trim()) return
    setSaving(true)
    setFormError('')
    const { data, error } = await supabase.from('parceiros').insert({
      nome:        form.nome.trim(),
      empresa:     form.empresa.trim() || null,
      ami:         form.ami.trim()     || null,
      email:       form.email.trim()   || null,
      telefone:    form.telefone.trim()|| null,
      notas:       null,
      token_visita:null,
      ativo:       true,
    }).select('*, visitas_parceiros(id)').single()
    setSaving(false)
    if (error) { setFormError('Erro ao guardar. Tente novamente.'); return }
    if (!verArquivados) setParceiros(ps => [data as Parceiro, ...ps])
    setForm(EMPTY_FORM)
    setShowForm(false)
    setTab('parceiros')
  }

  // Botão de ações reutilizável
  const RowActions = ({ type, id, nome }: { type: 'parceiro' | 'visita'; id: string; nome: string }) => (
    <div className="flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
      {!verArquivados && canArchive && (
        <button
          onClick={() => type === 'parceiro' ? archiveParceiro(id, true) : archiveVisita(id, true)}
          disabled={busy === id}
          title="Arquivar"
          className="p-2 rounded-lg text-[#94a3b8] hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
        >
          {busy === id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
        </button>
      )}
      {verArquivados && canArchive && (
        <button
          onClick={() => type === 'parceiro' ? archiveParceiro(id, false) : archiveVisita(id, false)}
          disabled={busy === id}
          title="Restaurar"
          className="p-2 rounded-lg text-[#94a3b8] hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
        >
          {busy === id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
        </button>
      )}
      {canDelete && (
        <button
          onClick={() => setConfirmDestroy({ type, id, nome })}
          disabled={busy === id}
          title="Eliminar definitivamente"
          className="p-2 rounded-lg text-[#94a3b8] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00545F]/10 flex items-center justify-center">
            <Handshake className="w-5 h-5 text-[#00545F]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Parceiros</h1>
            <p className="text-[#64748b] text-sm">{parceiros.length} mediadores · {visitas.length} visitas</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex items-center gap-2 bg-white border border-[#E8E3E3] rounded-xl px-4 py-2.5">
            <code className="text-xs text-[#1F3F44] font-mono hidden sm:block">/agendar-visita</code>
            <button onClick={copyLink} className="flex items-center gap-1.5 text-xs font-semibold text-[#00545F] hover:text-[#006B78] ml-1">
              {copied ? <><Check className="w-3.5 h-3.5" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar link</>}
            </button>
            <a href="/agendar-visita" target="_blank" className="text-[#94a3b8] hover:text-[#1F3F44]">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <button
            onClick={() => { setShowForm(v => !v); setTab('parceiros'); setFormError('') }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${showForm ? 'bg-[#f1f5f9] text-[#64748b] border border-[#E8E3E3]' : 'bg-[#00545F] text-white hover:bg-[#006B78]'}`}
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancelar' : 'Novo parceiro'}
          </button>
        </div>
      </div>

      {/* New partner inline form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#00545F]/20 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 bg-[#00545F]/5 border-b border-[#00545F]/10">
            <h2 className="font-serif font-semibold text-[#1F3F44] text-base">Novo mediador parceiro</h2>
          </div>
          <form onSubmit={createParceiro} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Nome completo *</label>
                <input
                  value={form.nome} onChange={set('nome')} required
                  placeholder="João Silva"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Imobiliária / Empresa</label>
                <input
                  value={form.empresa} onChange={set('empresa')}
                  placeholder="Remax Braga"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Código AMI</label>
                <input
                  value={form.ami} onChange={set('ami')}
                  placeholder="12345"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email" value={form.email} onChange={set('email')}
                  placeholder="joao@remax.pt"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Telemóvel</label>
                <input
                  type="tel" value={form.telefone} onChange={set('telefone')}
                  placeholder="+351 9XX XXX XXX"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all"
                />
              </div>
            </div>
            {formError && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{formError}</p>
            )}
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError('') }}
                className="px-5 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#64748b] font-medium hover:bg-[#f8fafc] transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving || !form.nome.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00545F] text-white text-sm font-semibold hover:bg-[#006B78] transition-colors disabled:opacity-50 shadow-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Criar mediador
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total visitas',  value: visitas.length },
          { label: 'Pendentes',      value: visitas.filter(v => v.estado === 'pendente').length, warn: true },
          { label: 'Realizadas',     value: visitas.filter(v => v.estado === 'realizado').length },
          { label: 'Mediadores',     value: parceiros.length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E8E3E3] p-4 text-center">
            <p className={`font-serif text-2xl font-bold ${s.warn && s.value > 0 ? 'text-amber-600' : 'text-[#1F3F44]'}`}>{s.value}</p>
            <p className="text-xs text-[#94a3b8] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + toggle arquivados */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex gap-1 bg-[#f1f5f9] rounded-xl p-1 w-fit">
          {(['visitas', 'parceiros'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-white text-[#1F3F44] shadow-sm' : 'text-[#64748b] hover:text-[#1F3F44]'}`}>
              {t === 'visitas' ? `Visitas (${visitas.length})` : `Mediadores (${parceiros.length})`}
            </button>
          ))}
        </div>
        {canArchive && (
          <button
            onClick={() => { setVerArquivados(v => !v); setExpanded(null); setLoading(true) }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${verArquivados ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-[#64748b] border-[#E8E3E3] hover:bg-[#f8fafc]'}`}
          >
            <Archive className="w-3.5 h-3.5" />
            {verArquivados ? 'A ver arquivados' : 'Arquivados'}
          </button>
        )}
      </div>

      {verArquivados && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <Archive className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            A ver registos <strong>arquivados</strong>. Podes restaurá-los{canDelete ? ' ou eliminá-los definitivamente' : ''}.
          </p>
        </div>
      )}

      {/* Visitas tab */}
      {tab === 'visitas' && (
        <div className="bg-white rounded-2xl border border-[#E8E3E3] overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-[#94a3b8] text-sm">A carregar...</div>
          ) : visitas.length === 0 ? (
            <div className="p-14 text-center">
              <Calendar className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
              <p className="font-serif font-semibold text-[#1F3F44]">{verArquivados ? 'Sem visitas arquivadas' : 'Sem visitas agendadas'}</p>
              <p className="text-[#94a3b8] text-sm mt-1">{verArquivados ? 'As visitas arquivadas aparecem aqui.' : 'Partilha o link com os mediadores parceiros.'}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  {['Data', 'Imóvel', 'Mediador', 'Cliente', 'Estado', 'Ações'].map(h => (
                    <th key={h} className={`px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide ${h === 'Ações' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {visitas.map(v => (
                  <tr key={v.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-5 py-4 text-sm text-[#1F3F44] font-medium whitespace-nowrap">
                      <p>{formatDate(v.data_visita)}</p>
                      <p className="text-xs text-[#94a3b8]">{v.hora_visita.slice(0, 5)}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#1F3F44] max-w-[160px]">
                      <p className="truncate">{v.imoveis?.titulo ?? v.imovel_outro ?? <span className="text-[#94a3b8]">—</span>}</p>
                      {v.imoveis && <p className="text-xs text-[#94a3b8]">{v.imoveis.tipologia} · {v.imoveis.cidade}</p>}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      {v.parceiros ? (
                        <div>
                          <p className="text-[#1F3F44] font-medium">{v.parceiros.nome}</p>
                          {v.parceiros.empresa && <p className="text-xs text-[#94a3b8]">{v.parceiros.empresa}</p>}
                          {v.parceiros.ami && <p className="text-xs text-[#94a3b8]">AMI {v.parceiros.ami}</p>}
                        </div>
                      ) : <span className="text-[#94a3b8] text-xs">—</span>}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#64748b]">
                      <p className="flex items-center gap-1"><User className="w-3 h-3" />{v.cliente_nome}</p>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={v.estado}
                        onChange={e => updateEstado(v.id, e.target.value)}
                        disabled={verArquivados}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border cursor-pointer focus:outline-none disabled:opacity-60 disabled:cursor-default ${ESTADO_COLORS[v.estado] ?? ESTADO_COLORS.pendente}`}
                      >
                        {Object.entries(ESTADO_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <RowActions type="visita" id={v.id} nome={v.cliente_nome} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Parceiros tab */}
      {tab === 'parceiros' && (
        <div className="bg-white rounded-2xl border border-[#E8E3E3] overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-[#94a3b8] text-sm">A carregar...</div>
          ) : parceiros.length === 0 ? (
            <div className="p-14 text-center">
              <Handshake className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
              <p className="font-serif font-semibold text-[#1F3F44]">{verArquivados ? 'Sem mediadores arquivados' : 'Nenhum mediador registado'}</p>
              <p className="text-[#94a3b8] text-sm mt-1">{verArquivados ? 'Os mediadores arquivados aparecem aqui.' : 'Os mediadores são criados automaticamente quando agendam a primeira visita.'}</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#e2e8f0]">
              {parceiros.map(p => (
                <li key={p.id}>
                  <div className="px-5 py-4 hover:bg-[#f8fafc] flex items-center gap-4">
                    <button className="flex items-center gap-4 flex-1 min-w-0 text-left"
                      onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                      <div className="w-9 h-9 rounded-full bg-[#1F3F44] text-white flex items-center justify-center font-serif font-bold text-sm flex-shrink-0">
                        {p.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1F3F44] text-sm">{p.nome}</p>
                        <div className="flex gap-3 mt-0.5">
                          {p.empresa && <span className="text-xs text-[#64748b] flex items-center gap-1"><Building2 className="w-3 h-3" />{p.empresa}</span>}
                          {p.ami && <span className="text-xs text-[#94a3b8]">AMI {p.ami}</span>}
                        </div>
                      </div>
                      <div className="text-center flex-shrink-0">
                        <p className="font-serif font-bold text-lg text-[#1F3F44]">{p.visitas_parceiros?.length ?? 0}</p>
                        <p className="text-xs text-[#94a3b8]">visitas</p>
                      </div>
                      {expanded === p.id ? <ChevronDown className="w-4 h-4 text-[#94a3b8]" /> : <ChevronRight className="w-4 h-4 text-[#94a3b8]" />}
                    </button>
                    <RowActions type="parceiro" id={p.id} nome={p.nome} />
                  </div>
                  {expanded === p.id && (
                    <div className="bg-[#f8fafc] border-t border-[#e2e8f0] px-5 py-3 text-xs text-[#64748b] flex gap-4">
                      {p.email    && <span>✉️ {p.email}</span>}
                      {p.telefone && <span>📞 {p.telefone}</span>}
                      <span>📅 Desde {formatDate(p.created_at)}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modal confirmar destruição */}
      {confirmDestroy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDestroy(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1F3F44] text-base">Eliminar definitivamente</h3>
                <p className="text-xs text-red-500">Esta ação é irreversível</p>
              </div>
            </div>
            <p className="text-sm text-[#475569] mb-5">
              {confirmDestroy.type === 'parceiro'
                ? <>O mediador <strong>{confirmDestroy.nome}</strong> e todas as suas visitas serão <strong className="text-red-600">apagados permanentemente</strong>.</>
                : <>A visita de <strong>{confirmDestroy.nome}</strong> será <strong className="text-red-600">apagada permanentemente</strong>.</>}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDestroy(null)} className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-[#475569] text-sm font-semibold hover:bg-[#f8fafc] transition-colors">
                Cancelar
              </button>
              <button
                onClick={doDestroy}
                disabled={busy === confirmDestroy.id}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {busy === confirmDestroy.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
