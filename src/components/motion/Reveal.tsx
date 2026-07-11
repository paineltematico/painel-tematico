'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

interface RevealProps {
  children: React.ReactNode
  /** Direção de entrada. 'none' = só fade. */
  from?: Direction
  /** Atraso em segundos. */
  delay?: number
  /** Distância do deslize em px. */
  distance?: number
  /** Anima os filhos diretos em cascata (stagger). */
  stagger?: boolean
  className?: string
  as?: 'div' | 'section' | 'ul' | 'li' | 'span'
}

const offset: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 1 },
  down: { y: -1 },
  left: { x: 1 },
  right: { x: -1 },
  none: {},
}

/**
 * Revela conteúdo ao entrar no viewport (fade + deslize), com máscara suave.
 * Respeita prefers-reduced-motion (mostra imediatamente).
 */
export default function Reveal({
  children,
  from = 'up',
  delay = 0,
  distance = 48,
  stagger = false,
  className,
  as = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const o = offset[from]
    const targets: gsap.TweenTarget = stagger ? Array.from(el.children) : el

    const ctx = gsap.context(() => {
      // Esconde via JS (não inline) para que sem-JS/crawlers vejam tudo.
      gsap.set(targets, {
        autoAlpha: 0,
        x: (o.x ?? 0) * distance,
        y: (o.y ?? 0) * distance,
      })
      gsap.to(
        targets,
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: 0.9,
          delay,
          ease: 'power3.out',
          stagger: stagger ? 0.12 : 0,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )
    }, el)

    return () => ctx.revert()
  }, [from, delay, distance, stagger])

  const Tag = as as React.ElementType
  return (
    <Tag ref={ref} className={className} style={{ visibility: 'hidden' }}>
      {children}
    </Tag>
  )
}
