'use client'

import { TIPOS } from '@/lib/oportunidades'
import { cn } from '@/lib/utils'
import type { OportunidadeTipo } from '@/types/database'

export const TIPOLOGIAS = ['T0', 'T1', 'T2', 'T3', 'T4', 'T4+']

export type FormOportunidade = {
  pessoa_nome: string
  pessoa_email: string
  pessoa_telefone: string
  tipo: OportunidadeTipo
  localizacao: string
  morada: string
  cidade: string
  codigo_postal: string
  mapa_url: string
  tipologia: string
  area_m2: string
  preco_esperado_min: string
  preco_esperado_max: string
  descricao: string
}

export const FORM_VAZIO: FormOportunidade = {
  pessoa_nome: '', pessoa_email: '', pessoa_telefone: '',
  tipo: 'venda', localizacao: '', morada: '', cidade: '', codigo_postal: '', mapa_url: '',
  tipologia: '', area_m2: '', preco_esperado_min: '', preco_esperado_max: '', descricao: '',
}

/** Converte o formulário para o payload da API (números e nulls). */
export function toPayload(form: FormOportunidade) {
  return {
    ...form,
    tipologia: form.tipologia || null,
    area_m2: form.area_m2 ? Number(form.area_m2) : null,
    preco_esperado_min: form.preco_esperado_min ? Number(form.preco_esperado_min) : null,
    preco_esperado_max: form.preco_esperado_max ? Number(form.preco_esperado_max) : null,
  }
}

const field = 'w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all'
const label = 'block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5'

interface Props {
  form: FormOportunidade
  setForm: (f: FormOportunidade) => void
}

export default function OportunidadeCampos({ form, setForm }: Props) {
  const set = (k: keyof FormOportunidade) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value })

  return (
    <>
      {/* Pessoa */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-4">
        <h2 className="font-serif font-semibold text-[#1F3F44]">Pessoa</h2>
        <div>
          <label className={label}>Nome *</label>
          <input value={form.pessoa_nome} onChange={set('pessoa_nome')} className={field} placeholder="Nome do contacto" />
        </div>
        <div>
          <label className={label}>Email</label>
          <input type="email" value={form.pessoa_email} onChange={set('pessoa_email')} className={field} placeholder="email@exemplo.pt" />
        </div>
        <div>
          <label className={label}>Telefone</label>
          <input type="tel" value={form.pessoa_telefone} onChange={set('pessoa_telefone')} className={field} placeholder="+351 ..." />
        </div>
      </section>

      {/* Intenção */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-4">
        <h2 className="font-serif font-semibold text-[#1F3F44]">Intenção</h2>
        <div>
          <label className={label}>Tipo</label>
          <div className="flex gap-2 flex-wrap">
            {TIPOS.map((t) => (
              <button key={t.value} type="button" onClick={() => setForm({ ...form, tipo: t.value })}
                className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                  form.tipo === t.value ? 'bg-[#1F3F44] text-white border-[#1F3F44]' : 'border-[#e2e8f0] text-[#475569] hover:border-[#94a3b8]')}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Localização */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-4">
        <h2 className="font-serif font-semibold text-[#1F3F44]">Localização</h2>
        <div>
          <label className={label}>Morada</label>
          <input value={form.morada} onChange={set('morada')} className={field} placeholder="Rua e número" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Cidade</label>
            <input value={form.cidade} onChange={set('cidade')} className={field} placeholder="Braga" />
          </div>
          <div>
            <label className={label}>Código postal</label>
            <input value={form.codigo_postal} onChange={set('codigo_postal')} className={field} placeholder="4700-000" />
          </div>
        </div>
        <div>
          <label className={label}>Zona / etiqueta <span className="text-[#94a3b8] normal-case font-normal">(como lhe chamas)</span></label>
          <input value={form.localizacao} onChange={set('localizacao')} className={field} placeholder="Ex: São Vítor, perto do hospital" />
        </div>
        <div>
          <label className={label}>Link do Google Maps <span className="text-[#94a3b8] normal-case font-normal">(opcional)</span></label>
          <input value={form.mapa_url} onChange={set('mapa_url')} className={field} placeholder="Cola aqui o link do mapa para marcar o ponto exato" />
          <p className="text-xs text-[#94a3b8] mt-1.5">Se deixares vazio, o mapa é procurado pela morada.</p>
        </div>
      </section>

      {/* Imóvel */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-4">
        <h2 className="font-serif font-semibold text-[#1F3F44]">Imóvel</h2>
        <div>
          <label className={label}>Tipologia</label>
          <div className="flex gap-2 flex-wrap">
            {TIPOLOGIAS.map((t) => (
              <button key={t} type="button" onClick={() => setForm({ ...form, tipologia: form.tipologia === t ? '' : t })}
                className={cn('px-3 py-1.5 rounded-xl border text-sm font-medium transition-all',
                  form.tipologia === t ? 'bg-[#00545F] text-white border-[#00545F]' : 'border-[#e2e8f0] text-[#475569] hover:border-[#94a3b8]')}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={label}>Área (m²)</label>
          <input type="number" value={form.area_m2} onChange={set('area_m2')} className={field} placeholder="120" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Preço mín. (€)</label>
            <input type="number" value={form.preco_esperado_min} onChange={set('preco_esperado_min')} className={field} placeholder="0" />
          </div>
          <div>
            <label className={label}>Preço máx. (€)</label>
            <input type="number" value={form.preco_esperado_max} onChange={set('preco_esperado_max')} className={field} placeholder="0" />
          </div>
        </div>
        <p className="text-xs text-[#94a3b8]">O orçamento detalhado faz-se depois, na página da oportunidade.</p>
        <div>
          <label className={label}>Descrição / detalhes</label>
          <textarea rows={4} value={form.descricao} onChange={set('descricao')} className={cn(field, 'resize-none')} placeholder="O que sabes sobre esta oportunidade..." />
        </div>
      </section>
    </>
  )
}
