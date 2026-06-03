'use client'

import { useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'

interface Imovel { id: string; titulo: string; tipologia: string; cidade: string; tipo: string }
interface Props  { imoveis: Imovel[] }

const inputCls = 'w-full px-4 py-3 rounded-xl border border-[#E8E3E3] bg-white text-sm text-[#1F3F44] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all'
const labelCls = 'block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5'

const SECTION = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-[#E8E3E3] p-6 space-y-4">
    <h2 className="font-serif font-semibold text-[#1F3F44] text-base border-b border-[#f1f5f9] pb-3">{title}</h2>
    {children}
  </div>
)

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

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const imovelOutro = form.imovel_id === '__outro__'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/agendar-visita', {
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
        O pedido foi registado com sucesso. A equipa Painel Temático entrará em contacto para confirmação.
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
            <input
              value={form.imovel_outro}
              onChange={set('imovel_outro')}
              required={imovelOutro}
              className={inputCls}
              placeholder="Ex: Lote 4, Urbanização dos Esporões, Braga"
            />
          </div>
        )}
      </SECTION>

      {/* Data e hora */}
      <SECTION title="📅 Data e hora da visita">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Data *</label>
            <input
              type="date"
              value={form.data_visita}
              onChange={set('data_visita')}
              required
              min={new Date().toISOString().split('T')[0]}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Hora *</label>
            <input
              type="time"
              value={form.hora_visita}
              onChange={set('hora_visita')}
              required
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Notas adicionais</label>
          <textarea
            value={form.notas}
            onChange={set('notas')}
            rows={3}
            className={`${inputCls} resize-none`}
            placeholder="Informação extra sobre a visita ou o cliente..."
          />
        </div>
      </SECTION>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl bg-[#00545F] text-white font-semibold text-base hover:bg-[#006B78] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
      >
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> A submeter...</> : 'Confirmar agendamento'}
      </button>

      <p className="text-center text-xs text-[#94a3b8]">
        A confirmação final será feita pela equipa Painel Temático.
      </p>
    </form>
  )
}
