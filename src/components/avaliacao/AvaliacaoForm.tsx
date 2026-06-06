'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Home, MapPin, Ruler, Calendar, ChevronRight, ChevronLeft,
  Check, Loader2, Star, Clock, Building2, Trees, Car,
  Bath, BedDouble, Euro, AlertCircle, Phone, Mail, User, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Types ─── */
type FormData = {
  tipo: string
  morada: string
  cidade: string
  area_m2: string
  ano_construcao: string
  estado_geral: string
  quartos: string
  casas_banho: string
  garagem: boolean
  jardim: boolean
  outras_caracteristicas: string
  motivo_venda: string
  valor_esperado: string
  urgencia: string
  tem_imobiliaria: boolean
  nome: string
  email: string
  telefone: string
  horario_contacto: string
}

const INITIAL: FormData = {
  tipo: '', morada: '', cidade: '', area_m2: '', ano_construcao: '',
  estado_geral: '', quartos: '', casas_banho: '', garagem: false, jardim: false,
  outras_caracteristicas: '', motivo_venda: '', valor_esperado: '', urgencia: '',
  tem_imobiliaria: false, nome: '', email: '', telefone: '', horario_contacto: '',
}

/* ─── Step config ─── */
const STEPS = [
  { id: 1, label: 'O imóvel',       icon: Home },
  { id: 2, label: 'Características', icon: Star },
  { id: 3, label: 'Expectativas',   icon: Zap },
  { id: 4, label: 'Os seus dados',  icon: User },
]

/* ─── Option button ─── */
function OptionBtn({
  selected, onClick, children, className = ''
}: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 cursor-pointer text-center',
        selected
          ? 'border-[#00545F] bg-[#00545F]/8 text-[#00545F] shadow-sm scale-[1.02]'
          : 'border-[#e2e8f0] bg-white text-[#475569] hover:border-[#00545F]/40 hover:bg-[#f8fafc]',
        className
      )}
    >
      {selected && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#00545F] flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </span>
      )}
      {children}
    </button>
  )
}

