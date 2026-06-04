'use client'

import { useState } from 'react'
import { CheckCircle, Loader2, Calendar } from 'lucide-react'
import Link from 'next/link'

interface Imovel { id: string; titulo: string; tipologia: string; cidade: string; tipo: string }
interface Props {
  imoveis: Imovel[]
  imovelPreSelected: Imovel | null
}

const inputCls = 'w-full px-4 py-3 rounded-xl border border-[#E8E3E3] bg-white text-sm text-[#1F3F44] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all'
const labelCls = 'block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2'

const SECTION = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-[#E8E3E3] p-6 space-y-4">
    <h2 className="font-serif font-semibold text-[#1F3F44] text-base border-b border-[#f1f5f9] pb-3">{title}</h2>
    {children}
  </div>
)

const MIN_NOTICE_HOURS = 2

function getAllSlots() {
  const slots = []
  for (let h = 8; h <= 19; h++) {
    for (const m of [0, 30]) {
      if (h === 19 && m === 30) break
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
}

const ALL_SLOTS = getAllSlots()
const TODAY_ISO = new Date().toISOString().split('T')[0]

function getAvailableSlots(dateISO: string): string[] {
  if (dateISO !== TODAY_ISO) return ALL_SLOTS
  const cutoff = new Date(Date.now() + MIN_NOTICE_HOURS * 60 * 60 * 1000)
  return ALL_SLOTS.filter(s => {
    const [h, m] = s.split(':').map(Number)
    const slotTime = new Date()
    slotTime.setHours(h, m, 0, 0)
    return slotTime > cutoff
  })
}

function getDays() {
  const days = []
  const today = new Date()
  const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  for (let i = 0; i < 60; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    if (i === 0 && getAvailableSlots(iso).length === 0) continue
    const label = i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : `${DIAS[d.getDay()]} ${d.getDate()}`
    const sub   = i <= 1 ? `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}` : MESES[d.getMonth()]
    days.push({ iso, label, sub })
  }
  return days
}

const DAYS = getDays()

export default function VisitaForm({ imoveis, imovelPreSelected }: Props) {
  const [form, setForm] = useState({
    nome: '', email: '', telefone: '',
    imovel_id: imovelPreSelected?.id ?? '',
    imovel_outro: '',
    data_visita: '', hora_visita: '', notas: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = e.target.value
    const slots = getAvailableSlots(newDate)
    setForm(f => ({
      ...f,
      data_visita: newDate,
      hora_visita: slots.includes(f.hora_visita) ? f.hora_visita : '',
    }))
  }

  const imovelOutro = form.imovel_id === '__outro__'
  const availableSlots = form.data_visita ? getAvailableSlots(form.data_visita) : ALL_SLOTS

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/visita', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        imovel_id: imovelOutro ? null : form.imovel_id || null,
      }),
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
        O pedido foi registado. A nossa equipa entrará em contacto para confirmação.
      </p>
      <p className="text-[#1F3F44] font-semibold mt-4 flex items-center justify-center gap-2">
        <Calendar className="w-4 h-4 text-[#00545F]" />
        {DAYS.find(d => d.iso === form.data_visita)?.label ?? form.data_visita} às {form.hora_visita}
      </p>
      <div className="flex gap-3 justify-center mt-6">
        <button
          onClick={() => { setSuccess(false); setForm({ nome: '', email: '', telefone: '', imovel_id: imovelPreSelected?.id ?? '', imovel_outro: '', data_visita: '', hora_visita: '', notas: '' }) }}
          className="px-6 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#64748b] font-medium hover:bg-[#f8fafc] transition-colors"
        >
          Agendar outra visita
        </button>
        <Link href="/imoveis"
          className="px-6 py-2.5 rounded-xl bg-[#00545F] text-white text-sm font-semibold hover:bg-[#006B78] transition-colors">
          Ver mais imóveis
        </Link>
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Dados pessoais */}
      <SECTION title="👤 Os seus dados">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Nome completo *</label>
            <input value={form.nome} onChange={set('nome')} required
              className={inputCls} placeholder="Maria Silva" />
          </div>
          <div>
            <label className={labelCls}>Email *</label>
            <input type="email" value={form.email} onChange={set('email')} required
              className={inputCls} placeholder="maria@email.com" />
          </div>
          <div>
            <label className={labelCls}>Telemóvel *</label>
            <input type="tel" value={form.telefone} onChange={set('telefone')} required
              className={inputCls} placeholder="+351 9XX XXX XXX" />
          </div>
        </div>
      </SECTION>

      {/* Imóvel */}
      <SECTION title="🏠 Imóvel a visitar">
        {imovelPreSelected ? (
          <div className="flex items-center justify-between bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3">
            <div>
              <p className="font-semibold text-sm text-[#1F3F44]">{imovelPreSelected.titulo}</p>
              <p className="text-xs text-[#94a3b8]">{imovelPreSelected.tipologia} · {imovelPreSelected.cidade} · {imovelPreSelected.tipo}</p>
            </div>
            <Link href="/visita" className="text-xs text-[#00545F] hover:underline font-medium">Alterar</Link>
          </div>
        ) : (
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
        )}
        {imovelOutro && (
          <div>
            <label className={labelCls}>Qual o imóvel? *</label>
            <input value={form.imovel_outro} onChange={set('imovel_outro')} required={imovelOutro}
              className={inputCls} placeholder="Ex: Lote 4, Urbanização dos Esporões, Braga" />
          </div>
        )}
      </SECTION>

      {/* Data e hora */}
      <SECTION title="📅 Data e hora">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Dia *</label>
            <select value={form.data_visita} onChange={handleDateChange} required
              className={`${inputCls} bg-white`}>
              <option value="">Escolher dia...</option>
              {DAYS.map(d => (
                <option key={d.iso} value={d.iso}>{d.label} · {d.sub}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Hora *</label>
            <select value={form.hora_visita} onChange={set('hora_visita')} required
              className={`${inputCls} bg-white`}
              disabled={!form.data_visita}>
              <option value="">Escolher hora...</option>
              {availableSlots.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Notas adicionais</label>
          <textarea value={form.notas} onChange={set('notas')} rows={2}
            className={`${inputCls} resize-none`} placeholder="Alguma informação que queira partilhar..." />
        </div>
      </SECTION>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
      )}

      <button type="submit"
        disabled={loading || !form.data_visita || !form.hora_visita}
        className="w-full py-4 rounded-xl bg-[#00545F] text-white font-semibold text-base hover:bg-[#006B78] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md">
        {loading
          ? <><Loader2 className="w-5 h-5 animate-spin" /> A submeter...</>
          : <><Calendar className="w-5 h-5" /> Confirmar agendamento</>}
      </button>

      <p className="text-center text-xs text-[#94a3b8]">
        A confirmação final será feita pela nossa equipa. Entraremos em contacto pelo email ou telemóvel indicados.
      </p>
    </form>
  )
}
