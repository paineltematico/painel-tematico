'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, Plus, X, Video, Upload } from 'lucide-react'
import type { Projeto, ProjetoEstado } from '@/types/database'
import ImageUpload from '@/components/admin/ImageUpload'
import PlantaUpload from '@/components/admin/PlantaUpload'

type FormState = {
  nome: string; slug: string; subtitulo: string; descricao: string
  localizacao: string; cidade: string
  imagem: string        // cover for listing cards
  imagem_hero: string   // full-screen hero image
  hero_video: string    // full-screen hero video (MP4/MOV/WEBM)
  fotos: string[]       // gallery
  plantas: string[]     // floor plan downloads
  videos: string[]      // YouTube / Vimeo URLs
  estado: ProjetoEstado
  unidades_total: string; unidades_disponiveis: string
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

  const videoInputRef = useRef<HTMLInputElement>(null)
  const [videoUploading, setVideoUploading] = useState(false)

  const [form, setForm] = useState<FormState>({
    nome:                projeto?.nome ?? '',
    slug:                projeto?.slug ?? '',
    subtitulo:           projeto?.subtitulo ?? '',
    descricao:           projeto?.descricao ?? '',
    localizacao:         projeto?.localizacao ?? '',
    cidade:              projeto?.cidade ?? '',
    imagem:              projeto?.imagem ?? '',
    imagem_hero:         projeto?.imagem_hero ?? '',
    hero_video:          projeto?.hero_video ?? '',
    fotos:               projeto?.fotos ?? [],
    plantas:             projeto?.plantas ?? [],
    videos:              projeto?.videos ?? [],
    estado:              projeto?.estado ?? 'em_curso',
    unidades_total:      projeto?.unidades_total?.toString() ?? '',
    unidades_disponiveis: projeto?.unidades_disponiveis?.toString() ?? '',
    ordem:               projeto?.ordem?.toString() ?? '0',
    ativo:               projeto?.ativo ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value
    setForm((f) => ({ ...f, nome, ...(!isEdit && { slug: slugify(nome) }) }))
  }

  const addVideo    = () => setForm(f => ({ ...f, videos: [...f.videos, ''] }))
  const removeVideo = (i: number) => setForm(f => ({ ...f, videos: f.videos.filter((_, j) => j !== i) }))
  const setVideo    = (i: number, val: string) =>
    setForm(f => { const v = [...f.videos]; v[i] = val; return { ...f, videos: v } })

  const uploadHeroVideo = async (file: File) => {
    if (!['video/mp4', 'video/quicktime', 'video/webm'].includes(file.type)) {
      setError('Use MP4, MOV ou WEBM para o vídeo hero.'); return
    }
    setVideoUploading(true); setError('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'projetos/hero')
    const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) setForm(f => ({ ...f, hero_video: data.url }))
    else setError(data.error ?? 'Erro no upload do vídeo')
    setVideoUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const payload = {
        nome:                 form.nome,
        slug:                 form.slug,
        subtitulo:            form.subtitulo || null,
        descricao:            form.descricao || null,
        localizacao:          form.localizacao || null,
        cidade:               form.cidade || null,
        imagem:               form.imagem || null,
        imagem_hero:          form.imagem_hero || null,
        hero_video:           form.hero_video || null,
        fotos:                form.fotos,
        plantas:              form.plantas,
        videos:               form.videos.filter(v => v.trim()),
        estado:               form.estado,
        unidades_total:       form.unidades_total ? parseInt(form.unidades_total) : null,
        unidades_disponiveis: form.unidades_disponiveis ? parseInt(form.unidades_disponiveis) : null,
        ordem:                parseInt(form.ordem) || 0,
        ativo:                form.ativo,
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

      {/* ── Informação geral ── */}
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
          <input value={form.subtitulo} onChange={set('subtitulo')} className={inputCls} placeholder="Moradias de excelência em Esporões" />
        </div>
        <div>
          <label className={labelCls}>Descrição</label>
          <textarea rows={4} value={form.descricao} onChange={set('descricao')} className={`${inputCls} resize-none`} placeholder="Descreva o projeto..." />
        </div>
      </div>

      {/* ── Imagens ── */}
      <div className="bg-white rounded-2xl border border-[#E8E3E3] p-6 space-y-6">
        <h2 className="font-serif font-semibold text-[#1F3F44]">Imagens</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#f0f0f0]">
          <div>
            <label className={labelCls}>Localização</label>
            <input value={form.localizacao} onChange={set('localizacao')} className={inputCls} placeholder="Esporões" />
          </div>
          <div>
            <label className={labelCls}>Cidade</label>
            <input value={form.cidade} onChange={set('cidade')} className={inputCls} placeholder="Braga" />
          </div>
        </div>

        {/* Cover */}
        <div>
          <label className={labelCls}>📌 Imagem de Capa <span className="normal-case text-[#94a3b8] font-normal">(aparece nos cards da listagem)</span></label>
          <ImageUpload
            urls={form.imagem ? [form.imagem] : []}
            onChange={(urls) => setForm(f => ({ ...f, imagem: urls[0] ?? '' }))}
            folder="projetos"
            single
          />
        </div>

        {/* Hero image */}
        <div>
          <label className={labelCls}>🖼 Imagem Hero <span className="normal-case text-[#94a3b8] font-normal">(fundo da página — efeito parallax; substituída pelo vídeo se existir)</span></label>
          <ImageUpload
            urls={form.imagem_hero ? [form.imagem_hero] : []}
            onChange={(urls) => setForm(f => ({ ...f, imagem_hero: urls[0] ?? '' }))}
            folder="projetos"
            single
          />
        </div>

        {/* Hero video */}
        <div>
          <label className={labelCls}>
            🎬 Vídeo Hero
            <span className="normal-case text-[#94a3b8] font-normal ml-1">(MP4, MOV ou WEBM — tem prioridade sobre a imagem)</span>
          </label>

          {form.hero_video ? (
            <div className="relative rounded-xl overflow-hidden border border-[#e2e8f0] bg-black">
              <video
                src={form.hero_video}
                className="w-full max-h-48 object-cover"
                controls={false}
                autoPlay muted loop playsInline
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <a href={form.hero_video} target="_blank" rel="noreferrer"
                  className="text-[10px] font-semibold text-white bg-black/60 px-2 py-1 rounded-full">
                  Ver
                </a>
                <button type="button"
                  onClick={() => setForm(f => ({ ...f, hero_video: '' }))}
                  className="text-white bg-red-500/80 hover:bg-red-600 px-2 py-1 rounded-full text-[10px] font-semibold">
                  Remover
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !videoUploading && videoInputRef.current?.click()}
              className="border-2 border-dashed border-[#e2e8f0] rounded-xl p-5 text-center cursor-pointer hover:border-[#00545F] hover:bg-teal-50/20 transition-all"
            >
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm,.mov"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadHeroVideo(f); e.target.value = '' }}
              />
              {videoUploading ? (
                <div className="flex items-center justify-center gap-2 text-[#00545F]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">A carregar vídeo…</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <Video className="w-6 h-6 text-[#00545F]" />
                  <p className="text-sm font-semibold text-[#1F3F44]">Carregar vídeo hero</p>
                  <p className="text-xs text-[#94a3b8]">MP4, MOV ou WEBM · autoplay silencioso em loop</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Galeria ── */}
      <div className="bg-white rounded-2xl border border-[#E8E3E3] p-6 space-y-4">
        <div>
          <h2 className="font-serif font-semibold text-[#1F3F44]">Galeria de Imagens</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">Até 20 imagens — aparecem em grelha na página do projeto.</p>
        </div>
        <ImageUpload
          urls={form.fotos}
          onChange={(urls) => setForm(f => ({ ...f, fotos: urls }))}
          folder="projetos"
          max={20}
        />
      </div>

      {/* ── Vídeos ── */}
      <div className="bg-white rounded-2xl border border-[#E8E3E3] p-6 space-y-4">
        <div>
          <h2 className="font-serif font-semibold text-[#1F3F44]">Vídeos</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">Links do YouTube ou Vimeo. Ex: https://www.youtube.com/watch?v=...</p>
        </div>
        <div className="space-y-2">
          {form.videos.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={url}
                onChange={(e) => setVideo(i, e.target.value)}
                className={inputCls}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <button type="button" onClick={() => removeVideo(i)}
                className="flex-shrink-0 px-3 rounded-xl border border-[#E8E3E3] text-[#94a3b8] hover:text-red-500 hover:border-red-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {form.videos.length < 6 && (
            <button type="button" onClick={addVideo}
              className="flex items-center gap-2 text-sm text-[#00545F] hover:text-[#006B78] font-semibold mt-1">
              <Plus className="w-4 h-4" /> Adicionar vídeo
            </button>
          )}
        </div>
      </div>

      {/* ── Plantas ── */}
      <div className="bg-white rounded-2xl border border-[#E8E3E3] p-6 space-y-4">
        <div>
          <h2 className="font-serif font-semibold text-[#1F3F44]">Plantas para Download</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">PDF ou imagens — os clientes podem descarregar diretamente na página.</p>
        </div>
        <PlantaUpload
          urls={form.plantas}
          onChange={(urls) => setForm(f => ({ ...f, plantas: urls }))}
          max={10}
        />
      </div>

      {/* ── Estado e unidades ── */}
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
              <input type="checkbox" checked={form.ativo}
                onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
                className="w-4 h-4 accent-[#00545F]" />
              <span className="text-sm font-medium text-[#1F3F44]">Projeto ativo (visível no site)</span>
            </label>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 px-7 py-3 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors disabled:opacity-60 shadow-sm">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> A guardar…</>
            : (isEdit ? 'Guardar alterações' : 'Criar projeto')}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-5 py-3 rounded-xl border border-[#E8E3E3] text-[#64748b] text-sm hover:bg-[#F2EEEE] transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}
