'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { useEditMode } from '@/context/EditModeContext'

interface Props {
  /** Current image URL (null = no photo) */
  src: string | null
  alt: string
  className?: string
  /** Storage folder, e.g. "equipa", "site" */
  folder: string
  /** Which DB table/record to update after upload */
  saveTarget:
    | { type: 'setting'; key: string }
    | { type: 'record'; table: string; id: string; column: string }
  /** Shown when there's no photo (edit mode placeholder) */
  placeholder?: React.ReactNode
}

export function EditableImage({
  src,
  alt,
  className = '',
  folder,
  saveTarget,
  placeholder,
}: Props) {
  const { editMode, beginSave, endSave } = useEditMode()
  const [url, setUrl] = useState(src)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      alert('Imagem demasiado grande (máx. 10MB)')
      return
    }

    setUploading(true)
    beginSave()

    try {
      // 1. Upload to Storage
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!uploadRes.ok) throw new Error('Upload falhou')
      const { url: newUrl } = await uploadRes.json() as { url: string }

      // 2. Save URL to DB
      const body =
        saveTarget.type === 'setting'
          ? { key: saveTarget.key, value: newUrl }
          : { table: saveTarget.table, id: saveTarget.id, column: saveTarget.column, value: newUrl }

      const endpoint =
        saveTarget.type === 'setting' ? '/api/admin/content' : '/api/admin/content/record'

      const saveRes = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!saveRes.ok) throw new Error('Guarda falhou')

      setUrl(newUrl)
      endSave(true)
    } catch (err) {
      console.error(err)
      endSave(false)
    } finally {
      setUploading(false)
    }
  }

  if (!editMode) {
    if (url) return <img src={url} alt={alt} className={className} />
    return <>{placeholder ?? null}</>
  }

  // ── EDIT MODE ──
  return (
    <div className="relative group cursor-pointer" onClick={() => !uploading && inputRef.current?.click()}>
      {/* Image or placeholder */}
      {url
        ? <img src={url} alt={alt} className={`${className} transition-opacity ${uploading ? 'opacity-50' : 'group-hover:opacity-75'}`} />
        : (
          <div className={`${className} bg-[#1F3F44]/20 flex items-center justify-center`}>
            {placeholder}
          </div>
        )}

      {/* Overlay */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-inherit transition-opacity
                       ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <div className="bg-[#1F3F44]/80 backdrop-blur-sm rounded-xl px-4 py-3 flex flex-col items-center gap-1.5 shadow-xl">
          {uploading
            ? <Loader2 className="w-5 h-5 text-[#4ecdc4] animate-spin" />
            : <Camera className="w-5 h-5 text-[#4ecdc4]" />}
          <span className="text-white text-xs font-semibold">
            {uploading ? 'A carregar…' : 'Alterar foto'}
          </span>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
