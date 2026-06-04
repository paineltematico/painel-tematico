'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { MapPin, CheckCircle, Building2, Clock, ArrowLeft, ChevronDown } from 'lucide-react'
import type { Projeto } from '@/types/database'

interface Props {
  projeto: Projeto
  unidadesDisponiveis: number
}

const ESTADO = {
  em_curso:   { label: 'Em Construção', cls: 'bg-blue-500/20 text-blue-200 border-blue-400/30', Icon: Building2 },
  concluido:  { label: 'Concluído',     cls: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30', Icon: CheckCircle },
  brevemente: { label: 'Brevemente',    cls: 'bg-amber-500/20 text-amber-200 border-amber-400/30', Icon: Clock },
}

export default function ProjetoHero({ projeto, unidadesDisponiveis }: Props) {
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        if (bgRef.current) {
          bgRef.current.style.transform = `translateY(${window.scrollY * 0.38}px)`
        }
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const heroImg = projeto.imagem_hero || projeto.imagem
  const estado  = ESTADO[projeto.estado]
  const { Icon } = estado

  return (
    <section className="relative flex items-end overflow-hidden bg-[#0d1f21]"
      style={{ height: '100vh', minHeight: 600 }}>

      {/* Parallax background */}
      {heroImg && (
        <div
          ref={bgRef}
          className="absolute will-change-transform"
          style={{
            inset: '-25% 0',
            backgroundImage: `url(${heroImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 pb-20 pt-40">
        <Link href="/projetos"
          className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Todos os projetos
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[#6BBFC9] text-xs font-semibold uppercase tracking-[0.2em]">Empreendimento</span>
          <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${estado.cls}`}>
            <Icon className="w-3 h-3" />
            {estado.label}
          </span>
        </div>

        <h1 className="font-serif font-bold text-white leading-tight mb-3"
          style={{ fontSize: 'clamp(2.8rem,7vw,6rem)' }}>
          {projeto.nome}
        </h1>
        {projeto.subtitulo && (
          <p className="text-white/70 font-light mb-4 max-w-2xl"
            style={{ fontSize: 'clamp(1rem,1.8vw,1.3rem)' }}>
            {projeto.subtitulo}
          </p>
        )}
        {projeto.localizacao && (
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <MapPin className="w-4 h-4" />
            {projeto.cidade ? `${projeto.cidade} · ` : ''}{projeto.localizacao}
          </div>
        )}

        {/* Mini stats in hero */}
        <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-white/15">
          {projeto.unidades_total && (
            <div>
              <p className="font-serif font-bold text-white text-2xl">{projeto.unidades_total}</p>
              <p className="text-white/45 text-xs">Unidades</p>
            </div>
          )}
          <div>
            <p className="font-serif font-bold text-white text-2xl">
              {unidadesDisponiveis > 0 ? unidadesDisponiveis : projeto.unidades_disponiveis ?? '—'}
            </p>
            <p className="text-white/45 text-xs">Disponíveis</p>
          </div>
          {projeto.cidade && (
            <div>
              <p className="font-serif font-bold text-white text-2xl">{projeto.cidade}</p>
              <p className="text-white/45 text-xs">Localização</p>
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 animate-bounce">
        <ChevronDown className="w-5 h-5" />
      </div>
    </section>
  )
}
