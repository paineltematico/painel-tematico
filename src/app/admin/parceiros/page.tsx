'use client'

import { useState, useEffect } from 'react'
import { Handshake, ExternalLink, Calendar, Building2, Copy, Check, User, ChevronDown, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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
  visitas_parceiros?: Visita[]
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

export default function ParceirosPage() {
  const [visitas, setVisitas]       = useState<Visita[]>([])
  const [parceiros, setParceiros]   = useState<Parceiro[]>([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState<'visitas' | 'parceiros'>('visitas')
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [copied, setCopied]         = useState(false)

  const bookingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/agendar-visita`
    : '/agendar-visita'

  useEffect(() => {
    Promise.all([
      supabase
        .from('visitas_parceiros')
        .select('*, imoveis(titulo, tipologia, cidade), parceiros(nome, empresa, ami)')
        .order('data_visita', { ascending: false }),
      supabase
        .from('parceiros')
        .select('*, visitas_parceiros(id)')
        .order('created_at', { ascending: false }),
    ]).then(([{ data: v }, { data: p }]) => {
      setVisitas((v ?? []) as Visita[])
      setParceiros((p ?? []) as Parceiro[])
      setLoading(false)
    })
  }, [])

  const updateEstado = async (id: string, estado: string) => {
    await supabase.from('visitas_parceiros').update({ estado } as never).eq('id', id)
    setVisitas(vs => vs.map(v => v.id === id ? { ...v, estado } : v))
  }

  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
        <div className="flex items-center gap-2 bg-white border border-[#E8E3E3] rounded-xl px-4 py-2.5">
          <code className="text-xs text-[#1F3F44] font-mono hidden sm:block">/agendar-visita</code>
          <button onClick={copyLink} className="flex items-center gap-1.5 text-xs font-semibold text-[#00545F] hover:text-[#006B78] ml-1">
            {copied ? <><Check className="w-3.5 h-3.5" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar link</>}
          </button>
          <a href="/agendar-visita" target="_blank" className="text-[#94a3b8] hover:text-[#1F3F44]">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

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

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f1f5f9] rounded-xl p-1 mb-4 w-fit">
        {(['visitas', 'parceiros'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-white text-[#1F3F44] shadow-sm' : 'text-[#64748b] hover:text-[#1F3F44]'}`}>
            {t === 'visitas' ? `Visitas (${visitas.length})` : `Mediadores (${parceiros.length})`}
          </button>
        ))}
      </div>

      {/* Visitas tab */}
      {tab === 'visitas' && (
        <div className="bg-white rounded-2xl border border-[#E8E3E3] overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-[#94a3b8] text-sm">A carregar...</div>
          ) : visitas.length === 0 ? (
            <div className="p-14 text-center">
              <Calendar className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
              <p className="font-serif font-semibold text-[#1F3F44]">Sem visitas agendadas</p>
              <p className="text-[#94a3b8] text-sm mt-1">Partilha o link com os mediadores parceiros.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  {['Data', 'Imóvel', 'Mediador', 'Cliente', 'Estado', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
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
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border cursor-pointer focus:outline-none ${ESTADO_COLORS[v.estado] ?? ESTADO_COLORS.pendente}`}
                      >
                        {Object.entries(ESTADO_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#94a3b8]">
                      {formatDate(v.created_at)}
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
              <p className="font-serif font-semibold text-[#1F3F44]">Nenhum mediador registado</p>
              <p className="text-[#94a3b8] text-sm mt-1">Os mediadores são criados automaticamente quando agendam a primeira visita.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#e2e8f0]">
              {parceiros.map(p => (
                <li key={p.id}>
                  <button className="w-full text-left px-5 py-4 hover:bg-[#f8fafc] flex items-center gap-4"
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
    </div>
  )
}
