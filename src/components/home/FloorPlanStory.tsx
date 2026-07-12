'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

type Floor = {
  n: string
  tag: string
  title: string
  desc: string
  photo: string
  /** Posição do foco (spotlight) sobre a planta, em % da largura. */
  band: { left: string; width: string }
}

const floors: Floor[] = [
  {
    n: '01',
    tag: 'Piso da rua',
    title: 'Entrada e garagem',
    desc: 'Chegada ao nível da rua, com garagem privativa e acesso direto ao logradouro ajardinado nas traseiras.',
    photo: '/images/merelim/render-3.jpeg',
    band: { left: '6%', width: '27%' },
  },
  {
    n: '02',
    tag: 'Piso intermédio',
    title: 'Zona social em open space',
    desc: 'Sala, jantar e cozinha num único espaço amplo e cheio de luz — o coração da casa, pensado para viver e receber.',
    photo: '/images/merelim/sala-real-3.jpeg',
    band: { left: '36%', width: '27%' },
  },
  {
    n: '03',
    tag: 'Piso superior',
    title: 'Três quartos, duas casas de banho',
    desc: 'A zona privada: três quartos e duas casas de banho, uma delas em suíte. Descanso e privacidade no piso de cima.',
    photo: '/images/merelim/quarto-real-3.jpeg',
    band: { left: '64%', width: '30%' },
  },
]

/**
 * "Scrollytelling" da planta do Lote 6: enquanto se faz scroll, um foco
 * (spotlight) percorre a planta piso a piso, e o texto + foto interior mudam
 * em sincronia. Fixação por `position: sticky` (robusto) e progresso via
 * ScrollTrigger. Em mobile / reduced-motion cai para uma versão empilhada.
 */
export default function FloorPlanStory() {
  const outerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const outer = outerRef.current
    if (!outer) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(min-width: 1024px)').matches) return

    const st = ScrollTrigger.create({
      trigger: outer,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const idx = Math.min(floors.length - 1, Math.floor(self.progress * floors.length))
        setActive((prev) => (prev === idx ? prev : idx))
      },
    })
    return () => st.kill()
  }, [])

  const current = floors[active]

  return (
    <section className="bg-[#1F3F44] text-white">
      {/* ── DESKTOP: scrollytelling fixo ── */}
      <div ref={outerRef} className="hidden lg:block relative" style={{ height: `${floors.length * 100}vh` }}>
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          {/* textura */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
              backgroundSize: '38px 38px',
            }}
          />
          <div className="relative max-w-7xl mx-auto w-full px-8 grid grid-cols-2 gap-12 items-center">
            {/* Painel de texto + foto */}
            <div>
              <p className="text-[#6BBFC9] text-sm font-semibold uppercase tracking-widest mb-4">
                Merelim S. Pedro · Lote 6 · Percurso pela planta
              </p>

              <div className="flex items-start gap-5 mb-6">
                <span className="font-serif text-6xl font-bold text-white/15 leading-none tabular-nums">
                  {current.n}
                </span>
                <div>
                  <p className="text-[#6BBFC9] text-xs font-semibold uppercase tracking-widest mb-1">
                    {current.tag}
                  </p>
                  <h3 className="font-serif text-3xl xl:text-4xl font-bold leading-tight">
                    {current.title}
                  </h3>
                </div>
              </div>

              <p className="text-white/70 leading-relaxed max-w-md mb-8 min-h-[3.5rem]">
                {current.desc}
              </p>

              {/* Foto interior — crossfade */}
              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden">
                {floors.map((f, i) => (
                  <Image
                    key={f.photo}
                    src={f.photo}
                    alt={f.title}
                    fill
                    sizes="(max-width: 1280px) 50vw, 600px"
                    className="object-cover transition-opacity duration-700"
                    style={{ opacity: i === active ? 1 : 0 }}
                  />
                ))}
              </div>

              {/* Progresso por piso */}
              <div className="flex gap-2 mt-6">
                {floors.map((f, i) => (
                  <div key={f.n} className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-[#6BBFC9] transition-all duration-500"
                      style={{ width: i <= active ? '100%' : '0%' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Planta com spotlight */}
            <div className="relative">
              <div className="relative w-full max-w-md mx-auto aspect-[1684/2382] rounded-2xl overflow-hidden bg-white">
                <Image
                  src="/images/merelim/planta-lote6-1.png"
                  alt="Planta do Lote 6 — Merelim S. Pedro"
                  fill
                  sizes="(max-width: 1280px) 50vw, 480px"
                  className="object-contain p-3"
                />
                {/* Spotlight que percorre os pisos (escurece o resto) */}
                <div
                  className="absolute top-[2%] h-[96%] rounded-xl transition-all duration-700 ease-out"
                  style={{
                    left: current.band.left,
                    width: current.band.width,
                    boxShadow: '0 0 0 9999px rgba(31,63,68,0.55)',
                    outline: '2px solid rgba(107,191,201,0.7)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE: versão empilhada estática ── */}
      <div className="lg:hidden px-4 sm:px-6 py-16">
        <p className="text-[#6BBFC9] text-sm font-semibold uppercase tracking-widest mb-3">
          Merelim S. Pedro · Lote 6
        </p>
        <h3 className="font-serif text-3xl font-bold mb-8">Um percurso pela planta</h3>
        <div className="relative w-full max-w-xs mx-auto aspect-[1684/2382] rounded-2xl overflow-hidden bg-white mb-10">
          <Image
            src="/images/merelim/planta-lote6-1.png"
            alt="Planta do Lote 6 — Merelim S. Pedro"
            fill
            sizes="90vw"
            className="object-contain p-3"
          />
        </div>
        <div className="space-y-8">
          {floors.map((f) => (
            <div key={f.n} className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
              <div className="relative w-full aspect-[16/10]">
                <Image src={f.photo} alt={f.title} fill sizes="100vw" className="object-cover" />
              </div>
              <div className="p-5">
                <p className="text-[#6BBFC9] text-xs font-semibold uppercase tracking-widest mb-1">
                  {f.tag}
                </p>
                <h4 className="font-serif text-xl font-bold mb-2">{f.title}</h4>
                <p className="text-white/70 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