/* ─── Input ─── */
function Input({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#1F3F44] mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

const fieldCls = "w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all bg-white"

/* ════════════════════════════════ MAIN ════════════════════════════════ */
export default function AvaliacaoForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const set = (field: keyof FormData, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  /* ─── Validation per step ─── */
  const validate = (s: number): boolean => {
    const e: typeof errors = {}
    if (s === 1) {
      if (!form.tipo)    e.tipo    = 'Selecione o tipo de imóvel'
      if (!form.cidade)  e.cidade  = 'Introduza a cidade'
      if (!form.area_m2) e.area_m2 = 'Indique a área aproximada'
    }
    if (s === 4) {
      if (!form.nome)  e.nome  = 'O seu nome é obrigatório'
      if (!form.email) e.email = 'O email é obrigatório'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate(step)) setStep(s => Math.min(s + 1, 4)) }
  const prev = () => { setStep(s => Math.max(s - 1, 1)); setErrors({}) }

  const submit = async () => {
    if (!validate(4)) return
    setLoading(true)
    try {
      const res = await fetch('/api/avaliacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          area_m2: form.area_m2 ? Number(form.area_m2) : null,
          ano_construcao: form.ano_construcao ? Number(form.ano_construcao) : null,
          quartos: form.quartos ? Number(form.quartos) : null,
          casas_banho: form.casas_banho ? Number(form.casas_banho) : null,
          valor_esperado: form.valor_esperado ? Number(form.valor_esperado.replace(/\D/g, '')) : null,
        }),
      })
      if (res.ok) setDone(true)
      else setErrors({ nome: 'Erro ao enviar. Tente novamente.' })
    } catch {
      setErrors({ nome: 'Erro de ligação. Tente novamente.' })
    }
    setLoading(false)
  }

  /* ─── Done screen ─── */
  if (done) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#1F3F44] mb-3">Pedido recebido!</h2>
        <p className="text-[#64748b] text-lg mb-2">Obrigado, <strong className="text-[#1F3F44]">{form.nome}</strong>.</p>
        <p className="text-[#64748b] mb-8 max-w-sm mx-auto leading-relaxed">
          Enviámos uma confirmação para <strong>{form.email}</strong>.
          A nossa equipa entrará em contacto nas próximas 24 a 48 horas.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-xl border border-[#e2e8f0] text-[#475569] text-sm font-semibold hover:bg-[#f8fafc] transition-colors"
          >
            Voltar ao início
          </button>
          <button
            onClick={() => router.push('/imoveis')}
            className="px-6 py-3 rounded-xl bg-[#1F3F44] text-white text-sm font-semibold hover:bg-[#1e293b] transition-colors"
          >
            Ver imóveis disponíveis
          </button>
        </div>
      </div>
    )
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="mb-8">
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = s.id === step
            const isDone = s.id < step
            return (
              <div key={s.id} className="flex flex-col items-center gap-1.5 flex-1">
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300',
                  isDone ? 'bg-[#00545F] text-white' :
                  isActive ? 'bg-[#1F3F44] text-white scale-110 shadow-lg' :
                  'bg-[#f1f5f9] text-[#94a3b8]'
                )}>
                  {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={cn(
                  'text-[10px] font-semibold hidden sm:block transition-colors',
                  isActive ? 'text-[#1F3F44]' : isDone ? 'text-[#00545F]' : 'text-[#94a3b8]'
                )}>{s.label}</span>
              </div>
            )
          })}
        </div>
        {/* Track */}
        <div className="h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1F3F44] to-[#00545F] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-[#94a3b8] mt-2 text-right">Passo {step} de {STEPS.length}</p>
      </div>

      {/* ──── STEP 1: O imóvel ──── */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1F3F44] mb-1">O seu imóvel</h2>
            <p className="text-[#64748b] text-sm">Conte-nos o básico sobre o que pretende avaliar</p>
          </div>

          {/* Tipo */}
          <Input label="Tipo de imóvel" required error={errors.tipo}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
              {[
                { v: 'apartamento', label: 'Apartamento', icon: Building2 },
                { v: 'moradia',     label: 'Moradia',     icon: Home },
                { v: 'terreno',     label: 'Terreno',     icon: Trees },
                { v: 'comercial',   label: 'Comercial',   icon: Ruler },
              ].map(o => {
                const Icon = o.icon
                return (
                  <OptionBtn key={o.v} selected={form.tipo === o.v} onClick={() => set('tipo', o.v)}>
                    <Icon className="w-6 h-6" />
                    {o.label}
                  </OptionBtn>
                )
              })}
            </div>
          </Input>

          {/* Localização */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Cidade / Freguesia" required error={errors.cidade}>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  type="text"
                  placeholder="Ex: Braga, Esporões..."
                  value={form.cidade}
                  onChange={e => set('cidade', e.target.value)}
                  className={cn(fieldCls, 'pl-9')}
                />
              </div>
            </Input>
            <Input label="Morada (opcional)">
              <input
                type="text"
                placeholder="Rua, número..."
                value={form.morada}
                onChange={e => set('morada', e.target.value)}
                className={fieldCls}
              />
            </Input>
          </div>

          {/* Área e Ano */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Área aproximada (m²)" required error={errors.area_m2}>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  type="number"
                  placeholder="Ex: 120"
                  value={form.area_m2}
                  onChange={e => set('area_m2', e.target.value)}
                  className={cn(fieldCls, 'pl-9')}
                  min="10"
                />
              </div>
            </Input>
            <Input label="Ano de construção (aprox.)">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  type="number"
                  placeholder="Ex: 2005"
                  value={form.ano_construcao}
                  onChange={e => set('ano_construcao', e.target.value)}
                  className={cn(fieldCls, 'pl-9')}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </Input>
          </div>
        </div>
      )}

      {/* ──── STEP 2: Características ──── */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1F3F44] mb-1">Estado e características</h2>
            <p className="text-[#64748b] text-sm">Ajude-nos a perceber as condições do imóvel</p>
          </div>

          {/* Estado geral */}
          <Input label="Estado geral do imóvel">
            <div className="grid grid-cols-2 gap-3 mt-1">
              {[
                { v: 'excelente',   label: 'Excelente',             sub: 'Seminovo ou renovado',   emoji: '✨' },
                { v: 'bom',         label: 'Bom',                   sub: 'Bem conservado',         emoji: '👍' },
                { v: 'razoavel',    label: 'Razoável',              sub: 'Alguns desgastes',       emoji: '🔧' },
                { v: 'obras',       label: 'Precisa de obras',      sub: 'Requer intervenção',     emoji: '🏗️' },
              ].map(o => (
                <OptionBtn key={o.v} selected={form.estado_geral === o.v} onClick={() => set('estado_geral', o.v)} className="items-start text-left">
                  <div>
                    <span className="text-xl">{o.emoji}</span>
                    <p className="font-semibold mt-1">{o.label}</p>
                    <p className="text-xs font-normal text-[#94a3b8] mt-0.5">{o.sub}</p>
                  </div>
                </OptionBtn>
              ))}
            </div>
          </Input>

          {/* Quartos e WCs */}
          {form.tipo !== 'terreno' && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nº de quartos">
                <div className="relative">
                  <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <select value={form.quartos} onChange={e => set('quartos', e.target.value)} className={cn(fieldCls, 'pl-9 appearance-none')}>
                    <option value="">Selecionar</option>
                    {['T0','T1','T2','T3','T4','T4+'].map((t, i) => (
                      <option key={t} value={i}>{t}</option>
                    ))}
                  </select>
                </div>
              </Input>
              <Input label="Casas de banho">
                <div className="relative">
                  <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <select value={form.casas_banho} onChange={e => set('casas_banho', e.target.value)} className={cn(fieldCls, 'pl-9 appearance-none')}>
                    <option value="">Selecionar</option>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </Input>
            </div>
          )}

          {/* Extras */}
          <Input label="Extras">
            <div className="grid grid-cols-2 gap-3 mt-1">
              <OptionBtn selected={form.garagem} onClick={() => set('garagem', !form.garagem)}>
                <Car className="w-5 h-5" />
                Garagem / Parqueamento
              </OptionBtn>
              <OptionBtn selected={form.jardim} onClick={() => set('jardim', !form.jardim)}>
                <Trees className="w-5 h-5" />
                Jardim / Quintal
              </OptionBtn>
            </div>
          </Input>

          {/* Outras características */}
          <Input label="Outras características relevantes">
            <textarea
              rows={3}
              value={form.outras_caracteristicas}
              onChange={e => set('outras_caracteristicas', e.target.value)}
              placeholder="Ex: piscina, vista de rio, certificado energético A, cozinha equipada, arrecadação..."
              className={cn(fieldCls, 'resize-none')}
            />
          </Input>
        </div>
      )}

      {/* ──── STEP 3: Expectativas ──── */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1F3F44] mb-1">As suas expectativas</h2>
            <p className="text-[#64748b] text-sm">Quanto mais sabermos, melhor podemos ajudar</p>
          </div>

          {/* Urgência */}
          <Input label="Qual é a urgência da venda?">
            <div className="grid grid-cols-2 gap-3 mt-1">
              {[
                { v: 'sem_pressa',   label: 'Sem pressa',       sub: 'Só se houver boa proposta', emoji: '🌿' },
                { v: 'seis_meses',   label: 'Nos próximos 6 m.', sub: 'Ainda tenho tempo',        emoji: '📅' },
                { v: 'tres_meses',   label: 'Nos próximos 3 m.', sub: 'Já tenho planos',          emoji: '⏳' },
                { v: 'urgente',      label: 'Urgente',           sub: 'Preciso de vender rápido', emoji: '🔥' },
              ].map(o => (
                <OptionBtn key={o.v} selected={form.urgencia === o.v} onClick={() => set('urgencia', o.v)} className="items-start text-left">
                  <div>
                    <span className="text-xl">{o.emoji}</span>
                    <p className="font-semibold mt-1">{o.label}</p>
                    <p className="text-xs font-normal text-[#94a3b8] mt-0.5">{o.sub}</p>
                  </div>
                </OptionBtn>
              ))}
            </div>
          </Input>

          {/* Valor esperado */}
          <Input label="Valor que espera obter (opcional)">
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Ex: 250000"
                value={form.valor_esperado}
                onChange={e => set('valor_esperado', e.target.value)}
                className={cn(fieldCls, 'pl-9')}
              />
            </div>
            <p className="text-xs text-[#94a3b8] mt-1">Não se preocupe se não tiver certeza — é apenas orientação</p>
          </Input>

          {/* Motivo */}
          <Input label="Motivo da venda (opcional)">
            <textarea
              rows={2}
              value={form.motivo_venda}
              onChange={e => set('motivo_venda', e.target.value)}
              placeholder="Ex: mudança de cidade, separação, herança, investimento..."
              className={cn(fieldCls, 'resize-none')}
            />
          </Input>

          {/* Tem imobiliária */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
            <input
              type="checkbox"
              id="tem_imobiliaria"
              checked={form.tem_imobiliaria}
              onChange={e => set('tem_imobiliaria', e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#00545F] cursor-pointer"
            />
            <label htmlFor="tem_imobiliaria" className="text-sm text-[#475569] cursor-pointer leading-relaxed">
              Já estou a trabalhar com outra imobiliária ou mediador
            </label>
          </div>
        </div>
      )}

      {/* ──── STEP 4: Dados pessoais ──── */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1F3F44] mb-1">Os seus dados</h2>
            <p className="text-[#64748b] text-sm">Para podermos enviar-lhe a avaliação e entrar em contacto</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nome completo" required error={errors.nome}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  type="text"
                  placeholder="O seu nome"
                  value={form.nome}
                  onChange={e => set('nome', e.target.value)}
                  className={cn(fieldCls, 'pl-9')}
                  autoComplete="name"
                />
              </div>
            </Input>
            <Input label="Email" required error={errors.email}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  type="email"
                  placeholder="exemplo@email.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  className={cn(fieldCls, 'pl-9')}
                  autoComplete="email"
                />
              </div>
            </Input>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Telefone (opcional)">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  type="tel"
                  placeholder="+351 9XX XXX XXX"
                  value={form.telefone}
                  onChange={e => set('telefone', e.target.value)}
                  className={cn(fieldCls, 'pl-9')}
                  autoComplete="tel"
                />
              </div>
            </Input>
            <Input label="Melhor horário para contacto">
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <select value={form.horario_contacto} onChange={e => set('horario_contacto', e.target.value)} className={cn(fieldCls, 'pl-9 appearance-none')}>
                  <option value="">Indiferente</option>
                  <option value="manha">Manhã (9h – 12h)</option>
                  <option value="almoco">Almoço (12h – 14h)</option>
                  <option value="tarde">Tarde (14h – 18h)</option>
                  <option value="noite">Noite (após 18h)</option>
                </select>
              </div>
            </Input>
          </div>

          {/* Privacy note */}
          <p className="text-xs text-[#94a3b8] leading-relaxed bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
            🔒 Os seus dados são tratados de forma confidencial e usados exclusivamente para preparar a sua avaliação,
            em conformidade com o RGPD. Não partilhamos informações com terceiros.
          </p>

          {errors.nome && errors.nome.includes('Erro') && (
            <p className="text-red-500 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />{errors.nome}
            </p>
          )}
        </div>
      )}

      {/* ──── Navigation ──── */}
      <div className="flex gap-3 mt-8 pt-6 border-t border-[#f1f5f9]">
        {step > 1 && (
          <button
            type="button"
            onClick={prev}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#e2e8f0] text-[#475569] font-semibold text-sm hover:bg-[#f8fafc] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
        )}
        <div className="flex-1" />
        {step < 4 ? (
          <button
            type="button"
            onClick={next}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1F3F44] text-white font-semibold text-sm hover:bg-[#00545F] transition-colors shadow-md"
          >
            Seguinte <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors shadow-md disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> A enviar...</>
            ) : (
              <><Check className="w-4 h-4" /> Pedir avaliação gratuita</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
