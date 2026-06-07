'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Bed, Bath, Car, Maximize2, MapPin, ChevronLeft, ChevronRight as ChevRight,
  X, ChevronRight, ZoomIn, Phone, MessageCircle, Calendar, ArrowDown, Share2, Copy, Printer, User,
} from 'lucide-react'
import type { Imovel } from '@/types/database'
import { formatPrice, formatArea } from '@/lib/utils'

const GOLD  = '#C9A96E'
const DARK  = '#07100f'
const DARK2 = '#0d1a1c'

function useVisible(th = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } }, { threshold: th })
    obs.observe(el); return () => obs.disconnect()
  }, [th])
  return [ref, v] as const
}

interface Angariador {
  nome: string
  role: string
}

export default function ImovelLuxury({ imovel, angariador }: { imovel: Imovel; angariador?: Angariador | null }) {
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let tick = false
    const fn = () => {
      if (tick) return; tick = true
      requestAnimationFrame(() => {
        if (bgRef.current) bgRef.current.style.transform = `translateY(${window.scrollY * 0.35}px)`
        tick = false
      })
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Gallery lightbox state (shared for fotos and plantas)
  const [lb, setLb] = useState<{ images: string[]; index: number } | null>(null)
  const fotos = imovel.fotos ?? []
  const plantas = imovel.plantas ?? []

  const lbPrev = useCallback(() => setLb(a => a ? { ...a, index: (a.index - 1 + a.images.length) % a.images.length } : null), [])
  const lbNext = useCallback(() => setLb(a => a ? { ...a, index: (a.index + 1) % a.images.length } : null), [])

  useEffect(() => {
    if (lb === null) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') lbNext()
      if (e.key === 'ArrowLeft')  lbPrev()
      if (e.key === 'Escape')     setLb(null)
    }
    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [lb, lbNext, lbPrev])

  // Share buttons state
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: imovel.titulo, url: window.location.href })
      } catch { /* cancelled */ }
    } else {
      handleCopy()
    }
  }

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const [s1r, s1v] = useVisible()
  const [s2r, s2v] = useVisible()
  const [s3r, s3v] = useVisible()
  const [s4r, s4v] = useVisible()
  const [s5r, s5v] = useVisible()
  const [s6r, s6v] = useVisible()
  const [s7r, s7v] = useVisible()

  const features = [
    imovel.quartos    != null && { icon: Bed,       label: 'Quartos',        value: imovel.quartos },
    imovel.casas_banho!= null && { icon: Bath,      label: 'Casas de Banho', value: imovel.casas_banho },
    imovel.area_m2   != null && { icon: Maximize2,  label: 'Área',           value: formatArea(imovel.area_m2) },
    imovel.garagem            && { icon: Car,        label: 'Garagem',        value: 'Incluída' },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string | number }[]

  const location = [imovel.localizacao, imovel.cidade, imovel.distrito].filter(Boolean).join(' · ')
  const address  = [imovel.localizacao, imovel.cidade, imovel.distrito].filter(Boolean).join(', ')
  const heroImg  = fotos[0] ?? null

  const btnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.45rem 0.85rem',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '999px',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    transition: 'background 0.2s',
    whiteSpace: 'nowrap' as const,
  }

  return (
    <div style={{ background: DARK, color: '#F5F5F5', fontFamily: 'var(--font-cera)' }}>

      {/* ══ NAV ══ */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5"
        style={{ background: 'linear-gradient(to bottom, rgba(7,16,15,0.95) 0%, transparent 100%)' }}>
        <Link href="/imoveis" className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs sm:text-sm font-medium transition-colors group flex-shrink-0">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden xs:inline">Todos os imóveis</span>
          <span className="xs:hidden">Voltar</span>
        </Link>
        <Link href="/" className="hidden sm:block">
          <img src="/logos/logo-white.png" alt="Painel Temático" className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" />
        </Link>
        <a href="#contacto"
          className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border transition-all flex-shrink-0"
          style={{ borderColor: GOLD, color: GOLD }}
          onMouseEnter={e => { const el = e.currentTarget; el.style.background = GOLD; el.style.color = '#000' }}
          onMouseLeave={e => { const el = e.currentTarget; el.style.background = ''; el.style.color = GOLD }}>
          Contactar
        </a>
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden" style={{ height: '100svh', minHeight: 600 }}>
        {heroImg
          ? <div ref={bgRef} className="absolute will-change-transform"
              style={{ inset: '-30% 0', backgroundImage: `url(${heroImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          : <div className="absolute inset-0" style={{ background: '#1F3F44' }} />}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,16,15,0.97) 0%, rgba(7,16,15,0.3) 50%, rgba(7,16,15,0.55) 100%)' }} />

        <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-8 md:px-14 pb-10 sm:pb-16 pt-24">
          {/* Badges */}
          <div className="flex items-center gap-3 mb-4 sm:mb-6" style={{ animation: 'fadeUp 1s 0.1s ease both' }}>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] opacity-60">{imovel.tipo}</span>
            {imovel.tipologia && <>
              <span className="w-1 h-1 rounded-full opacity-40" style={{ background: GOLD }} />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: GOLD }}>{imovel.tipologia}</span>
            </>}
          </div>

          {/* Title */}
          <h1 className="font-serif font-bold leading-[0.88] tracking-tight mb-4 sm:mb-6"
            style={{ fontSize: 'clamp(2rem,7vw,8rem)', animation: 'fadeUp 1s 0.2s ease both' }}>
            {imovel.titulo}
          </h1>

          {location && (
            <div className="flex items-center gap-2 mb-6 sm:mb-10 opacity-60" style={{ animation: 'fadeUp 1s 0.3s ease both' }}>
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD }} />
              <span className="text-xs sm:text-sm tracking-wide">{location}</span>
            </div>
          )}

          {/* Price + mini stats */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-8 pt-6 sm:pt-0"
            style={{ animation: 'fadeUp 1s 0.4s ease both' }}>
            <div>
              {imovel.preco ? (
                <>
                  <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-1">Preço</p>
                  <p className="font-serif font-bold" style={{ fontSize: 'clamp(1.5rem,4vw,3rem)', color: GOLD }}>
                    {formatPrice(imovel.preco, imovel.tipo)}
                  </p>
                </>
              ) : (
                <p className="text-xs opacity-50 uppercase tracking-[0.2em]">Preço sob consulta</p>
              )}
            </div>
            <div className="flex items-center gap-5 sm:gap-8 opacity-55 pb-0.5">
              {imovel.quartos != null && (
                <div className="text-center">
                  <p className="font-serif font-bold text-xl sm:text-2xl">{imovel.quartos}</p>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] mt-0.5">Quartos</p>
                </div>
              )}
              {imovel.area_m2 != null && (
                <div className="text-center">
                  <p className="font-serif font-bold text-xl sm:text-2xl">{imovel.area_m2}m²</p>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] mt-0.5">Área</p>
                </div>
              )}
              {imovel.casas_banho != null && (
                <div className="text-center">
                  <p className="font-serif font-bold text-xl sm:text-2xl">{imovel.casas_banho}</p>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] mt-0.5">WC</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Share / Copy / Print buttons — bottom-right of hero */}
        <div className="absolute bottom-10 sm:bottom-16 right-4 sm:right-8 md:right-14 flex items-center gap-2"
          style={{ animation: 'fadeUp 1s 0.5s ease both' }}>
          <button style={btnStyle} onClick={handleShare}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}>
            <Share2 className="w-3 h-3" />
            <span>Partilhar</span>
          </button>
          <button style={btnStyle} onClick={handleCopy}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}>
            <Copy className="w-3 h-3" />
            <span>{copied ? 'Copiado!' : 'Copiar link'}</span>
          </button>
          <button style={btnStyle} onClick={() => window.print()}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}>
            <Printer className="w-3 h-3" />
            <span>Brochura PDF</span>
          </button>
        </div>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 opacity-30" style={{ animation: 'bounce 2s 1.5s infinite' }}>
          <ArrowDown className="w-5 h-5" />
        </div>
      </section>

      {/* ══ DESCRIPTION (previously "Sobre este imóvel") ══ */}
      {imovel.descricao && (
        <section className="py-16 sm:py-24 lg:py-32" style={{ background: DARK2 }}>
          <div ref={s1r} className="max-w-6xl mx-auto px-4 sm:px-8"
            style={{ transition: 'all 1.2s ease', opacity: s1v ? 1 : 0, transform: s1v ? 'none' : 'translateY(40px)' }}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12 lg:gap-16 items-start">
              <div className="lg:col-span-3">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] mb-6 sm:mb-8" style={{ color: GOLD }}>
                  Descrição
                </p>
                <p className="font-serif leading-relaxed text-white/80"
                  style={{ fontSize: 'clamp(1rem,1.8vw,1.4rem)', lineHeight: 1.75 }}>
                  {imovel.descricao}
                </p>
              </div>
              <div className="lg:col-span-2 space-y-0">
                {features.map(({ icon: Icon, label, value }, i) => (
                  <div key={label} className="flex items-center gap-4 sm:gap-5 py-4 sm:py-5"
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.07)',
                      transition: `all 0.8s ease ${i * 100}ms`,
                      opacity: s1v ? 1 : 0,
                      transform: s1v ? 'none' : 'translateX(20px)',
                    }}>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.2)' }}>
                      <Icon className="w-4 h-4" style={{ color: GOLD }} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-0.5">{label}</p>
                      <p className="font-semibold text-sm sm:text-base text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ GALLERY ══ */}
      {fotos.length > 0 && (
        <section className="py-14 sm:py-20 lg:py-24" style={{ background: '#0a0a0a' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div ref={s2r} className="flex items-end justify-between mb-8 sm:mb-10"
              style={{ transition: 'all 1s ease', opacity: s2v ? 1 : 0, transform: s2v ? 'none' : 'translateY(24px)' }}>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-2">Galeria</p>
                <h2 className="font-serif font-bold" style={{ fontSize: 'clamp(1.6rem,4vw,4rem)' }}>
                  {fotos.length} fotografias
                </h2>
              </div>
              <p className="text-xs sm:text-sm opacity-25 hidden sm:block">Toque para ampliar</p>
            </div>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-3">
              {fotos.map((url, i) => (
                <div key={i} className="break-inside-avoid mb-3 group relative overflow-hidden rounded-xl cursor-zoom-in"
                  onClick={() => setLb({ images: fotos, index: i })}>
                  <img src={url} alt={`Foto ${i + 1}`} loading="lazy"
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.25)' }}>
                    <ZoomIn className="w-7 h-7 text-white drop-shadow" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ PLANTAS ══ */}
      {plantas.length > 0 && (
        <section className="py-14 sm:py-20 lg:py-24" style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div ref={s6r} style={{ transition: 'all 1s ease', opacity: s6v ? 1 : 0, transform: s6v ? 'none' : 'translateY(24px)' }}>
              <div className="flex items-end justify-between mb-8 sm:mb-10">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-2">Plantas</p>
                  <h2 className="font-serif font-bold" style={{ fontSize: 'clamp(1.6rem,4vw,4rem)' }}>
                    {plantas.length === 1 ? '1 planta' : `${plantas.length} plantas`}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm opacity-25 hidden sm:block">Toque para ampliar</p>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(201,169,110,0.3) transparent' }}>
                {plantas.map((url, i) => (
                  <div key={i}
                    className="flex-shrink-0 group relative overflow-hidden rounded-xl cursor-zoom-in"
                    style={{ width: 'clamp(240px, 35vw, 420px)', aspectRatio: '4/3' }}
                    onClick={() => setLb({ images: plantas, index: i })}>
                    <img src={url} alt={`Planta ${i + 1}`} loading="lazy"
                      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.04]"
                      style={{ background: 'rgba(255,255,255,0.03)' }} />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.25)' }}>
                      <ZoomIn className="w-7 h-7 text-white drop-shadow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ ESPECIFICIDADES (previously "Características" / "Detalhes do imóvel") ══ */}
      {(features.length > 0 || (imovel.especificidades && imovel.especificidades.length > 0)) && (
        <section className="py-16 sm:py-24 lg:py-28" style={{ background: DARK2 }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div ref={s3r} style={{ transition: 'all 1s ease', opacity: s3v ? 1 : 0, transform: s3v ? 'none' : 'translateY(30px)' }}>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-3 sm:mb-4" style={{ color: GOLD, opacity: 0.7 }}>Especificidades</p>
              <h2 className="font-serif font-bold mb-8 sm:mb-12 lg:mb-16 text-white/90"
                style={{ fontSize: 'clamp(1.6rem,4vw,4rem)' }}>
                Detalhes do imóvel
              </h2>

              {features.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-px mb-12 sm:mb-16" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {features.map(({ icon: Icon, label, value }, i) => (
                    <div key={label} className="flex flex-col justify-between p-5 sm:p-7 lg:p-10"
                      style={{
                        background: DARK2,
                        transition: `all 0.8s ease ${i * 120}ms`,
                        opacity: s3v ? 1 : 0,
                        transform: s3v ? 'none' : 'translateY(24px)',
                      }}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-5 sm:mb-8" style={{ color: GOLD, opacity: 0.8 }} />
                      <div>
                        <p className="font-serif font-bold mb-1.5"
                          style={{ fontSize: 'clamp(1.5rem,3.5vw,3.5rem)', color: '#F5F5F5' }}>
                          {value}
                        </p>
                        <p className="text-[9px] sm:text-[10px] sm:text-xs uppercase tracking-[0.2em] opacity-40">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {imovel.especificidades && imovel.especificidades.length > 0 && (
                <div>
                  <div className="w-full h-px mb-8 sm:mb-10" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
                    {imovel.especificidades.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 py-3 px-1"
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          transition: `all 0.6s ease ${i * 50}ms`,
                          opacity: s3v ? 1 : 0,
                          transform: s3v ? 'none' : 'translateY(12px)',
                        }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: GOLD, opacity: 0.7 }} />
                        <span className="text-sm text-white/70">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══ LOCATION ══ */}
      {location && (
        <section className="py-16 sm:py-24 lg:py-28" style={{ background: '#0a0a0a' }}>
          <div ref={s4r} className="max-w-6xl mx-auto px-4 sm:px-8"
            style={{ transition: 'all 1.2s ease', opacity: s4v ? 1 : 0, transform: s4v ? 'none' : 'translateY(30px)' }}>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-5 sm:mb-6" style={{ color: GOLD, opacity: 0.7 }}>Localização</p>
            <h2 className="font-serif font-bold leading-tight mb-5 sm:mb-8 text-white/90"
              style={{ fontSize: 'clamp(1.8rem,5vw,5rem)' }}>
              {imovel.cidade ?? imovel.distrito ?? 'Portugal'}
            </h2>
            <p className="opacity-45 text-sm leading-relaxed mb-6 sm:mb-8 max-w-sm">
              {[imovel.localizacao, imovel.cidade, imovel.distrito].filter(Boolean).join(', ')}
            </p>
            <div className="flex items-center gap-2 text-sm mb-8 sm:mb-10" style={{ color: GOLD }}>
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="opacity-65 text-xs sm:text-sm">{location}</span>
            </div>

            {/* Google Maps embed */}
            <div className="rounded-2xl overflow-hidden" style={{ height: 400, border: '1px solid rgba(255,255,255,0.07)' }}>
              <iframe
                title="Localização no mapa"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(0.3) invert(0.85) hue-rotate(170deg) brightness(0.85)' }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      )}

      {/* ══ COMMERCIAL / ANGARIADOR ══ */}
      {angariador && (
        <section className="py-16 sm:py-24 lg:py-28" style={{ background: DARK2 }}>
          <div ref={s7r} className="max-w-6xl mx-auto px-4 sm:px-8"
            style={{ transition: 'all 1.2s ease', opacity: s7v ? 1 : 0, transform: s7v ? 'none' : 'translateY(30px)' }}>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-5 sm:mb-6" style={{ color: GOLD, opacity: 0.7 }}>
              Responsável por este imóvel
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
              {/* Avatar */}
              <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(201,169,110,0.15)', border: '2px solid rgba(201,169,110,0.35)' }}>
                <span className="font-serif font-bold text-2xl sm:text-3xl" style={{ color: GOLD }}>
                  {angariador.nome.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-white mb-1">{angariador.nome}</h3>
                <p className="text-[10px] uppercase tracking-[0.2em] mb-5" style={{ color: GOLD, opacity: 0.7 }}>{angariador.role}</p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="https://wa.me/351913440800"
                    className="flex items-center gap-3 rounded-xl text-sm transition-all"
                    style={{ padding: '0.75rem 1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <MessageCircle className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }} />
                    <span className="text-white/65">WhatsApp</span>
                  </a>
                  <a href="tel:+351913440800"
                    className="flex items-center gap-3 rounded-xl text-sm transition-all"
                    style={{ padding: '0.75rem 1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <Phone className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }} />
                    <span className="text-white/65">+351 913 440 800</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ CONTACT ══ */}
      <section id="contacto" className="py-16 sm:py-24 lg:py-28" style={{ background: angariador ? '#0a0a0a' : DARK2 }}>
        <div ref={s5r} className="max-w-6xl mx-auto px-4 sm:px-8"
          style={{ transition: 'all 1.2s ease', opacity: s5v ? 1 : 0, transform: s5v ? 'none' : 'translateY(30px)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-20 items-start">
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-5 sm:mb-6" style={{ color: GOLD, opacity: 0.7 }}>Contacto</p>
              <h2 className="font-serif font-bold leading-tight mb-4 sm:mb-6 text-white/90"
                style={{ fontSize: 'clamp(1.7rem,4vw,4rem)' }}>
                Agendar visita privada
              </h2>
              <p className="opacity-40 text-sm leading-relaxed mb-8 sm:mb-10 max-w-xs">
                Visitas personalizadas com acompanhamento exclusivo da nossa equipa.
              </p>
              <div className="space-y-3">
                <Link href={`/visita?imovel=${imovel.id}`}
                  className="flex items-center gap-3 sm:gap-4 w-full group rounded-xl"
                  style={{ padding: '1rem 1.25rem', background: GOLD }}>
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" />
                  <span className="font-semibold text-black text-sm tracking-wide">Agendar Visita Privada</span>
                  <ChevronRight className="w-4 h-4 text-black ml-auto group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="https://wa.me/351913440800"
                  className="flex items-center gap-3 sm:gap-4 w-full rounded-xl text-sm"
                  style={{ padding: '1rem 1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: GOLD }} />
                  <span className="text-white/65">WhatsApp — resposta imediata</span>
                </a>
                <a href="tel:+351913440800"
                  className="flex items-center gap-3 sm:gap-4 w-full rounded-xl text-sm"
                  style={{ padding: '1rem 1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: GOLD }} />
                  <span className="text-white/65">+351 913 440 800</span>
                </a>
              </div>
            </div>
            <div className="rounded-2xl p-5 sm:p-8 lg:p-10" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <LuxuryForm imovelId={imovel.id} imovelTitulo={imovel.titulo} />
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-8 py-5 sm:py-6"
        style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/"><img src="/logos/logo-white.png" alt="Painel Temático" className="h-5 w-auto opacity-35" /></Link>
        <div className="flex items-center gap-4 sm:gap-6">
          {[['Imóveis', '/imoveis'], ['Projetos', '/projetos'], ['Contacto', '/contacto']].map(([l, h]) => (
            <Link key={h} href={h} className="text-[10px] sm:text-xs opacity-25 hover:opacity-50 uppercase tracking-[0.15em] transition-opacity">{l}</Link>
          ))}
        </div>
        <p className="text-[10px] sm:text-xs opacity-15">© 2025 Painel Temático</p>
      </div>

      {/* ══ LIGHTBOX (shared for fotos + plantas) ══ */}
      {lb !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.97)' }} onClick={() => setLb(null)}>
          <img src={lb.images[lb.index]} alt="" className="max-h-[85vh] max-w-[92vw] sm:max-w-[88vw] object-contain rounded-lg"
            onClick={e => e.stopPropagation()} />
          <button onClick={() => setLb(null)}
            className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white"
            style={{ background: 'rgba(255,255,255,0.12)' }}>
            <X className="w-5 h-5" />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs sm:text-sm" style={{ color: 'rgba(245,245,245,0.4)' }}>
            {lb.index + 1} / {lb.images.length}
          </div>
          {lb.images.length > 1 && <>
            <button onClick={e => { e.stopPropagation(); lbPrev() }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button onClick={e => { e.stopPropagation(); lbNext() }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              <ChevRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[88vw] overflow-x-auto py-1">
              {lb.images.map((u, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setLb(prev => prev ? { ...prev, index: i } : null) }}
                  className="flex-shrink-0 w-10 h-8 sm:w-12 sm:h-9 rounded overflow-hidden border-2 transition-all"
                  style={{ borderColor: i === lb.index ? GOLD : 'transparent', opacity: i === lb.index ? 1 : 0.35 }}>
                  <img src={u} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </>}
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
        @keyframes bounce { 0%,100% { transform:translateX(-50%) translateY(0) } 50% { transform:translateX(-50%) translateY(7px) } }
        @media (max-width:480px) { .xs\\:hidden { display:none } }
        @media (min-width:480px) { .xs\\:inline { display:inline } }
        @media print {
          nav, .no-print { display: none !important; }
          section { break-inside: avoid; }
        }
      `}</style>
    </div>
  )
}

/* ── Form ── */
function LuxuryForm({ imovelId, imovelTitulo }: { imovelId: string; imovelTitulo: string }) {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const inp: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.8rem 0.9rem', color: '#F5F5F5', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(245,245,245,0.35)', marginBottom: '0.45rem' }
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = GOLD)
  const blur  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setStatus('loading')
    try {
      const res = await fetch('/api/contacto', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, imovel_id: imovelId, imovel_titulo: imovelTitulo }) })
      setStatus(res.ok ? 'ok' : 'error')
    } catch { setStatus('error') }
  }

  if (status === 'ok') return (
    <div className="text-center py-10 sm:py-12">
      <p className="font-serif text-xl sm:text-2xl mb-3" style={{ color: GOLD }}>Mensagem enviada</p>
      <p className="text-sm opacity-40">A nossa equipa entrará em contacto brevemente.</p>
    </div>
  )

  return (
    <form onSubmit={submit} className="space-y-4 sm:space-y-5">
      <p className="font-serif text-lg sm:text-xl mb-4 sm:mb-6 text-white/65">Pedir informações</p>
      <div><label style={lbl}>Nome</label>
        <input required style={inp} value={form.nome} placeholder="O seu nome" onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} onFocus={focus} onBlur={blur} /></div>
      <div><label style={lbl}>Email</label>
        <input required type="email" style={inp} value={form.email} placeholder="email@exemplo.pt" onChange={e => setForm(f => ({ ...f, email: e.target.value }))} onFocus={focus} onBlur={blur} /></div>
      <div><label style={lbl}>Telefone</label>
        <input style={inp} value={form.telefone} placeholder="+351 9xx xxx xxx" onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} onFocus={focus} onBlur={blur} /></div>
      <div><label style={lbl}>Mensagem</label>
        <textarea rows={3} style={{ ...inp, resize: 'none' }} value={form.mensagem} placeholder="Tenho interesse neste imóvel..." onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))} onFocus={focus} onBlur={blur} /></div>
      {status === 'error' && <p className="text-red-400 text-xs">Erro ao enviar. Tente novamente.</p>}
      <button type="submit" disabled={status === 'loading'}
        className="w-full font-semibold text-sm tracking-wide transition-opacity disabled:opacity-60 rounded-xl"
        style={{ padding: '0.9rem', background: GOLD, color: '#000' }}>
        {status === 'loading' ? 'A enviar…' : 'Enviar Pedido'}
      </button>
    </form>
  )
}
