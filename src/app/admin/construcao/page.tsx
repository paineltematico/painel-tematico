'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Loader2, Check, Video } from 'lucide-react'
import type { VideoObra } from '@/types/database'

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all'

export default function AdminConstrucaoPage() {
  const [videos, setVideos] = useState<VideoObra[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [newVideo, setNewVideo] = useState({ titulo: '', url: '', projeto: '', thumbnail: '' })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch('/api/admin/videos-obra')
      .then(r => (r.ok ? r.json() : []))
      .then((data) => {
        setVideos((data ?? []) as VideoObra[])
        setLoading(false)
      })
  }, [])

  const addVideo = async () => {
    if (!newVideo.titulo || !newVideo.url) return
    setAdding(true)
    const res = await fetch('/api/admin/videos-obra', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newVideo,
        thumbnail: newVideo.thumbnail || null,
        projeto: newVideo.projeto || null,
        ordem: videos.length,
        ativo: true,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setVideos((v) => [...v, data as VideoObra])
      setNewVideo({ titulo: '', url: '', projeto: '', thumbnail: '' })
    }
    setAdding(false)
  }

  const toggleAtivo = async (id: string, ativo: boolean) => {
    setSaving(id)
    await fetch(`/api/admin/videos-obra/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo }),
    })
    setVideos((v) => v.map((x) => x.id === id ? { ...x, ativo } : x))
    setSaving(null)
  }

  const deleteVideo = async (id: string) => {
    if (!confirm('Eliminar este vídeo?')) return
    const res = await fetch(`/api/admin/videos-obra/${id}`, { method: 'DELETE' })
    if (res.ok) setVideos((v) => v.filter((x) => x.id !== id))
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#00545F]/10 flex items-center justify-center">
          <Video className="w-5 h-5 text-[#00545F]" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Vídeos de Obra</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Aparecem na página de Construção</p>
        </div>
      </div>

      {/* Add new */}
      <div className="bg-white rounded-2xl border border-[#E8E3E3] p-6 mb-6">
        <h2 className="font-serif font-semibold text-[#1F3F44] mb-4">Adicionar vídeo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Título *</label>
            <input value={newVideo.titulo} onChange={(e) => setNewVideo((v) => ({ ...v, titulo: e.target.value }))} className={inputCls} placeholder="Obra Esporões — Fundações" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">URL do vídeo *</label>
            <input value={newVideo.url} onChange={(e) => setNewVideo((v) => ({ ...v, url: e.target.value }))} className={inputCls} placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Projeto</label>
            <input value={newVideo.projeto} onChange={(e) => setNewVideo((v) => ({ ...v, projeto: e.target.value }))} className={inputCls} placeholder="Esporões" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Thumbnail URL <span className="text-[#94a3b8] normal-case font-normal">(opcional)</span></label>
            <input value={newVideo.thumbnail} onChange={(e) => setNewVideo((v) => ({ ...v, thumbnail: e.target.value }))} className={inputCls} placeholder="https://..." />
          </div>
        </div>
        <button onClick={addVideo} disabled={adding || !newVideo.titulo || !newVideo.url} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors disabled:opacity-60">
          {adding ? <><Loader2 className="w-4 h-4 animate-spin" /> A adicionar...</> : <><Plus className="w-4 h-4" /> Adicionar vídeo</>}
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-[#E8E3E3] overflow-hidden">
        {loading ? (
          <div className="p-10 text-center"><Loader2 className="w-6 h-6 text-[#94a3b8] animate-spin mx-auto" /></div>
        ) : videos.length === 0 ? (
          <div className="p-16 text-center">
            <Video className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
            <p className="text-[#64748b] text-sm">Nenhum vídeo adicionado ainda.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#E8E3E3]">
            {videos.map((v) => (
              <li key={v.id} className="flex items-center gap-3 p-4 hover:bg-[#F2EEEE]/50 transition-colors">
                <GripVertical className="w-4 h-4 text-[#E8E3E3] flex-shrink-0" />
                {/* Thumbnail */}
                <div className="w-16 h-10 rounded-lg overflow-hidden bg-[#1F3F44] flex-shrink-0">
                  {v.thumbnail ? <img src={v.thumbnail} alt="" className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-4 h-4 text-white/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1F3F44] truncate">{v.titulo}</p>
                  {v.projeto && <p className="text-xs text-[#94a3b8]">{v.projeto}</p>}
                </div>
                {/* Toggle */}
                <button
                  onClick={() => toggleAtivo(v.id, !v.ativo)}
                  disabled={saving === v.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${v.ativo ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-[#F2EEEE] text-[#94a3b8] hover:bg-[#E8E3E3]'}`}
                >
                  {saving === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  {v.ativo ? 'Ativo' : 'Oculto'}
                </button>
                <button onClick={() => deleteVideo(v.id)} className="p-2 rounded-lg text-[#94a3b8] hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
