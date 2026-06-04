'use client'

import { useRef, useState } from 'react'
import { Upload, X, Loader2, FileText, ImageIcon } from 'lucide-react'

interface Props {
  urls: string[]
  onChange: (urls: string[]) => void
  max?: number
}

function isPDF(url: string) {
  return url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('application/pdf')
}

function filename(url: string) {
  return decodeURIComponent(url.split('/').pop() ?? url).replace(/^\S+-\d+\./, '').slice(0, 50)
}

export default function PlantaUpload({ urls, onChange, max = 10 }: Props) {
  const inputRef   = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError('')
    const remaining = max - urls.length
    const toUpload  = Array.from(files).slice(0, remaining)
    if (toUpload.length === 0) { setError(`Máximo de ${max} plantas atingido.`); return }

    setLoading(true)
    const newUrls: string[] = []
    for (const file of toUpload) {
      if (file.size > 20 * 1024 * 1024) { setError(`"${file.name}" excede 20MB.`); continue }
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'projetos/plantas')
      const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) newUrls.push(data.url)
      else setError(data.error ?? 'Erro no upload')
    }
    onChange([...urls, ...newUrls])
    setLoading(false)
  }

  const remove = async (i: number) => {
    const url  = urls[i]
    const path = url.split('/media/')[1]
    if (path) await fetch(`/api/admin/upload?path=${encodeURIComponent(path)}`, { method: 'DELETE' })
    onChange(urls.filter((_, j) => j !== i))
  }

  return (
    <div className="space-y-3">
      {/* List */}
      {urls.length > 0 && (
        <div className="space-y-2">
          {urls.map((url, i) => (
            <div key={url} className="flex items-center gap-3 bg-[#f8fafc] rounded-xl px-4 py-3 border border-[#e2e8f0] group">
              {isPDF(url) ? (
                <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[#e2e8f0]">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <span className="text-sm text-[#64748b] truncate flex-1">{filename(url)}</span>
              <a href={url} target="_blank" rel="noreferrer"
                className="text-xs text-[#00545F] hover:underline flex-shrink-0">Ver</a>
              <button type="button" onClick={() => remove(i)}
                className="text-[#94a3b8] hover:text-red-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {urls.length < max && (
        <div
          onClick={() => !loading && inputRef.current?.click()}
          className="border-2 border-dashed border-[#e2e8f0] rounded-xl p-5 text-center cursor-pointer hover:border-[#00545F] hover:bg-teal-50/20 transition-all"
        >
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
            multiple className="hidden"
            onChange={(e) => upload(e.target.files)} />
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-[#00545F]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">A carregar…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Upload className="w-6 h-6 text-[#00545F]" />
              <p className="text-sm font-semibold text-[#1F3F44]">Carregar plantas</p>
              <p className="text-xs text-[#94a3b8]">PNG, JPG, WebP ou PDF · máx. 20MB</p>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}
