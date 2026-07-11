'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProjetoCard from '@/components/ProjetoCard'
import type { Projeto } from '@/types/database'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Secção de projetos com scroll HORIZONTAL fixado (pinned) no desktop —
 * o scroll vertical passa a mover a fila de cartões, estilo Raman Studio.
 * Em mobile / reduced-motion cai para scroll horizontal nativo.
 */
export default function ProjectsScroller({ projetos }: { projetos: Projeto[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    const pin = pinRef.current
    if (!section || !track || !pin) return

    const mm = gsap.matchMedia()

    // Desktop: pin + scroll horizontal com scrub
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const getScroll = () => track.scrollWidth - pin.clientWidth
      if (getScroll() <= 0) return

      const tween = gsap.to(track, {
        x: () => -getScroll(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getScroll()}`,
          pin: pin,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })
      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
        gsap.set(track, { x: 0 })
      }
    })

    return () => mm.revert()
  }, [projetos.length])

  return (
    <section ref={sectionRef} className="bg-[#F2EEEE] overflow-hidden">
      <div ref={pinRef} className="lg:h-screen lg:flex lg:flex-col lg:justify-center py-20 lg:py-0">
        {/* Cabeçalho */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-8 lg:mb-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[#00545F] text-sm font-semibold uppercase tracking-widest mb-2">
                Empreendimentos
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F3F44]">
                Projetos em Curso
              </h2>
            </div>
            <Link
              href="/projetos"
              className="hidden sm:flex items-center gap-2 text-[#00545F] font-semibold text-sm hover:gap-3 transition-all"
            >
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Fila de cartões — pinned/scrub no desktop, scroll nativo no mobile */}
        <div className="overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 pl-4 sm:pl-6 lg:pl-0" style={{ scrollbarWidth: 'none' }}>
          <div
            ref={trackRef}
            className="flex gap-5 lg:gap-8 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))] w-max lg:w-max will-change-transform"
          >
            {projetos.map((p) => (
              <ProjetoCard key={p.id} projeto={p} />
            ))}
          </div>
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            href="/projetos"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1F3F44] text-white font-semibold text-sm"
          >
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
