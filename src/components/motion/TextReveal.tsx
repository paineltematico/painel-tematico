'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface TextRevealProps {
  text: string
  className?: string
  /** Elemento a renderizar (h1, h2, p...). */
  as?: keyof React.JSX.IntrinsicElements
  delay?: number
}

/**
 * Revela um título palavra a palavra, subindo por trás de uma máscara
 * (efeito "curtain up" típico dos sites da Raman Studio).
 * Sem-JS / reduced-motion: mostra o texto normal.
 */
export default function TextReveal({ text, className, as = 'h2', delay = 0 }: TextRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const words = text.split(' ')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const inner = el.querySelectorAll<HTMLElement>('[data-word-inner]')
    const ctx = gsap.context(() => {
      gsap.set(inner, { yPercent: 120 })
      gsap.to(inner, {
        yPercent: 0,
        duration: 1,
        delay,
        ease: 'power4.out',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      })
    }, el)
    return () => ctx.revert()
  }, [delay])

  const Tag = as as React.ElementType
  return (
    <Tag ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i}>
          <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
            <span data-word-inner style={{ display: 'inline-block', willChange: 'transform' }}>
              {w}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}
