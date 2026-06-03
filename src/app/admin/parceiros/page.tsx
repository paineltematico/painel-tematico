'use client'

import { useState, useEffect } from 'react'
import { Handshake, ExternalLink, ChevronDown, ChevronRight, Calendar, User, Building2, Copy, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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

interface Visita {
  id: string
  cliente_nome: string
  cliente_email: string | null
  cliente_telef: string | null
  data_visita: string
  hora_visita: string
  estado: string
  imovel_outro: string | null
  created_at: string
  imoveis?: { titulo: string; tipologia: string; cidade: string } | null
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

export default function ParceirosPage() {
  const [parceiros, setParceiros]   = useState<Parceiro[]>([])
  const [loading, setLoading]       = useState(true)
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [copied, setCopied]         = useState(false)

  const bookingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/agendar-visita`
    : '/agendar-visita'

  useEffect(() => {
    supabase
      .from('parceiros')
      .select(`*, visitas_parceiros(*, imoveis(titulo, tipologia, cidade))`)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setParceiros((data ?? []) as Parceiro[])
        setLoading(false)
      })
  }, [])

  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalVisitas = parceiros.reduce((acc, p) => acc + (p.visitas_parceiros?.length ?? 0), 0)

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00545F]/10 flex items-center justify-center">
            <Handshake className="w-5 h-5 text-[#00545F]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Parceiros</h1>
            <p className="text-[#64748b] text-sm">{parceiros.length} mediadores · {totalVisitas} visitas agendadas</p>
          </div>
        </div>

        {/* Link de agendamento */}
        <div className="flex items-center gap-2 bg-white border border-[#E8E3E3] rounded-xl px-4 py-2.5">
          <span className="text-xs text-[#64748b] hidden sm:block">Link público:</span>
          <code className="text-xs text-[#1F3F44] font-mono hidden sm:block">/agendar-visita</code>
          <button onClick={copyLink} className="flex items-center gap-1.5 text-xs font-semibold text-[#00545F] hover:text-[#006B78] transition-colors ml-1">
            {copied ? <><Check className="w-3.5 h-3.5" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
          </button>
          <a href="/agendar-visita" target="_blank" className="text-[#94a3b8] hover:text-[#1F3F44] transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Mediadores',  value: parceiros.length },
          { label: 'Visitas',     value: totalVisitas },
          { label: 'Este mês',    value: parceiros.reduce((acc, p) =>
              acc + (p.visitas_parceiros?.filter(v => new Date(v.created_at).getMonth() === new Date().getMonth()).length ?? 0), 0) },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E8E3E3] p-5 text-center">
            <p className="font-serif text-3xl font-bold text-[#1F3F44]">{s.value}</p>
            <p className="text-xs text-[#94a3b8] mt-1 uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-[#E8E3E3] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#94a3b8] text-sm">A carregar...</div>
        ) : parceiros.length === 0 ? (
          <div className="p-16 text-center">
            <Handshake className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
            <p className="font-serif font-semibold text-[#1F3F44]">Nenhum parceiro ainda</p>
            <p className="text-[#94a3b8] text-sm mt-1">Os mediadores aparecem aqui automaticamente quando submetem o formulário de agendamento.</p>
            <a
              href="/agendar-visita"
              target="_blank"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-[#00545F] text-white text-sm font-semibold hover:bg-[#006B78] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Ver página de agendamento
            </a>
          </div>
        ) : (
          <ul className="divide-y divide-[#E8E3E3]">
            {parceiros.map(p => (
              <li key={p.id}>
                {/* Row */}
                <button
                  className="w-full text-left px-5 py-4 hover:bg-[#f8fafc] transition-colors flex items-center gap-4"
                  onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-[#1F3F44] flex items-center justify-center text-white font-serif font-bold text-sm flex-shrink-0">
                    {p.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1F3F44] text-sm">{p.nome}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {p.empresa && <span className="text-xs text-[#64748b] flex items-center gap-1"><Building2 className="w-3 h-3" />{p.empresa}</span>}
                      {p.ami     && <span className="text-xs text-[#94a3b8]">AMI {p.ami}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center hidden sm:block">
                      <p className="font-serif font-bold text-lg text-[#1F3F44]">{p.visitas_parceiros?.length ?? 0}</p>
                      <p className="text-xs text-[#94a3b8]">visitas</p>
                    </div>
                    <div className="text-xs text-[#94a3b8] hidden md:block">{formatDate(p.created_at)}</div>
                    {expanded === p.id ? <ChevronDown className="w-4 h-4 text-[#94a3b8]" /> : <ChevronRight className="w-4 h-4 text-[#94a3b8]" />}
                  </div>
                </button>

                {/* Expanded visitas */}
                {expanded === p.id && (
                  <div className="bg-[#f8fafc] border-t border-[#E8E3E3] px-5 py-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs text-[#64748b]">
                      {p.email    && <span>✉️ {p.email}</span>}
                      {p.telefone && <span>📞 {p.telefone}</span>}
                    </div>

                    {(p.visitas_parceiros?.length ?? 0) === 0 ? (
                      <p className="text-sm text-[#94a3b8] py-2">Nenhuma visita registada.</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">Visitas</p>
                        {p.visitas_parceiros?.map(v => (
                          <div key={v.id} className="bg-white rounded-xl border border-[#E8E3E3] px-4 py-3 flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-[#00545F] mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-[#1F3F44]">
                                  {v.imoveis?.titulo ?? v.imovel_outro ?? 'Imóvel não especificado'}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ESTADO_COLORS[v.estado] ?? ESTADO_COLORS.pendente}`}>
                                  {v.estado}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-[#64748b] flex-wrap">
                                <span className="flex items-center gap-1"><User className="w-3 h-3" />{v.cliente_nome}</span>
                                <span>{formatDate(v.data_visita)} às {v.hora_visita.slice(0, 5)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
