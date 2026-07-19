'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { cn } from '@/lib/utils'

type LenisLike = { stop: () => void; start: () => void }

/**
 * Galeria "photo-first" pensada para mobile:
 * — Mobile: carrossel de swipe nativo (scroll-snap) de margem a margem, com
 *   contador; tocar abre o ecrã inteiro.
 * — Desktop: grelha editorial (1 grande + 4) com "+N fotografias".
 * — Lightbox: slides em scroll-snap horizontal (swipe nativo com inércia no
 *   telemóvel), setas e teclado no desktop, contador e miniaturas.
 */
export default function Gallery({
  images,
  title,
  className = '',
}: {
  images: string[]
  title: string
  className?: string
}) {
  const [open, setOpen] = useState<number | null>(null)
  const mobileTrackRef = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(0)

  const onMobileScroll = useCallback(() => {
    const el = mobileTrackRef.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    setIdx((prev) => (prev === i ? prev : i))
  }, [])

  if (images.length === 0) return null
  const extra = images.length - 5

  return (
    <div className={className}>
      {/* ── MOBILE: carrossel snap de margem a margem ── */}
      <div className="sm:hidden relative -mx-4">
        <div
          ref={mobileTrackRef}
          onScroll={onMobileScroll}
          className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setOpen(i)}
              className="relative w-full shrink-0 snap-center aspect-[4/3] bg-[#EDEAE4]"
              aria-label={`Abrir fotografia ${i + 1} em ecrã inteiro`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${title} — fotografia ${i + 1}`}
                loading={i < 2 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
        <span className="absolute bottom-3 right-4 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/55 text-white backdrop-blur-sm pointer-events-none">
          {idx + 1} / {images.length}
        </span>
      </div>

      {/* ── DESKTOP: grelha editorial ── */}
      <div className="hidden sm:grid grid-cols-4 grid-rows-2 gap-2 rounded-3xl overflow-hidden">
        {images.slice(0, 5).map((url, i) => {
          const isLast = i === 4 && extra > 0
          return (
            <button
              key={i}
              type="button"
              onClick={() => setOpen(i)}
              className={cn(
                'group relative overflow-hidden bg-[#EDEAE4]',
                i === 0 ? 'col-span-2 row-span-2 aspect-[4/3]' : 'aspect-auto'
              )}
              aria-label={`Abrir fotografia ${i + 1} em ecrã inteiro`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${title} — fotografia ${i + 1}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                draggable={false}
              />
              {isLast ? (
                <span className="absolute inset-0 bg-[#1F3F44]/55 backdrop-blur-[1px] flex items-center justify-center text-white font-semibold text-sm">
                  +{extra} fotografias
                </span>
              ) : (
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 flex items-center justify-center">
                  <Expand className="w-6 h-6 text-white drop-shadow" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {open !== null && <Lightbox images={images} title={title} initial={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

/**
 * Lightbox com swipe nativo: os slides vivem num contentor scroll-snap
 * horizontal a ocupar o ecrã — no telemóvel desliza-se com o dedo (inércia
 * do sistema), no desktop há setas e teclado. Bloqueia o scroll da página
 * (incluindo o Lenis) enquanto está aberto.
 */
export function Lightbox({
  images,
  title,
  initial,
  onClose,
}: {
  images: string[]
  title: string
  initial: number
  onClose: () => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(initial)

  const goTo = useCallback((i: number, smooth = true) => {
    const el = trackRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(images.length - 1, i))
    el.scrollTo({ left: clamped * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' })
  }, [images.length])

  // posição inicial + tracking do índice por scroll
  useEffect(() => {
    goTo(initial, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    setIdx((prev) => (prev === i ? prev : i))
  }, [])

  // ref-espelho do índice para o handler de teclado não ficar obsoleto
  const idxRef = useRef(idx)
  idxRef.current = idx

  // teclado + bloqueio de scroll da página (e do Lenis)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goTo(idxRef.current + 1)
      if (e.key === 'ArrowLeft') goTo(idxRef.current - 1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis
    lenis?.stop()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      lenis?.start()
    }
  }, [goTo, onClose])

  return (
    <div className="fixed inset-0 z-[9999] bg-[#10191a]/[0.97] flex flex-col" role="dialog" aria-modal="true" aria-label={`Galeria — ${title}`}>
      {/* topo: contador + fechar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 shrink-0">
        <span className="text-white/60 text-sm tabular-nums">
          {idx + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar galeria"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* slides — swipe nativo */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="h-full flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((url, i) => (
            <div key={i} className="h-full w-full shrink-0 snap-center flex items-center justify-center px-2 sm:px-14">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${title} — fotografia ${i + 1}`}
                loading={Math.abs(i - initial) < 3 ? 'eager' : 'lazy'}
                className="max-h-full max-w-full object-contain select-none"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Fotografia anterior"
              onClick={() => goTo(idx - 1)}
              className={cn(
                'hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white transition-all',
                idx === 0 && 'opacity-35 pointer-events-none'
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Fotografia seguinte"
              onClick={() => goTo(idx + 1)}
              className={cn(
                'hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white transition-all',
                idx === images.length - 1 && 'opacity-35 pointer-events-none'
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* miniaturas */}
      {images.length > 1 && (
        <div className="shrink-0 flex gap-1.5 px-4 py-3 overflow-x-auto justify-start sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir para a fotografia ${i + 1}`}
              className={cn(
                'shrink-0 w-12 h-9 rounded-md overflow-hidden ring-2 transition-all',
                i === idx ? 'ring-[#6BBFC9] opacity-100' : 'ring-transparent opacity-40 hover:opacity-70'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" loading="lazy" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
