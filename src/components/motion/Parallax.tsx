'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ParallaxProps {
  children: React.ReactNode
  /** Intensidade do parallax (px de deslocamento total). Negativo inverte. */
  amount?: number
  className?: string
}

/**
 * Move o conteúdo em contra-scroll (parallax) enquanto atravessa o viewport.
 * Ideal para imagens de fundo. Ligado ao Lenis via ScrollTrigger (scrub).
 */
export default function Parallax({ children, amount = 80, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: -amount / 2 },
        {
          y: amount / 2,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      )
    }, el)
    return () => ctx.revert()
  }, [amount])

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  )
}
