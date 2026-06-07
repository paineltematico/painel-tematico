'use client'

import { useState, useRef } from 'react'
import { useEditMode } from '@/context/EditModeContext'
import { ImagePlus, Loader2, Check, X } from 'lucide-react'

interface Props {
  /** site_settings key, e.g. "hero_contacto_image" */
  settingKey: string
  /** Current URL (from DB / defaults) */
  currentUrl: string
  /** CSS class for the background div */
  className?: string
  /** Extra inline styles */
  style?: React.CSSProperties
  /** Parallax overlay opacity (0–1) — shown in the preview badge */
  overlayOpacity?: number
}

export function EditableHeroImage({
  settingKey,
  currentUrl,
  className = '',
  style = {},
  overlayOpacity = 0.5,
}: Props) {
  const { editMode, beginSave, endSave } = useEditMode()
  const [url, setUrl] = useState(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file) return
    setUploading(true)
    setError('')
    beginSave()

    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'media')
    formData.append('folder', 'heroes')

    try {
      // Upload to Supabase via existing upload API
      const upRes = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      if (!upRes.ok) throw new Error('Upload falhou')
      const { url: newUrl } = await upRes.json()

      // Save to site_settings
      const saveRes = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: settingKey, value: newUrl }),
      })
      if (!saveRes.ok) throw new Error('Erro ao guardar')

      setUrl(newUrl)
      setSaved(true)
      endSave(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(String(e))
      endSave(false)
    }
    setUploading(false)
  }

  // Background div — same in both modes
  const bgDiv = (
    <div
      className={className}
      style={{
        backgroundImage: url ? `url(${url})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // parallax
        ...style,
      }}
    />
  )

  if (!editMode) return bgDiv

  return (
    <>
      {bgDiv}

      {/* Edit overlay button */}
      <div
        data-edit-safe
        className="absolute top-4 right-4 z-50 flex flex-col items-end gap-2"
      >
        {/* Upload button */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xl transition-all
                     bg-[#1F3F44]/90 text-white border border-white/20 hover:bg-[#1F3F44] backdrop-blur-sm disabled:opacity-60"
        >
          {uploading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> A carregar…</>
            : saved
              ? <><Check className="w-4 h-4 text-emerald-400" /> Guardado!</>
              : <><ImagePlus className="w-4 h-4 text-[#4ecdc4]" /> Imagem do hero</>
          }
        </button>

        {/* Info badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 text-white/60 text-xs backdrop-blur-sm border border-white/10">
          <span className="w-2 h-2 rounded-full bg-[#4ecdc4]" />
          Parallax · filtro {Math.round(overlayOpacity * 100)}% opacidade
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/80 text-red-200 text-xs border border-red-700/50">
            <X className="w-3 h-3 flex-shrink-0" />
            {error}
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>
    </>
  )
}
