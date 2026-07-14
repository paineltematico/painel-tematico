'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface TextRevealProps {
  text: string
  className?: string
  style?: React.CSSProperties
  /** Elemento a renderizar (h1, h2, p...). */
  as?: keyof React.JSX.IntrinsicElements
  delay?: number
}

/**
 * Revela um título palavra a palavra, subindo por trás de uma máscara
 * (efeito "curtain up"). Gatilho via IntersectionObserver + failsafe.
 * Sem-JS / reduced-motion: mostra o texto normal.
 */
export default function TextReveal({ text, className, style, as = 'h2', delay = 0 }: TextRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const words = text.split(' ')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const inner = Array.from(el.querySelectorAll<HTMLElement>('[data-word-inner]'))
    if (inner.length === 0) return
    gsap.set(inner, { yPercent: 120 })

    let done = false
    const reveal = () => {
      if (done) return
      done = true
      gsap.to(inner, {
        yPercent: 0,
        duration: 1,
        delay,
        ease: 'power4.out',
        stagger: 0.08,
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
      { threshold: 0.2, rootMargin: '0px 0px -6% 0px' }
    )
    io.observe(el)

    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight && r.bottom > 0) reveal()
    const t = window.setTimeout(reveal, 2000)

    return () => {
      io.disconnect()
      window.clearTimeout(t)
      gsap.killTweensOf(inner)
    }
  }, [delay])

  const Tag = as as React.ElementType
  return (
    <Tag ref={ref} className={className} style={style}>
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
