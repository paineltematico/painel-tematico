'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PropertyCard from '@/components/PropertyCard'
import type { Imovel } from '@/types/database'

/**
 * Carrossel horizontal dos imóveis em destaque — uma só fila, sem crescer em
 * altura nem alongar a página. Scroll nativo com snap + setas de navegação.
 */
export default function FeaturedCarousel({ imoveis }: { imoveis: Imovel[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const update = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 8)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }, [])

  useEffect(() => {
    update()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [update])

  const scrollByCards = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector('[data-card]') as HTMLElement | null
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {imoveis.map((imovel) => (
          <div
            key={imovel.id}
            data-card
            className="snap-start shrink-0 w-[85%] sm:w-[360px]"
          >
            <PropertyCard imovel={imovel} featured />
          </div>
        ))}
      </div>

      {/* Setas — só desktop, aparecem conforme há mais para ver */}
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => scrollByCards(-1)}
        className={`hidden lg:flex absolute -left-5 top-[7rem] w-11 h-11 rounded-full bg-white shadow-lg border border-[#e2e8f0] items-center justify-center text-[#1F3F44] hover:bg-[#1F3F44] hover:text-white transition-all ${canPrev ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        aria-label="Seguinte"
        onClick={() => scrollByCards(1)}
        className={`hidden lg:flex absolute -right-5 top-[7rem] w-11 h-11 rounded-full bg-white shadow-lg border border-[#e2e8f0] items-center justify-center text-[#1F3F44] hover:bg-[#1F3F44] hover:text-white transition-all ${canNext ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
