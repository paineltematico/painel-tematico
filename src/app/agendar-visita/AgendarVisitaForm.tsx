'use client'

import { useState, useRef } from 'react'
import { CheckCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

interface Imovel { id: string; titulo: string; tipologia: string; cidade: string; tipo: string }
interface Props  { imoveis: Imovel[] }

const inputCls = 'w-full px-4 py-3 rounded-xl border border-[#E8E3E3] bg-white text-sm text-[#1F3F44] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all'
const labelCls = 'block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2'

const SECTION = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-[#E8E3E3] p-6 space-y-4">
    <h2 className="font-serif font-semibold text-[#1F3F44] text-base border-b border-[#f1f5f9] pb-3">{title}</h2>
    {children}
  </div>
)

// Generate next 60 days
function getDays() {
  const days = []
  const today = new Date()
  const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  for (let i = 0; i < 60; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    const label = i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : `${DIAS[d.getDay()]} ${d.getDate()}`
    const sub   = i <= 1 ? `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}` : MESES[d.getMonth()]
    days.push({ iso, label, sub, isWeekend: d.getDay() === 0 || d.getDay() === 6 })
  }
  return days
}

// Time slots 8:00 → 19:30 every 30 min
function getSlots() {
  const slots = []
  for (let h = 8; h <= 19; h++) {
    for (const m of [0, 30]) {
      if (h === 19 && m === 30) break
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
}

const DAYS  = getDays()
const SLOTS = getSlots()

export default function AgendarVisitaForm({ imoveis }: Props) {
  const [form, setForm] = useState({
    nome: '', empresa: '', ami: '', email: '', telefone: '',
    imovel_id: '', imovel_outro: '',
    cliente_nome: '', cliente_email: '', cliente_telef: '',
    data_visita: '', hora_visita: '', notas: '',
  })
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')
  const daysRef = useRef<HTMLDivElement>(null)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const setVal = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const imovelOutro = form.imovel_id === '__outro__'

  const scrollDays = (dir: number) => {
    daysRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/agendar-visita', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, imovel_id: imovelOutro ? null : form.imovel_id || null }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Erro ao submeter. Tente novamente.'); return }
    setSuccess(true)
  }

  if (success) return (
    <div className="bg-white rounded-2xl border border-[#E8E3E3] p-10 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
        <CheckCircle className="w-8 h-8 text-emerald-600" />
      </div>
      <h2 className="font-serif text-2xl font-bold text-[#1F3F44] mb-2">Visita agendada!</h2>
      <p className="text-[#64748b] text-sm max-w-sm mx-auto">
        O pedido foi registado. A equipa Painel Temático entrará em contacto para confirmação.
      </p>
      <p className="text-[#1F3F44] font-semibold mt-4">
        {DAYS.find(d => d.iso === form.data_visita)?.label} às {form.hora_visita}
      </p>
      <button
        onClick={() => { setSuccess(false); setForm({ nome: '', empresa: '', ami: '', email: '', telefone: '', imovel_id: '', imovel_outro: '', cliente_nome: '', cliente_email: '', cliente_telef: '', data_visita: '', hora_visita: '', notas: '' }) }}
        className="mt-6 px-6 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#64748b] font-medium hover:bg-[#f8fafc] transition-colors"
      >
        Agendar outra visita
      </button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Dados do mediador */}
      <SECTION title="👤 Dados do mediador">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Nome completo *</label>
            <input value={form.nome} onChange={set('nome')} required className={inputCls} placeholder="João Silva" />
          </div>
          <div>
            <label className={labelCls}>Imobiliária / Empresa *</label>
            <input value={form.empresa} onChange={set('empresa')} required className={inputCls} placeholder="Remax Braga" />
          </div>
          <div>
            <label className={labelCls}>Código AMI *</label>
            <input value={form.ami} onChange={set('ami')} required className={inputCls} placeholder="12345" />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={form.email} onChange={set('email')} className={inputCls} placeholder="joao@remax.pt" />
          </div>
          <div>
            <label className={labelCls}>Telemóvel</label>
            <input type="tel" value={form.telefone} onChange={set('telefone')} className={inputCls} placeholder="+351 9XX XXX XXX" />
          </div>
        </div>
      </SECTION>

      {/* Dados do cliente */}
      <SECTION title="👥 Dados do cliente">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Nome do cliente *</label>
            <input value={form.cliente_nome} onChange={set('cliente_nome')} required className={inputCls} placeholder="Maria Santos" />
          </div>
          <div>
            <label className={labelCls}>Email do cliente</label>
            <input type="email" value={form.cliente_email} onChange={set('cliente_email')} className={inputCls} placeholder="maria@email.com" />
          </div>
          <div>
            <label className={labelCls}>Telemóvel do cliente</label>
            <input type="tel" value={form.cliente_telef} onChange={set('cliente_telef')} className={inputCls} placeholder="+351 9XX XXX XXX" />
          </div>
        </div>
      </SECTION>

      {/* Imóvel */}
      <SECTION title="🏠 Imóvel a visitar">
        <div>
          <label className={labelCls}>Selecionar imóvel *</label>
          <select value={form.imovel_id} onChange={set('imovel_id')} required className={`${inputCls} bg-white`}>
            <option value="">Escolher imóvel...</option>
            {imoveis.map(i => (
              <option key={i.id} value={i.id}>
                {i.titulo} — {i.tipologia} · {i.cidade} ({i.tipo})
              </option>
            ))}
            <option value="__outro__">Outro / Não listado</option>
          </select>
        </div>
        {imovelOutro && (
          <div>
            <label className={labelCls}>Localização / Descrição *</label>
            <input value={form.imovel_outro} onChange={set('imovel_outro')} required={imovelOutro}
              className={inputCls} placeholder="Ex: Lote 4, Urbanização dos Esporões, Braga" />
          </div>
        )}
      </SECTION>

      {/* Data e hora — iOS style */}
      <SECTION title="📅 Data e hora da visita">

        {/* Day picker */}
        <div>
          <label className={labelCls}>Dia *</label>
          <div className="relative">
            <button type="button" onClick={() => scrollDays(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm border border-[#E8E3E3] rounded-full shadow-sm text-[#475569] hover:text-[#1F3F44] transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div ref={daysRef} className="flex gap-2 overflow-x-auto scroll-smooth px-10 pb-1 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {DAYS.map(d => (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => setVal('data_visita', d.iso)}
                  className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl border-2 transition-all duration-150 min-w-[72px]
                    ${form.data_visita === d.iso
                      ? 'bg-[#1F3F44] border-[#1F3F44] text-white shadow-md scale-105'
                      : d.isWeekend
                      ? 'bg-[#fafafa] border-[#e2e8f0] text-[#94a3b8] hover:border-[#00545F]/40'
                      : 'bg-white border-[#e2e8f0] text-[#1F3F44] hover:border-[#00545F]/60 hover:bg-teal-50/30'
                    }`}
                >
                  <span className="text-xs font-semibold opacity-70 mb-0.5">{d.sub}</span>
                  <span className="text-sm font-bold leading-tight">{d.label}</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => scrollDays(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm border border-[#E8E3E3] rounded-full shadow-sm text-[#475569] hover:text-[#1F3F44] transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Time picker */}
        <div>
          <label className={labelCls}>Hora *</label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {SLOTS.map(slot => (
              <button
                key={slot}
                type="button"
                onClick={() => setVal('hora_visita', slot)}
                className={`py-3 rounded-2xl border-2 text-sm font-semibold transition-all duration-150
                  ${form.hora_visita === slot
                    ? 'bg-[#1F3F44] border-[#1F3F44] text-white shadow-md scale-105'
                    : 'bg-white border-[#e2e8f0] text-[#475569] hover:border-[#00545F]/60 hover:bg-teal-50/30 hover:text-[#1F3F44]'
                  }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Resumo seleção */}
        {form.data_visita && form.hora_visita && (
          <div className="bg-[#1F3F44]/5 border border-[#1F3F44]/10 rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-lg">📅</span>
            <p className="text-sm font-semibold text-[#1F3F44]">
              {DAYS.find(d => d.iso === form.data_visita)?.label} às {form.hora_visita}
            </p>
          </div>
        )}

        {/* Notas */}
        <div>
          <label className={labelCls}>Notas adicionais</label>
          <textarea value={form.notas} onChange={set('notas')} rows={3}
            className={`${inputCls} resize-none`} placeholder="Informação extra sobre a visita ou o cliente..." />
        </div>
      </SECTION>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
      )}

      <button type="submit" disabled={loading || !form.data_visita || !form.hora_visita}
        className="w-full py-4 rounded-xl bg-[#00545F] text-white font-semibold text-base hover:bg-[#006B78] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md">
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> A submeter...</> : 'Confirmar agendamento'}
      </button>

      <p className="text-center text-xs text-[#94a3b8]">
        A confirmação final será feita pela equipa Painel Temático.
      </p>
    </form>
  )
}
