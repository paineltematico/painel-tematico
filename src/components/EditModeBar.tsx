'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Pencil, X, Check, Loader2, AlertCircle } from 'lucide-react'
import { useEditMode } from '@/context/EditModeContext'

export default function EditModeBar() {
  const { editMode, status } = useEditMode()
  const pathname = usePathname()

  // Don't show on admin pages — they have their own UI
  if (!editMode || pathname.startsWith('/admin')) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3
                    bg-[#0d1f21] text-white px-5 py-3 rounded-2xl shadow-2xl
                    border border-[#4ecdc4]/25 backdrop-blur-sm">

      {/* Icon */}
      <div className="w-7 h-7 rounded-lg bg-[#4ecdc4]/15 flex items-center justify-center flex-shrink-0">
        <Pencil className="w-3.5 h-3.5 text-[#4ecdc4]" />
      </div>

      {/* Label */}
      <span className="text-sm font-semibold tracking-tight">Modo de Edição</span>

      {/* Status */}
      <div className="w-px h-4 bg-white/15" />
      {status === 'saving' && (
        <span className="flex items-center gap-1.5 text-[#4ecdc4] text-xs font-medium">
          <Loader2 className="w-3 h-3 animate-spin" /> A guardar…
        </span>
      )}
      {status === 'saved' && (
        <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
          <Check className="w-3 h-3" /> Guardado
        </span>
      )}
      {status === 'error' && (
        <span className="flex items-center gap-1.5 text-red-400 text-xs font-medium">
          <AlertCircle className="w-3 h-3" /> Erro ao guardar
        </span>
      )}
      {status === 'idle' && (
        <span className="text-white/35 text-xs">Clique nos textos para editar</span>
      )}

      {/* Divider + exit */}
      <div className="w-px h-4 bg-white/15" />
      <Link
        href={`/edit/exit?return=${encodeURIComponent(pathname)}`}
        className="flex items-center gap-1 text-white/50 hover:text-red-400 transition-colors text-xs font-medium"
        title="Sair do modo de edição"
      >
        <X className="w-3.5 h-3.5" />
        Sair
      </Link>
    </div>
  )
}
