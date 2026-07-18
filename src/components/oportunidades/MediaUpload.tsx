'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Upload, X, Loader2, FileText, Check } from 'lucide-react'
import { isImagem } from '@/lib/oportunidades'

interface Props {
  oportunidadeId: string
  initial: string[]
  /** Campo da DB a actualizar */
  campo: 'fotos' | 'documentos'
}

const CONFIG = {
  fotos: {
    accept: 'image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.heic,.heif',
    hint: 'JPG, PNG, WebP ou HEIC (iPhone) · máx. 20MB cada',
    empty: 'Adicionar foto',
  },
  documentos: {
    accept: 'application/pdf,image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.heic,.heif',
    hint: 'PDF ou imagem (cadernetas, plantas, certidões) · máx. 20MB',
    empty: 'Adicionar documento',
  },
} as const

export default function MediaUpload({ oportunidadeId, initial, campo }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [urls, setUrls] = useState<string[]>(initial ?? [])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const cfg = CONFIG[campo]

  const persist = async (next: string[]) => {
    setUrls(next)
    const res = await fetch(`/api/admin/oportunidades/${oportunidadeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [campo]: next }),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    router.refresh()
  }

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError('')
    setUploading(true)
    const novos: string[] = []
    for (const file of Array.from(files)) {
      if (file.size > 20 * 1024 * 1024) { setError(`"${file.name}" excede 20MB.`); continue }
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', `oportunidades/${campo}`)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) novos.push(data.url)
      else setError(data.error ?? 'Erro no upload')
    }
    setUploading(false)
    if (novos.length) await persist([...urls, ...novos])
  }

  const remove = async (index: number) => {
    const url = urls[index]
    const path = url.split('/media/')[1]
    if (path) await fetch(`/api/admin/upload?path=${encodeURIComponent(path)}`, { method: 'DELETE' })
    await persist(urls.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-2">
        {urls.map((url, i) => (
          <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-[#e2e8f0] bg-[#f8fafc]">
            {isImagem(url) ? (
              <a href={url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
                <Image src={url} alt="" fill className="object-cover" sizes="120px" />
              </a>
            ) : (
              <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center h-full text-[#64748b] hover:text-[#00545F] p-2 transition-colors">
                <FileText className="w-7 h-7 mb-1" />
                <span className="text-[10px] text-center">PDF</span>
              </a>
            )}
            <button
              onClick={() => remove(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-lg bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square rounded-xl border-2 border-dashed border-[#e2e8f0] flex flex-col items-center justify-center text-[#94a3b8] hover:border-[#00545F] hover:text-[#00545F] transition-colors"
        >
          {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
          <span className="text-[10px] mt-1 px-1 text-center leading-tight">{cfg.empty}</span>
        </button>
      </div>
      <input ref={inputRef} type="file" multiple accept={cfg.accept} onChange={(e) => upload(e.target.files)} className="hidden" />
      {error && <p className="text-red-500 text-xs mb-1">{error}</p>}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-[#94a3b8]">{cfg.hint}</p>
        {saved
          ? <span className="flex items-center gap-1 text-xs text-emerald-600 flex-shrink-0"><Check className="w-3 h-3" /> Guardado</span>
          : uploading
            ? <span className="flex items-center gap-1 text-xs text-[#00545F] flex-shrink-0"><Loader2 className="w-3 h-3 animate-spin" /> A guardar…</span>
            : urls.length > 0
              ? <span className="text-xs text-[#94a3b8] flex-shrink-0">Guarda automaticamente</span>
              : null}
      </div>
    </div>
  )
}
