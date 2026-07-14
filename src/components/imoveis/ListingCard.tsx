'use client'

import { useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { MapPin, Bed, Bath, Car, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatPrice, formatArea } from '@/lib/utils'
import type { Imovel } from '@/types/database'

/**
 * Cartão de imóvel "photo-first" para a listagem: fotografia grande com
 * mini-galeria deslizável (swipe nativo com snap no mobile; setas no desktop),
 * pontos de posição e informação essencial por baixo. Todo o cartão navega
 * para o detalhe — as setas/pontos não.
 */
export default function ListingCard({ imovel }: { imovel: Imovel }) {
  const fotos = imovel.fotos?.length ? imovel.fotos.slice(0, 6) : []
  const trackRef = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(0)

  const onScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    setIdx((prev) => (prev === i ? prev : i))
  }, [])

  const go = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const next = Math.max(0, Math.min(fotos.length - 1, idx + dir))
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <Link
      href={`/imoveis/${imovel.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden ring-1 ring-[#E8E4DE] hover:ring-[#d8d2c8] hover:shadow-[0_18px_50px_-20px_rgba(31,63,68,0.28)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* ── Fotografia / mini-galeria ── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#EDEAE4]">
        {fotos.length > 0 ? (
          <div
            ref={trackRef}
            onScroll={onScroll}
            className="flex h-full w-full overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {fotos.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt={`${imovel.titulo} — fotografia ${i + 1}`}
                loading="lazy"
                draggable={false}
                className="h-full w-full shrink-0 snap-center object-cover"
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1F3F44] to-[#0f2427] flex items-center justify-center">
            <span className="text-white/15 text-6xl font-serif font-bold select-none">PT</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/95 text-[#1F3F44] shadow-sm">
            {imovel.tipo}
          </span>
          {imovel.tipologia && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#1F3F44]/85 text-white backdrop-blur-sm">
              {imovel.tipologia}
            </span>
          )}
        </div>
        {imovel.destaque && (
          <span className="absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#00545F] text-white pointer-events-none">
            Destaque
          </span>
        )}

        {fotos.length > 1 && (
          <>
            {/* Setas — só desktop, aparecem no hover */}
            <button
              type="button"
              aria-label="Fotografia anterior"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                go(-1)
              }}
              className={cn(
                'hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow items-center justify-center text-[#1F3F44] hover:bg-white transition-all opacity-0 group-hover:opacity-100',
                idx === 0 && 'group-hover:opacity-40 pointer-events-none'
              )}
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <button
              type="button"
              aria-label="Fotografia seguinte"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                go(1)
              }}
              className={cn(
                'hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow items-center justify-center text-[#1F3F44] hover:bg-white transition-all opacity-0 group-hover:opacity-100',
                idx === fotos.length - 1 && 'group-hover:opacity-40 pointer-events-none'
              )}
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>

            {/* Pontos de posição */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
              {fotos.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full bg-white shadow-sm transition-all duration-300',
                    i === idx ? 'w-4 opacity-100' : 'w-1.5 opacity-55'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Informação ── */}
      <div className="p-5">
        {(imovel.localizacao || imovel.cidade) && (
          <p className="flex items-center gap-1.5 text-[#8a8377] text-xs mb-2">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {[imovel.localizacao, imovel.cidade].filter(Boolean).join(', ')}
          </p>
        )}

        <h3 className="font-serif font-semibold text-[#1F3F44] text-lg leading-snug mb-3 line-clamp-2 group-hover:text-[#00545F] transition-colors">
          {imovel.titulo}
        </h3>

        <div className="flex items-center gap-4 text-[#6b7572] text-xs mb-4">
          {imovel.quartos != null && (
            <span className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5" /> {imovel.quartos}
            </span>
          )}
          {imovel.casas_banho != null && (
            <span className="flex items-center gap-1.5">
              <Bath className="w-3.5 h-3.5" /> {imovel.casas_banho}
            </span>
          )}
          {imovel.area_m2 && (
            <span className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5" /> {formatArea(imovel.area_m2)}
            </span>
          )}
          {imovel.garagem && (
            <span className="flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5" /> Garagem
            </span>
          )}
        </div>

        <div className="border-t border-[#EFEBE4] pt-4 flex items-center justify-between">
          {imovel.preco ? (
            <p className="text-[#00545F] font-bold text-lg font-serif">
              {formatPrice(imovel.preco, imovel.tipo)}
            </p>
          ) : (
            <p className="text-[#a39b8d] text-sm">Preço sob consulta</p>
          )}
          <span className="text-xs font-semibold text-[#1F3F44] opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all">
            Ver imóvel →
          </span>
        </div>
      </div>
    </Link>
  )
}
