'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface CounterProps {
  to: number
  /** Sufixo (ex.: "+", "%"). */
  suffix?: string
  className?: string
}

/**
 * Conta de 0 até `to` quando entra no viewport. Sem-JS mostra o valor final.
 */
export default function Counter({ to, suffix = '', className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(to)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(to)
      return
    }

    setValue(0)
    const obj = { n: 0 }
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        n: to,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => setValue(Math.round(obj.n)),
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      })
    }, el)
    return () => ctx.revert()
  }, [to])

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  )
}
