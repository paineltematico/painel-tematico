'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import type { Projeto, ProjetoEstado } from '@/types/database'
import ImageUpload from '@/components/admin/ImageUpload'

type FormState = {
  nome: string; slug: string; subtitulo: string; descricao: string
  localizacao: string; cidade: string; imagem: string
  estado: ProjetoEstado; unidades_total: string; unidades_disponiveis: string
  ordem: string; ativo: boolean
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all'
const labelCls = 'block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5'

export default function ProjetoForm({ projeto }: { projeto?: Projeto }) {
  const router = useRouter()
  const isEdit = Boolean(projeto)

  const [form, setForm] = useState<FormState>({
    nome: projeto?.nome ?? '',
    slug: projeto?.slug ?? '',
    subtitulo: projeto?.subtitulo ?? '',
    descricao: projeto?.descricao ?? '',
    localizacao: projeto?.localizacao ?? '',
    cidade: projeto?.cidade ?? '',
    imagem: projeto?.imagem ?? '',
    estado: projeto?.estado ?? 'em_curso',
    unidades_total: projeto?.unidades_total?.toString() ?? '',
    unidades_disponiveis: projeto?.unidades_disponiveis?.toString() ?? '',
    ordem: projeto?.ordem?.toString() ?? '0',
    ativo: projeto?.ativo ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value
    setForm((f) => ({ ...f, nome, ...(!isEdit && { slug: slugify(nome) }) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const payload = {
        nome: form.nome, slug: form.slug,
        subtitulo: form.subtitulo || null,
        descricao: form.descricao || null,
        localizacao: form.localizacao || null,
        cidade: form.cidade || null,
        imagem: form.imagem || null,
        estado: form.estado,
        unidades_total: form.unidades_total ? parseInt(form.unidades_total) : null,
        unidades_disponiveis: form.unidades_disponiveis ? parseInt(form.unidades_disponiveis) : null,
        ordem: parseInt(form.ordem) || 0,
        ativo: form.ativo,
      }
      if (isEdit) {
        const { error: err } = await supabase.from('projetos').update(payload).eq('id', projeto!.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('projetos').insert(payload)
        if (err) throw err
      }
      router.push('/admin/projetos')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao guardar')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-2xl border border-[#E8E3E3] p-6 space-y-4">
        <h2 className="font-serif font-semibold text-[#1F3F44]">Informação geral</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nome *</label>
            <input required value={form.nome} onChange={handleNomeChange} className={inputCls} placeholder="Esporões" />
          </div>
          <div>
            <label className={labelCls}>Slug</label>
            <input value={form.slug} onChange={set('slug')} className={inputCls} placeholder="esporoes" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Subtítulo</label>
          <input value={form.subtitulo} onChange={set('subtitulo')} className={inputCls} placeholder="Moradias de excelência" />
        </div>
        <div>
          <label className={labelCls}>Descrição</label>
          <textarea rows={3} value={form.descricao} onChange={set('descricao')} className={`${inputCls} resize-none`} placeholder="Descreva o projeto..." />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E3E3] p-6 space-y-4">
        <h2 className="font-serif font-semibold text-[#1F3F44]">Localização e imagem</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Localização</label>
            <input value={form.localizacao} onChange={set('localizacao')} className={inputCls} placeholder="Esporões" />
          </div>
          <div>
            <label className={labelCls}>Cidade</label>
            <input value={form.cidade} onChange={set('cidade')} className={inputCls} placeholder="Braga" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Imagem de capa</label>
          <ImageUpload
            urls={form.imagem ? [form.imagem] : []}
            onChange={(urls) => setForm(f => ({ ...f, imagem: urls[0] ?? '' }))}
            folder="projetos"
            single
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E3E3] p-6 space-y-4">
        <h2 className="font-serif font-semibold text-[#1F3F44]">Estado e unidades</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Estado</label>
            <select value={form.estado} onChange={set('estado')} className={inputCls + ' bg-white'}>
              <option value="em_curso">Em Curso</option>
              <option value="concluido">Concluído</option>
              <option value="brevemente">Brevemente</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Total de unidades</label>
            <input type="number" min="0" value={form.unidades_total} onChange={set('unidades_total')} className={inputCls} placeholder="10" />
          </div>
          <div>
            <label className={labelCls}>Unidades disponíveis</label>
            <input type="number" min="0" value={form.unidades_disponiveis} onChange={set('unidades_disponiveis')} className={inputCls} placeholder="4" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Ordem de exibição</label>
            <input type="number" min="0" value={form.ordem} onChange={set('ordem')} className={inputCls} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.ativo} onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))} className="w-4 h-4 accent-[#00545F]" />
              <span className="text-sm font-medium text-[#1F3F44]">Projeto ativo (visível no site)</span>
            </label>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-7 py-3 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors disabled:opacity-60 shadow-sm">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> A guardar...</> : (isEdit ? 'Guardar alterações' : 'Criar projeto')}
        </button>
        <button type="button" onClick={() => router.back()} className="px-5 py-3 rounded-xl border border-[#E8E3E3] text-[#64748b] text-sm hover:bg-[#F2EEEE] transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}
