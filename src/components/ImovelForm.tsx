'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import ImageUpload from '@/components/admin/ImageUpload'
import { cn } from '@/lib/utils'
import type { Imovel } from '@/types/database'

type FormData = {
  titulo: string
  slug: string
  tipo: 'Venda' | 'Arrendamento'
  tipologia: string
  preco: string
  area_m2: string
  quartos: string
  casas_banho: string
  garagem: boolean
  localizacao: string
  cidade: string
  distrito: string
  descricao: string
  fotos: string[]
  plantas: string[]
  especificidades: string
  destaque: boolean
  disponivel: boolean
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

interface Props {
  imovel?: Imovel
}

export default function ImovelForm({ imovel }: Props) {
  const router = useRouter()
  const isEdit = !!imovel

  const [form, setForm] = useState<FormData>({
    titulo: imovel?.titulo ?? '',
    slug: imovel?.slug ?? '',
    tipo: imovel?.tipo ?? 'Venda',
    tipologia: imovel?.tipologia ?? '',
    preco: imovel?.preco?.toString() ?? '',
    area_m2: imovel?.area_m2?.toString() ?? '',
    quartos: imovel?.quartos?.toString() ?? '',
    casas_banho: imovel?.casas_banho?.toString() ?? '',
    garagem: imovel?.garagem ?? false,
    localizacao: imovel?.localizacao ?? '',
    cidade: imovel?.cidade ?? '',
    distrito: imovel?.distrito ?? '',
    descricao: imovel?.descricao ?? '',
    fotos: imovel?.fotos ?? [],
    plantas: imovel?.plantas ?? [],
    especificidades: (imovel?.especificidades ?? []).join('\n'),
    destaque: imovel?.destaque ?? false,
    disponivel: imovel?.disponivel ?? true,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: keyof FormData, value: string | boolean | string[]) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleTituloChange = (titulo: string) => {
    setForm((f) => ({
      ...f,
      titulo,
      slug: isEdit ? f.slug : slugify(titulo),
    }))
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        titulo: form.titulo,
        slug: form.slug,
        tipo: form.tipo,
        tipologia: (form.tipologia || null) as Imovel['tipologia'],
        preco: form.preco ? Number(form.preco) : null,
        area_m2: form.area_m2 ? Number(form.area_m2) : null,
        quartos: form.quartos ? Number(form.quartos) : null,
        casas_banho: form.casas_banho ? Number(form.casas_banho) : null,
        garagem: form.garagem,
        localizacao: form.localizacao || null,
        cidade: form.cidade || null,
        distrito: form.distrito || null,
        descricao: form.descricao || null,
        fotos: form.fotos,
        plantas: form.plantas,
        especificidades: form.especificidades
          ? form.especificidades.split('\n').map(s => s.trim()).filter(Boolean)
          : [],
        destaque: form.destaque,
        disponivel: form.disponivel,
      }

      if (isEdit) {
        const res = await fetch(`/api/admin/imoveis/${imovel.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const d = await res.json().catch(() => ({}))
          throw new Error(d.error ?? 'Erro ao guardar o imóvel.')
        }
      } else {
        // Criação via API: regista automaticamente o angariador (utilizador da sessão)
        const res = await fetch('/api/admin/imoveis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const d = await res.json().catch(() => ({}))
          throw new Error(d.error ?? 'Erro ao publicar o imóvel.')
        }
      }

      router.push('/admin/imoveis')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao guardar. Verifique os dados.')
    } finally {
      setLoading(false)
    }
  }

  const field = 'w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all bg-white'
  const label = 'block text-xs font-semibold text-[#475569] mb-1.5 uppercase tracking-wider'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ─ Informação básica ─ */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
        <h2 className="font-serif font-semibold text-[#1F3F44] mb-5">Informação Básica</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={label}>Título *</label>
            <input required value={form.titulo} onChange={(e) => handleTituloChange(e.target.value)} placeholder="ex: Moradia T4 com Piscina em Braga" className={field} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Slug (URL) *</label>
              <input required value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="moradia-t4-piscina-braga" className={field} />
            </div>
            <div>
              <label className={label}>Tipologia</label>
              <select value={form.tipologia} onChange={(e) => set('tipologia', e.target.value)} className={field}>
                <option value="">— Selecionar —</option>
                {['T0','T1','T2','T3','T4','T4+'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={label}>Descrição</label>
            <textarea rows={4} value={form.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Descrição detalhada do imóvel..." className={cn(field, 'resize-none')} />
          </div>
        </div>
      </section>

      {/* ─ Negócio & Preço ─ */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
        <h2 className="font-serif font-semibold text-[#1F3F44] mb-5">Negócio & Preço</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Tipo de Negócio *</label>
            <div className="flex gap-3">
              {(['Venda', 'Arrendamento'] as const).map((t) => (
                <button
                  key={t} type="button"
                  onClick={() => set('tipo', t)}
                  className={cn('flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all', form.tipo === t ? 'bg-[#1F3F44] text-white border-[#1F3F44]' : 'border-[#e2e8f0] text-[#475569] hover:border-[#1F3F44]')}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={label}>Preço (€)</label>
            <input type="number" value={form.preco} onChange={(e) => set('preco', e.target.value)} placeholder={form.tipo === 'Arrendamento' ? 'ex: 1200 (por mês)' : 'ex: 295000'} className={field} />
          </div>
        </div>
      </section>

      {/* ─ Características ─ */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
        <h2 className="font-serif font-semibold text-[#1F3F44] mb-5">Características</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className={label}>Área (m²)</label>
            <input type="number" value={form.area_m2} onChange={(e) => set('area_m2', e.target.value)} placeholder="ex: 120" className={field} />
          </div>
          <div>
            <label className={label}>Quartos</label>
            <input type="number" min="0" value={form.quartos} onChange={(e) => set('quartos', e.target.value)} placeholder="ex: 3" className={field} />
          </div>
          <div>
            <label className={label}>WC</label>
            <input type="number" min="0" value={form.casas_banho} onChange={(e) => set('casas_banho', e.target.value)} placeholder="ex: 2" className={field} />
          </div>
          <div>
            <label className={label}>Garagem</label>
            <button
              type="button"
              onClick={() => set('garagem', !form.garagem)}
              className={cn('w-full py-2.5 rounded-xl border text-sm font-semibold transition-all', form.garagem ? 'bg-emerald-500 text-white border-emerald-500' : 'border-[#e2e8f0] text-[#475569]')}
            >
              {form.garagem ? '✓ Sim' : 'Não'}
            </button>
          </div>
        </div>
      </section>

      {/* ─ Localização ─ */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
        <h2 className="font-serif font-semibold text-[#1F3F44] mb-5">Localização</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={label}>Localização / Bairro</label>
            <input value={form.localizacao} onChange={(e) => set('localizacao', e.target.value)} placeholder="ex: Nogueiró" className={field} />
          </div>
          <div>
            <label className={label}>Cidade</label>
            <input value={form.cidade} onChange={(e) => set('cidade', e.target.value)} placeholder="ex: Braga" className={field} />
          </div>
          <div>
            <label className={label}>Distrito</label>
            <input value={form.distrito} onChange={(e) => set('distrito', e.target.value)} placeholder="ex: Braga" className={field} />
          </div>
        </div>
      </section>

      {/* ─ Fotos ─ */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
        <h2 className="font-serif font-semibold text-[#1F3F44] mb-1">Fotografias</h2>
        <p className="text-[#94a3b8] text-xs mb-5">A primeira foto será a imagem principal do imóvel.</p>
        <ImageUpload
          urls={form.fotos}
          onChange={(urls) => set('fotos', urls)}
          folder="imoveis"
          max={20}
        />
      </section>

      {/* ─ Plantas ─ */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
        <h2 className="font-serif font-semibold text-[#1F3F44] mb-1">Plantas</h2>
        <p className="text-[#94a3b8] text-xs mb-5">Plantas e layouts do imóvel (imagens ou PDFs). Aparecem numa secção própria na página do imóvel.</p>
        <ImageUpload
          urls={form.plantas}
          onChange={(urls) => set('plantas', urls)}
          folder="imoveis/plantas"
          max={10}
          allowPdf
        />
      </section>

      {/* ─ Especificidades ─ */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
        <h2 className="font-serif font-semibold text-[#1F3F44] mb-1">Especificidades</h2>
        <p className="text-[#94a3b8] text-xs mb-5">
          Lista de características detalhadas — uma por linha.<br />
          Ex: <em>Cozinha equipada, Chão em madeira, Ar condicionado, Painéis solares...</em>
        </p>
        <textarea
          rows={8}
          value={form.especificidades}
          onChange={(e) => set('especificidades', e.target.value)}
          placeholder={'Cozinha totalmente equipada\nPavimento em madeira maciça\nAr condicionado\nPainéis solares\nPiscina privativa\nVidros duplos\n...'}
          className={cn(field, 'resize-none font-mono text-xs')}
        />
        <p className="text-[#94a3b8] text-xs mt-2">Uma característica por linha</p>
      </section>

      {/* ─ Visibilidade ─ */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
        <h2 className="font-serif font-semibold text-[#1F3F44] mb-5">Visibilidade</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          {[
            { field: 'disponivel' as const, label: 'Disponível', desc: 'Visível no site público', on: '✓ Disponível', off: 'Indisponível', color: 'bg-emerald-500 border-emerald-500' },
            { field: 'destaque' as const, label: 'Destaque', desc: 'Aparece na homepage', on: '★ Em destaque', off: 'Sem destaque', color: 'bg-[#00545F] border-[#00545F]' },
          ].map((opt) => (
            <button
              key={opt.field}
              type="button"
              onClick={() => set(opt.field, !form[opt.field])}
              className={cn(
                'flex-1 p-4 rounded-xl border-2 text-left transition-all',
                form[opt.field] ? `${opt.color} text-white` : 'border-[#e2e8f0] text-[#475569] hover:border-[#94a3b8]'
              )}
            >
              <p className="font-semibold text-sm">{form[opt.field] ? opt.on : opt.off}</p>
              <p className={cn('text-xs mt-0.5', form[opt.field] ? 'text-white/70' : 'text-[#94a3b8]')}>{opt.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Submit */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
      )}

      <div className="flex gap-3 justify-end pb-8">
        <button
          type="button"
          onClick={() => router.push('/admin/imoveis')}
          className="px-6 py-3 rounded-xl border border-[#e2e8f0] text-[#475569] font-semibold text-sm hover:bg-[#f8fafc] transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors disabled:opacity-60 flex items-center gap-2 shadow-sm"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> A guardar...</> : isEdit ? 'Guardar alterações' : 'Publicar imóvel'}
        </button>
      </div>
    </form>
  )
}
