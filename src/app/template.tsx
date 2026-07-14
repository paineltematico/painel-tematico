'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'

/**
 * Cortina de transição entre páginas (estilo award-site): a cada navegação
 * um painel da marca revela o novo conteúdo, que sobe suavemente.
 * Desligado em /admin e com prefers-reduced-motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const curtainRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  useEffect(() => {
    if (isAdmin) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const curtain = curtainRef.current
    const content = contentRef.current
    if (!curtain || !content) return

    const tl = gsap.timeline()
    tl.set(curtain, { transformOrigin: 'top', scaleY: 1, autoAlpha: 1 })
      .set(content, { autoAlpha: 0, y: 24 })
      .to(curtain, { scaleY: 0, transformOrigin: 'bottom', duration: 0.7, ease: 'power4.inOut' })
      .to(content, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.35')
      .set(curtain, { autoAlpha: 0 })

    return () => {
      tl.kill()
    }
  }, [pathname, isAdmin])

  if (isAdmin) return <>{children}</>

  return (
    <>
      <div
        ref={curtainRef}
        aria-hidden
        className="fixed inset-0 z-[9998] bg-[#1F3F44] pointer-events-none"
        style={{ opacity: 0 }}
      />
      <div ref={contentRef}>{children}</div>
    </>
  )
}
