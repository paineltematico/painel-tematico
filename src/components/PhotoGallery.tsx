'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, ChevronLeft, X, Maximize2, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  fotos: string[]
  titulo: string
}

export default function PhotoGallery({ fotos, titulo }: Props) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const prev = useCallback(() => setCurrent((i) => (i === 0 ? fotos.length - 1 : i - 1)), [fotos.length])
  const next = useCallback(() => setCurrent((i) => (i === fotos.length - 1 ? 0 : i + 1)), [fotos.length])

  useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') setLightbox(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, prev, next])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  if (!fotos || fotos.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden bg-[#1e293b] aspect-[16/9] flex items-center justify-center">
        <span className="text-white/20 text-8xl font-serif font-bold select-none">PT</span>
      </div>
    )
  }

  return (
    <>
      {/* ─── Main Gallery ─── */}
      <div className="space-y-3">
        {/* Hero image */}
        <div
          className="relative rounded-2xl overflow-hidden bg-[#1e293b] group cursor-zoom-in"
          style={{ aspectRatio: '16/9' }}
          onClick={() => setLightbox(true)}
        >
          <img
            key={fotos[current]}
            src={fotos[current]}
            alt={`${titulo} — foto ${current + 1}`}
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-xl p-3 flex items-center gap-2 text-[#1F3F44] text-sm font-medium shadow">
              <ZoomIn className="w-4 h-4" /> Ver em ecrã completo
            </div>
          </div>

          {/* Counter */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
            {current + 1} / {fotos.length}
          </div>

          {/* Nav arrows (shown only if multiple photos) */}
          {fotos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5 text-[#1F3F44]" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5 text-[#1F3F44]" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {fotos.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {fotos.slice(0, 5).map((foto, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'relative rounded-xl overflow-hidden aspect-square transition-all',
                  i === current
                    ? 'ring-2 ring-[#00545F] ring-offset-2'
                    : 'opacity-70 hover:opacity-100'
                )}
              >
                <img src={foto} alt="" className="w-full h-full object-cover" />
                {i === 4 && fotos.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">+{fotos.length - 5}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Lightbox ─── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            onClick={() => setLightbox(false)}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
            {current + 1} / {fotos.length}
          </div>

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              key={`lb-${fotos[current]}`}
              src={fotos[current]}
              alt={`${titulo} — foto ${current + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Nav arrows */}
          {fotos.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); prev() }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); next() }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Bottom thumbnail strip */}
          {fotos.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/40 rounded-xl backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {fotos.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    'w-12 h-8 rounded-lg overflow-hidden transition-all flex-shrink-0',
                    i === current ? 'ring-2 ring-[#00545F] opacity-100' : 'opacity-50 hover:opacity-80'
                  )}
                >
                  <img src={f} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
