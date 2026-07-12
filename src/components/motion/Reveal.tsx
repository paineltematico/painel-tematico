'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

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
 *
 * Usa IntersectionObserver como gatilho (fiável e independente da medição do
 * ScrollTrigger com o smooth-scroll) + failsafes que garantem que o conteúdo
 * NUNCA fica preso invisível. Respeita prefers-reduced-motion.
 */
export default function Reveal({
  children,
  from = 'up',
  delay = 0,
  distance = 56,
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
    const targets: HTMLElement[] = stagger
      ? (Array.from(el.children) as HTMLElement[])
      : [el]
    if (targets.length === 0) return

    gsap.set(targets, {
      autoAlpha: 0,
      x: (o.x ?? 0) * distance,
      y: (o.y ?? 0) * distance,
    })

    let done = false
    const reveal = () => {
      if (done) return
      done = true
      gsap.to(targets, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.9,
        delay,
        ease: 'power3.out',
        stagger: stagger ? 0.12 : 0,
        overwrite: true,
      })
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            reveal()
            io.disconnect()
            break
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)

    // Failsafe 1: já visível ao montar (IO pode atrasar o primeiro callback).
    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight && r.bottom > 0) reveal()

    // Failsafe 2: nunca deixar nada escondido mais de 2s.
    const t = window.setTimeout(reveal, 2000)

    return () => {
      io.disconnect()
      window.clearTimeout(t)
      gsap.killTweensOf(targets)
    }
  }, [from, delay, distance, stagger])

  const Tag = as as React.ElementType
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
