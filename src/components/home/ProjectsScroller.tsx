'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { gsap } from 'gsap'
import ProjetoCard from '@/components/ProjetoCard'
import type { Projeto } from '@/types/database'

/**
 * "Projetos em Curso" — carrossel horizontal com scroll INFINITO (marquee).
 * Os cartões deslizam continuamente em loop; passa a pausa ao passar o rato.
 * Sem pinning/ScrollTrigger (que provocava o "flash branco" ao fazer scroll).
 * Respeita prefers-reduced-motion: cai para scroll horizontal nativo.
 */
export default function ProjectsScroller({ projetos }: { projetos: Projeto[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // O conteúdo é duplicado (2 cópias); um "set" é metade da largura total.
    let tween: gsap.core.Tween | null = null

    const build = () => {
      tween?.kill()
      gsap.set(track, { x: 0 })
      const oneSet = track.scrollWidth / 2
      if (oneSet <= 0) return
      const wrap = gsap.utils.wrap(-oneSet, 0)
      // ~60px por segundo — ritmo calmo, elegante.
      const duration = oneSet / 60
      tween = gsap.to(track, {
        x: `-=${oneSet}`,
        duration,
        ease: 'none',
        repeat: -1,
        modifiers: { x: (x) => `${wrap(parseFloat(x))}px` },
      })
    }

    build()
    // Recalcula quando as imagens/fontes assentam.
    const t = window.setTimeout(build, 600)
    window.addEventListener('resize', build)

    const pause = () => tween?.pause()
    const play = () => tween?.play()
    track.addEventListener('pointerenter', pause)
    track.addEventListener('pointerleave', play)

    return () => {
      tween?.kill()
      window.clearTimeout(t)
      window.removeEventListener('resize', build)
      track.removeEventListener('pointerenter', pause)
      track.removeEventListener('pointerleave', play)
    }
  }, [projetos.length])

  // Duplica a lista para o loop ser contínuo/sem costura.
  const loopList = [...projetos, ...projetos]

  return (
    <section className="bg-[#F2EEEE] py-20 overflow-hidden">
      {/* Cabeçalho */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-10">
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

      {/* Fila em loop infinito */}
      <div className="relative">
        {/* Esbatimento nas bordas para dar a sensação de continuidade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10 bg-gradient-to-r from-[#F2EEEE] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-l from-[#F2EEEE] to-transparent" />

        <div
          ref={trackRef}
          className="flex gap-5 lg:gap-8 w-max px-4 sm:px-6 lg:px-8 will-change-transform"
        >
          {loopList.map((p, i) => (
            <div key={`${p.id}-${i}`} className="shrink-0 w-[300px] sm:w-[360px]">
              <ProjetoCard projeto={p} />
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-10 sm:hidden">
        <Link
          href="/projetos"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1F3F44] text-white font-semibold text-sm"
        >
          Ver todos <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}
