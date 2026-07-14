'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { EditableText } from '@/components/EditableText'
import Magnetic from '@/components/motion/Magnetic'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface HomeHeroProps {
  videoUrl?: string | null
  linha1: string
  linha2: string
}

/**
 * Hero cinematográfico: intro em timeline ao carregar, zoom/parallax do vídeo
 * com scrub ao fazer scroll, e CTAs magnéticos.
 */
export default function HomeHero({ videoUrl, linha1, linha2 }: HomeHeroProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const videoWrapRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const content = contentRef.current
    const videoWrap = videoWrapRef.current
    if (!section || !content || !videoWrap) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      // Intro ao carregar
      const items = content.querySelectorAll('[data-hero-item]')
      gsap.set(items, { y: 40, autoAlpha: 0 })
      gsap.to(items, {
        y: 0,
        autoAlpha: 1,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.15,
        delay: 0.2,
      })

      // Zoom lento contínuo do vídeo (efeito "ken burns")
      gsap.fromTo(
        videoWrap,
        { scale: 1.08 },
        { scale: 1.16, duration: 12, ease: 'none', repeat: -1, yoyo: true }
      )

      // Parallax + fade do conteúdo ao sair do hero
      gsap.to(content, {
        yPercent: -18,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
      // Vídeo sobe mais devagar (profundidade)
      gsap.to(videoWrap, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative h-screen min-h-[640px] flex flex-col items-center justify-center overflow-hidden bg-[#1F3F44]"
    >
      {/* Vídeo de fundo */}
      <div ref={videoWrapRef} className="absolute inset-0 will-change-transform">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="/videos/hero-poster.jpg"
        >
          <source src={videoUrl || '/videos/hero.mp4'} type="video/mp4" />
        </video>
      </div>

      {/* Gradientes */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
      <div className="absolute inset-0 bg-[#1F3F44]/30" />

      {/* Conteúdo */}
      <div ref={contentRef} className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div data-hero-item className="mb-10 flex justify-center">
          <Image
            src="/logos/logo-white.png"
            alt="Painel Temático"
            width={220}
            height={66}
            className="h-14 w-auto object-contain drop-shadow-lg"
            priority
          />
        </div>

        <h1
          data-hero-item
          className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-5 drop-shadow-sm"
        >
          <EditableText settingKey="hero_linha1" value={linha1} />
        </h1>
        <p
          data-hero-item
          className="text-white/80 text-lg sm:text-xl font-light tracking-widest uppercase mb-12"
        >
          <EditableText settingKey="hero_linha2" value={linha2} />
        </p>

        <div data-hero-item className="flex flex-col sm:flex-row gap-4 justify-center">
          <Magnetic>
            <Link
              href="/imoveis"
              className="block px-8 py-4 rounded-xl bg-white text-[#1F3F44] font-semibold text-sm tracking-wide hover:bg-[#F2EEEE] transition-colors shadow-xl"
            >
              Ver Imóveis
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              href="/visita"
              className="block px-8 py-4 rounded-xl bg-[#00545F] text-white font-semibold text-sm tracking-wide hover:bg-[#006B78] transition-colors shadow-xl border border-[#00545F]/50"
            >
              Agendar Visita
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              href="/contacto"
              className="block px-8 py-4 rounded-xl border border-white/40 text-white font-semibold text-sm tracking-wide hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Fale Connosco
            </Link>
          </Magnetic>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 z-10">
        <span className="text-xs tracking-widest uppercase">Explorar</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </div>
    </section>
  )
}
