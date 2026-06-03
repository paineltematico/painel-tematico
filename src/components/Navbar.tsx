'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Início' },
  { href: '/projetos', label: 'Projetos' },
  { href: '/construcao', label: 'Construção' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contacto', label: 'Contacto' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  const transparent = isHome && !scrolled && !open

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        transparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md border-b border-[#E8E3E3] shadow-sm'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src={transparent ? '/logos/logo-white.png' : '/logos/logo-dark.jpg'}
              alt="Painel Temático"
              width={160}
              height={48}
              className="h-9 w-auto object-contain transition-all duration-300"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === l.href
                    ? transparent
                      ? 'text-white bg-white/20'
                      : 'text-[#00545F] bg-teal-50'
                    : transparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-[#475569] hover:text-[#1F3F44] hover:bg-[#F2EEEE]'
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/imoveis"
              className={cn(
                'ml-3 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm',
                transparent
                  ? 'bg-white text-[#00545F] hover:bg-white/90'
                  : 'bg-[#00545F] text-white hover:bg-[#006B78]'
              )}
            >
              Ver Imóveis
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              'md:hidden p-2 rounded-lg transition-colors',
              transparent ? 'text-white hover:bg-white/10' : 'text-[#1F3F44] hover:bg-[#F2EEEE]'
            )}
            aria-label="Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-[#E8E3E3] shadow-lg">
          <nav className="px-4 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  pathname === l.href
                    ? 'text-[#00545F] bg-teal-50'
                    : 'text-[#475569] hover:text-[#1F3F44] hover:bg-[#F2EEEE]'
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/imoveis"
              className="mt-2 px-4 py-3 rounded-lg bg-[#00545F] text-white text-sm font-semibold text-center hover:bg-[#006B78] transition-colors"
            >
              Ver Imóveis
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
