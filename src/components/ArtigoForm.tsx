'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import type { Artigo } from '@/types/database'
import ImageUpload from '@/components/admin/ImageUpload'

type FormState = {
  titulo: string; slug: string; resumo: string; conteudo: string
  imagem: string; categoria: string; publicado: boolean
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all'
const labelCls = 'block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5'

const CATEGORIAS = ['Mercado Imobiliário', 'Dicas de Investimento', 'Notícias', 'Guias', 'Projetos']

export default function ArtigoForm({ artigo }: { artigo?: Artigo }) {
  const router = useRouter()
  const isEdit = Boolean(artigo)
  const [form, setForm] = useState<FormState>({
    titulo: artigo?.titulo ?? '',
    slug: artigo?.slug ?? '',
    resumo: artigo?.resumo ?? '',
    conteudo: artigo?.conteudo ?? '',
    imagem: artigo?.imagem ?? '',
    categoria: artigo?.categoria ?? 'Mercado Imobiliário',
    publicado: artigo?.publicado ?? false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titulo = e.target.value
    setForm((f) => ({ ...f, titulo, ...(!isEdit && { slug: slugify(titulo) }) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const payload = {
        titulo: form.titulo, slug: form.slug,
        resumo: form.resumo || null,
        conteudo: form.conteudo || null,
        imagem: form.imagem || null,
        categoria: form.categoria,
        publicado: form.publicado,
        publicado_em: form.publicado ? (artigo?.publicado_em ?? new Date().toISOString()) : null,
      }
      if (isEdit) {
        const { error: err } = await supabase.from('blog_posts').update(payload).eq('id', artigo!.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('blog_posts').insert(payload)
        if (err) throw err
      }
      router.push('/admin/blog')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao guardar')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-2xl border border-[#E8E3E3] p-6 space-y-4">
        <h2 className="font-serif font-semibold text-[#1F3F44]">Artigo</h2>
        <div>
          <label className={labelCls}>Título *</label>
          <input required value={form.titulo} onChange={handleTituloChange} className={inputCls} placeholder="Título do artigo" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Slug</label>
            <input value={form.slug} onChange={set('slug')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Categoria</label>
            <select value={form.categoria} onChange={set('categoria')} className={inputCls + ' bg-white'}>
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Imagem de capa</label>
          <ImageUpload
            urls={form.imagem ? [form.imagem] : []}
            onChange={(urls) => setForm(f => ({ ...f, imagem: urls[0] ?? '' }))}
            folder="blog"
            single
          />
        </div>
        <div>
          <label className={labelCls}>Resumo <span className="font-normal text-[#94a3b8] normal-case">(intro em destaque)</span></label>
          <textarea rows={2} value={form.resumo} onChange={set('resumo')} className={`${inputCls} resize-none`} placeholder="Uma frase introdutória..." />
        </div>
        <div>
          <label className={labelCls}>Conteúdo</label>
          <textarea rows={12} value={form.conteudo} onChange={set('conteudo')} className={`${inputCls} resize-y`} placeholder="Texto do artigo... (parágrafos separados por linha em branco)" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E3E3] p-6 flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.publicado} onChange={(e) => setForm((f) => ({ ...f, publicado: e.target.checked }))} className="w-4 h-4 accent-[#00545F]" />
          <div>
            <p className="text-sm font-medium text-[#1F3F44]">Publicar artigo</p>
            <p className="text-xs text-[#94a3b8]">Visível publicamente em /blog</p>
          </div>
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-7 py-3 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors disabled:opacity-60 shadow-sm">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> A guardar...</> : (isEdit ? 'Guardar alterações' : 'Criar artigo')}
        </button>
        <button type="button" onClick={() => router.back()} className="px-5 py-3 rounded-xl border border-[#E8E3E3] text-[#64748b] text-sm hover:bg-[#F2EEEE] transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}
