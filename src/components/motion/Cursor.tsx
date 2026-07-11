'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'

/**
 * Cursor personalizado (ponto + anel com inércia) que aumenta sobre
 * elementos interativos. Só no site público, em dispositivos com hover fino.
 * Não substitui o cursor nativo em touch nem com prefers-reduced-motion.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  useEffect(() => {
    if (isAdmin) return
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches || window.matchMedia('(pointer: coarse)').matches) return

    document.body.classList.add('has-custom-cursor')
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 })

    const xTo = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power3.out' })

    const onMove = (e: MouseEvent) => {
      gsap.set(dot, { x: e.clientX, y: e.clientY, opacity: 1 })
      gsap.set(ring, { opacity: 1 })
      xTo(e.clientX)
      yTo(e.clientY)
    }
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button, input, textarea, select, [role="button"]')) {
        gsap.to(ring, { scale: 1.8, duration: 0.3, backgroundColor: 'rgba(0,84,95,0.12)' })
      }
    }
    const onOut = () => gsap.to(ring, { scale: 1, duration: 0.3, backgroundColor: 'transparent' })
    const onLeaveWin = () => gsap.to([dot, ring], { opacity: 0, duration: 0.2 })

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    document.addEventListener('mouseleave', onLeaveWin)

    return () => {
      document.body.classList.remove('has-custom-cursor')
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.removeEventListener('mouseleave', onLeaveWin)
    }
  }, [isAdmin])

  if (isAdmin) return null

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-8 w-8 rounded-full border border-[#00545F]/60 hidden md:block"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full bg-[#00545F] hidden md:block"
        style={{ willChange: 'transform' }}
      />
    </>
  )
}
