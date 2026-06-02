'use client'

import { useRef, useState } from 'react'
import { Upload, X, Loader2, Video, CheckCircle } from 'lucide-react'

interface Props {
  url: string
  onChange: (url: string) => void
  label?: string
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function VideoUpload({ url, onChange, label }: Props) {
  const inputRef              = useRef<HTMLInputElement>(null)
  const xhrRef                = useRef<XMLHttpRequest | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [error, setError]         = useState('')
  const [dragOver, setDragOver]   = useState(false)

  const upload = async (file: File | null) => {
    if (!file) return
    setError('')

    const allowed = ['video/mp4', 'video/webm', 'video/quicktime']
    if (!allowed.includes(file.type)) {
      setError('Formato não suportado. Use MP4, WebM ou MOV.')
      return
    }

    setUploading(true)
    setProgress(0)

    // Use XHR for upload progress tracking
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'hero')

    return new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest()
      xhrRef.current = xhr

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
      }

      xhr.onload = () => {
        const data = JSON.parse(xhr.responseText)
        if (xhr.status === 200) {
          onChange(data.url)
          setProgress(100)
        } else {
          setError(data.error ?? 'Erro no upload')
        }
        setUploading(false)
        resolve()
      }

      xhr.onerror = () => {
        setError('Falha na ligação. Tente novamente.')
        setUploading(false)
        resolve()
      }

      xhr.open('POST', '/api/admin/upload-video')
      xhr.send(fd)
    })
  }

  const cancel = () => {
    xhrRef.current?.abort()
    setUploading(false)
    setProgress(0)
  }

  const remove = async () => {
    if (!url) return
    const path = url.split('/videos/')[1]
    if (path) {
      await fetch(`/api/admin/upload-video?path=${encodeURIComponent(path)}`, { method: 'DELETE' })
    }
    onChange('')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    upload(e.dataTransfer.files[0] ?? null)
  }

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider">{label}</p>
      )}

      {/* Current video */}
      {url && !uploading && (
        <div className="flex items-center gap-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3">
          <div className="w-9 h-9 rounded-lg bg-[#00545F]/10 flex items-center justify-center flex-shrink-0">
            <Video className="w-5 h-5 text-[#00545F]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1F3F44] truncate">
              {url.split('/').pop()}
            </p>
            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-3 h-3" /> Carregado
            </p>
          </div>
          <button
            type="button"
            onClick={remove}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[#00545F] animate-spin" />
              <span className="text-sm text-[#1F3F44] font-medium">A carregar... {progress}%</span>
            </div>
            <button type="button" onClick={cancel} className="text-xs text-[#94a3b8] hover:text-red-500 transition-colors">
              Cancelar
            </button>
          </div>
          <div className="h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00545F] to-[#4ecdc4] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Drop zone — hide if already has video */}
      {!url && !uploading && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
            ${dragOver
              ? 'border-[#00545F] bg-teal-50'
              : 'border-[#e2e8f0] hover:border-[#00545F] hover:bg-teal-50/30'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
            className="hidden"
            onChange={(e) => upload(e.target.files?.[0] ?? null)}
          />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-[#00545F]/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-[#00545F]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1F3F44]">Carregar vídeo</p>
              <p className="text-xs text-[#94a3b8] mt-0.5">Arrasta aqui ou clica · MP4, WebM, MOV</p>
            </div>
          </div>
        </div>
      )}

      {/* Replace button when video exists */}
      {url && !uploading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full py-2 rounded-xl border border-[#e2e8f0] text-xs text-[#64748b] font-medium hover:bg-[#f8fafc] transition-colors"
        >
          Substituir vídeo
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
        className="hidden"
        onChange={(e) => upload(e.target.files?.[0] ?? null)}
      />

      {error && (
        <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  )
}
