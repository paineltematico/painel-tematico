'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Smooth-scroll com inércia (estilo Raman Studio) via Lenis, ligado ao
 * ScrollTrigger do GSAP para que os efeitos de scrub/pin fiquem sincronizados.
 *
 * — Desligado no painel /admin (é uma app de gestão, não uma vitrine).
 * — Desligado com prefers-reduced-motion (acessibilidade).
 * Renderiza sempre os children (inclusive server components).
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  useEffect(() => {
    if (isAdmin) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    })

    // Mantém o ScrollTrigger a par da posição real do Lenis.
    lenis.on('scroll', ScrollTrigger.update)

    const onRaf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(onRaf)
    gsap.ticker.lagSmoothing(0)

    // Expõe globalmente para âncoras/CTA que queiram scroll suave programático.
    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis

    // Recalcula posições dos triggers depois de imagens/fontes assentarem.
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    const t1 = window.setTimeout(refresh, 400)
    const t2 = window.setTimeout(refresh, 1200)

    return () => {
      window.removeEventListener('load', refresh)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      gsap.ticker.remove(onRaf)
      lenis.destroy()
      delete (window as unknown as { __lenis?: Lenis }).__lenis
    }
  }, [isAdmin])

  return <>{children}</>
}
