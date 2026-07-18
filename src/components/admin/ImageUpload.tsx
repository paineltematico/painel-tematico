'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, ImageIcon, GripVertical } from 'lucide-react'

interface Props {
  urls: string[]
  onChange: (urls: string[]) => void
  folder?: string   // ex: "imoveis", "projetos", "equipa"
  max?: number      // máximo de fotos (default: 20)
  single?: boolean  // modo single (ex: foto de perfil)
}

export default function ImageUpload({ urls, onChange, folder = 'geral', max = 20, single = false }: Props) {
  const inputRef   = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState('')
  const [dragOver, setDragOver]   = useState(false)

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError('')

    const remaining = max - urls.length
    const toUpload  = Array.from(files).slice(0, single ? 1 : remaining)

    if (toUpload.length === 0) {
      setError(`Máximo de ${max} imagens atingido.`)
      return
    }

    setUploading(true)
    const newUrls: string[] = []

    for (const file of toUpload) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`"${file.name}" excede o limite de 10MB.`)
        continue
      }
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)

      const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()

      if (res.ok) {
        newUrls.push(data.url)
      } else {
        setError(data.error ?? 'Erro no upload')
      }
    }

    onChange(single ? newUrls : [...urls, ...newUrls])
    setUploading(false)
  }

  const remove = async (index: number) => {
    const url  = urls[index]
    // Extract path from URL for deletion
    const path = url.split('/media/')[1]
    if (path) {
      await fetch(`/api/admin/upload?path=${encodeURIComponent(path)}`, { method: 'DELETE' })
    }
    onChange(urls.filter((_, i) => i !== index))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    upload(e.dataTransfer.files)
  }

  return (
    <div className="space-y-3">

      {/* Preview grid */}
      {urls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {urls.map((url, i) => (
            <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-[#e2e8f0] bg-[#f8fafc]">
              <Image
                src={url}
                alt={`Foto ${i + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />
              {/* Remove button */}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {/* First badge */}
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-[#00545F] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  Principal
                </span>
              )}
              {/* Drag handle */}
              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-60 transition-opacity text-white">
                <GripVertical className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone — hidden in single mode if already has image */}
      {(!single || urls.length === 0) && urls.length < max && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
            ${dragOver
              ? 'border-[#00545F] bg-teal-50'
              : 'border-[#e2e8f0] hover:border-[#00545F] hover:bg-teal-50/30'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            multiple={!single}
            className="hidden"
            onChange={(e) => upload(e.target.files)}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-[#00545F] animate-spin" />
              <p className="text-sm text-[#64748b]">A carregar...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-[#00545F]/10 flex items-center justify-center">
                {urls.length > 0 ? <ImageIcon className="w-6 h-6 text-[#00545F]" /> : <Upload className="w-6 h-6 text-[#00545F]" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1F3F44]">
                  {urls.length > 0 ? 'Adicionar mais fotos' : 'Carregar fotos'}
                </p>
                <p className="text-xs text-[#94a3b8] mt-0.5">
                  Arrasta aqui ou clica para selecionar · JPEG, PNG, WebP · máx. 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      {urls.length > 1 && (
        <p className="text-xs text-[#94a3b8]">A primeira imagem é a principal. Remove para reordenar.</p>
      )}
    </div>
  )
}
