'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

interface CounterProps {
  to: number
  /** Sufixo (ex.: "+", "%"). */
  suffix?: string
  className?: string
}

/**
 * Conta de 0 até `to` quando entra no viewport (IntersectionObserver + failsafe).
 * Sem-JS / reduced-motion: mostra o valor final.
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
    let done = false
    let tween: gsap.core.Tween | null = null
    const run = () => {
      if (done) return
      done = true
      const obj = { n: 0 }
      tween = gsap.to(obj, {
        n: to,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => setValue(Math.round(obj.n)),
      })
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            run()
            io.disconnect()
            break
          }
        }
      },
      { threshold: 0.4 }
    )
    io.observe(el)

    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight && r.bottom > 0) run()
    const t = window.setTimeout(run, 2000)

    return () => {
      io.disconnect()
      window.clearTimeout(t)
      tween?.kill()
    }
  }, [to])

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  )
}
