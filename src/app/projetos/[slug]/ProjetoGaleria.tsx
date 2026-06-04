'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, Images } from 'lucide-react'

export default function ProjetoGaleria({ fotos }: { fotos: string[] }) {
  const [active, setActive] = useState<number | null>(null)

  const prev = useCallback(() => setActive(a => (a! - 1 + fotos.length) % fotos.length), [fotos.length])
  const next = useCallback(() => setActive(a => (a! + 1) % fotos.length), [fotos.length])
  const close = useCallback(() => setActive(null), [])

  useEffect(() => {
    if (active === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'Escape')     close()
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [active, next, prev, close])

  if (fotos.length === 0) return null

  return (
    <section className="py-24 bg-[#0d1f21]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 text-[#4ecdc4] text-xs font-semibold uppercase tracking-[0.2em] mb-2">
              <Images className="w-4 h-4" />
              Galeria
            </div>
            <h2 className="font-serif text-3xl font-bold text-white">
              {fotos.length} imagens
            </h2>
          </div>
          <p className="text-white/30 text-sm hidden sm:block">Clique numa imagem para ampliar</p>
        </div>

        {/* Masonry grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-3">
          {fotos.map((url, i) => (
            <div
              key={i}
              className="break-inside-avoid mb-3 group relative cursor-zoom-in overflow-hidden rounded-xl"
              onClick={() => setActive(i)}
            >
              <img
                src={url}
                alt={`Foto ${i + 1}`}
                loading="lazy"
                className="w-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-xl flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white drop-shadow opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {/* Index badge */}
              <span className="absolute top-3 left-3 text-[10px] font-bold text-white/60 bg-black/40 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {i + 1} / {fotos.length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/97 flex items-center justify-center"
          onClick={close}
        >
          {/* Image */}
          <img
            src={fotos[active]}
            alt={`Foto ${active + 1}`}
            className="max-h-[88vh] max-w-[88vw] object-contain rounded-lg shadow-2xl select-none"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Counter */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-sm font-medium tracking-wide">
            {active + 1} / {fotos.length}
          </div>

          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev / Next */}
          {fotos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Thumbnail strip */}
          {fotos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[90vw] overflow-x-auto pb-1">
              {fotos.map((url, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActive(i) }}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    i === active ? 'border-[#4ecdc4] opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
