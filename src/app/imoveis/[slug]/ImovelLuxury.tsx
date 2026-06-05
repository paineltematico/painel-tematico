'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Bed, Bath, Car, Maximize2, MapPin, ChevronLeft,
  X, ChevronRight, ZoomIn, Phone, MessageCircle, Calendar,
  ArrowDown, Home,
} from 'lucide-react'
import type { Imovel } from '@/types/database'
import { formatPrice, formatArea } from '@/lib/utils'

/* ── helpers ── */
function useVisible(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, v] as const
}

const GOLD  = '#C9A96E'
const DARK  = '#07100f'   // near-black with brand teal undertone
const DARK2 = '#0d1a1c'   // dark teal-black

/* ── component ── */
export default function ImovelLuxury({ imovel }: { imovel: Imovel }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const bgRef   = useRef<HTMLDivElement>(null)

  /* parallax */
  useEffect(() => {
    let tick = false
    const onScroll = () => {
      if (tick) return; tick = true
      requestAnimationFrame(() => {
        if (bgRef.current) bgRef.current.style.transform = `translateY(${window.scrollY * 0.35}px)`
        tick = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* lightbox */
  const [lb, setLb] = useState<number | null>(null)
  const fotos = imovel.fotos ?? []
  const prev = useCallback(() => setLb(a => (a! - 1 + fotos.length) % fotos.length), [fotos.length])
  const next = useCallback(() => setLb(a => (a! + 1) % fotos.length), [fotos.length])
  useEffect(() => {
    if (lb === null) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'Escape')     setLb(null)
    }
    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [lb, next, prev])

  /* scroll sections */
  const [s1r, s1v] = useVisible()
  const [s2r, s2v] = useVisible()
  const [s3r, s3v] = useVisible()
  const [s4r, s4v] = useVisible()
  const [s5r, s5v] = useVisible()

  const features = [
    imovel.quartos    != null && { icon: Bed,      label: 'Quartos',        value: imovel.quartos },
    imovel.casas_banho!= null && { icon: Bath,     label: 'Casas de Banho', value: imovel.casas_banho },
    imovel.area_m2   != null && { icon: Maximize2, label: 'Área',           value: formatArea(imovel.area_m2) },
    imovel.garagem            && { icon: Car,       label: 'Garagem',        value: 'Incluída' },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string | number }[]

  const location = [imovel.localizacao, imovel.cidade, imovel.distrito].filter(Boolean).join(' · ')
  const heroImg  = fotos[0] ?? null

  /* ─── RENDER ─── */
  return (
    <div style={{ background: DARK, color: '#F5F5F5', fontFamily: 'var(--font-cera)' }}>

      {/* ══ OVERLAY NAV ══ */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-5"
        style={{ background: 'linear-gradient(to bottom, rgba(7,16,15,0.95) 0%, rgba(7,16,15,0) 100%)' }}>
        <Link href="/imoveis"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Todos os imóveis
        </Link>
        <Link href="/">
          <img src="/logos/logo-white.png" alt="Painel Temático" className="h-6 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
        </Link>
        <a href="#contacto"
          className="text-xs font-semibold uppercase tracking-[0.2em] px-5 py-2.5 rounded-full border transition-all"
          style={{ borderColor: GOLD, color: GOLD, ['--tw-ring-color' as string]: GOLD }}
          onMouseEnter={e => { (e.target as HTMLElement).style.background = GOLD; (e.target as HTMLElement).style.color = '#000' }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = ''; (e.target as HTMLElement).style.color = GOLD }}>
          Contactar
        </a>
      </nav>

      {/* ══ HERO ══ */}
      <section ref={heroRef} className="relative overflow-hidden" style={{ height: '100vh', minHeight: 640 }}>
        {/* BG */}
        {heroImg ? (
          <div ref={bgRef} className="absolute will-change-transform"
            style={{ inset: '-30% 0', backgroundImage: `url(${heroImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        ) : (
          <div className="absolute inset-0" style={{ background: '#1F3F44' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,16,15,0.97) 0%, rgba(7,16,15,0.25) 45%, rgba(7,16,15,0.88) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(7,16,15,0.3) 0%, rgba(7,16,15,0) 60%)' }} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end px-8 sm:px-14 pb-16 pt-32">
          {/* Label */}
          <div className="flex items-center gap-4 mb-6" style={{ animationDelay: '0.2s', animation: 'fadeUp 1s ease both' }}>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] opacity-60">
              {imovel.tipo}
            </span>
            {imovel.tipologia && <>
              <span className="w-1 h-1 rounded-full opacity-40" style={{ background: GOLD }} />
              <span className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
                {imovel.tipologia}
              </span>
            </>}
          </div>

          {/* Title */}
          <h1 className="font-serif font-bold leading-[0.9] tracking-tight mb-6"
            style={{ fontSize: 'clamp(3rem,8vw,8rem)', animation: 'fadeUp 1s 0.15s ease both' }}>
            {imovel.titulo}
          </h1>

          {/* Location */}
          {location && (
            <div className="flex items-center gap-2 mb-10 opacity-60" style={{ animation: 'fadeUp 1s 0.3s ease both' }}>
              <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }} />
              <span className="text-sm tracking-wide">{location}</span>
            </div>
          )}

          {/* Price pill */}
          <div className="flex items-end justify-between gap-8" style={{ animation: 'fadeUp 1s 0.45s ease both' }}>
            <div>
              {imovel.preco ? (
                <>
                  <p className="text-xs uppercase tracking-[0.2em] opacity-50 mb-1">Preço</p>
                  <p className="font-serif font-bold" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', color: GOLD }}>
                    {formatPrice(imovel.preco, imovel.tipo)}
                  </p>
                </>
              ) : (
                <p className="text-sm opacity-50 uppercase tracking-[0.2em]">Preço sob consulta</p>
              )}
            </div>
            {/* Mini features in hero */}
            <div className="hidden sm:flex items-center gap-8 opacity-60 pb-1">
              {imovel.quartos != null && (
                <div className="text-center">
                  <p className="font-serif font-bold text-2xl text-white">{imovel.quartos}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] mt-0.5">Quartos</p>
                </div>
              )}
              {imovel.area_m2 != null && (
                <div className="text-center">
                  <p className="font-serif font-bold text-2xl text-white">{imovel.area_m2}m²</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] mt-0.5">Área</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40"
          style={{ animation: 'bounce 2s 1.5s infinite' }}>
          <ArrowDown className="w-5 h-5" />
        </div>
      </section>

      {/* ══ DESCRIPTION / STORY ══ */}
      {imovel.descricao && (
        <section style={{ background: DARK2, paddingBlock: '8rem' }}>
          <div ref={s1r} className="max-w-6xl mx-auto px-8"
            style={{ transition: 'all 1.2s ease', opacity: s1v ? 1 : 0, transform: s1v ? 'translateY(0)' : 'translateY(40px)' }}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
              <div className="lg:col-span-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-8" style={{ color: GOLD }}>
                  Sobre este imóvel
                </p>
                <p className="font-serif leading-relaxed text-white/80"
                  style={{ fontSize: 'clamp(1.1rem,1.8vw,1.45rem)', lineHeight: 1.7 }}>
                  {imovel.descricao}
                </p>
              </div>
              <div className="lg:col-span-2 space-y-6">
                {/* Feature list */}
                {features.map(({ icon: Icon, label, value }, i) => (
                  <div key={label} className="flex items-center gap-5 pb-6"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', transitionDelay: `${i * 100}ms`, transition: 'all 0.8s ease', opacity: s1v ? 1 : 0, transform: s1v ? 'translateX(0)' : 'translateX(20px)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(201,169,110,0.12)', border: `1px solid rgba(201,169,110,0.2)` }}>
                      <Icon className="w-4 h-4" style={{ color: GOLD }} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] opacity-40 mb-0.5">{label}</p>
                      <p className="font-semibold text-white">{value}</p>
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
        <section style={{ background: '#0a0a0a', paddingBlock: '6rem' }}>
          <div className="max-w-7xl mx-auto px-8">
            <div ref={s2r} className="flex items-end justify-between mb-10"
              style={{ transition: 'all 1s ease', opacity: s2v ? 1 : 0, transform: s2v ? 'translateY(0)' : 'translateY(30px)' }}>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] opacity-40 mb-2">Galeria</p>
                <h2 className="font-serif font-bold" style={{ fontSize: 'clamp(2rem,4vw,4rem)', color: '#F5F5F5' }}>
                  {fotos.length} fotografias
                </h2>
              </div>
              <p className="text-sm opacity-30 hidden sm:block">Clique para ampliar</p>
            </div>

            {/* Masonry */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-3">
              {fotos.map((url, i) => (
                <div key={i} className="break-inside-avoid mb-3 group relative overflow-hidden rounded-lg cursor-zoom-in"
                  onClick={() => setLb(i)}>
                  <img src={url} alt={`Foto ${i + 1}`} loading="lazy"
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0)', transition: 'background 0.3s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.25)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}>
                    <ZoomIn className="w-7 h-7 text-white drop-shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="absolute top-3 right-3 text-[10px] text-white/50 bg-black/40 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {i + 1}/{fotos.length}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lightbox */}
          {lb !== null && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.97)' }} onClick={() => setLb(null)}>
              <img src={fotos[lb]} alt="" className="max-h-[88vh] max-w-[88vw] object-contain rounded-lg"
                onClick={e => e.stopPropagation()} />
              <button onClick={() => setLb(null)}
                className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)' }}>
                <X className="w-5 h-5" />
              </button>
              <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/40 text-sm">
                {lb + 1} / {fotos.length}
              </div>
              {fotos.length > 1 && <>
                <button onClick={e => { e.stopPropagation(); prev() }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={e => { e.stopPropagation(); next() }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <ChevronRight className="w-6 h-6" />
                </button>
                {/* Thumbnail strip */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[80vw] overflow-x-auto">
                  {fotos.map((u, i) => (
                    <button key={i} onClick={e => { e.stopPropagation(); setLb(i) }}
                      className="flex-shrink-0 w-12 h-9 rounded overflow-hidden border-2 transition-all"
                      style={{ borderColor: i === lb ? GOLD : 'transparent', opacity: i === lb ? 1 : 0.35 }}>
                      <img src={u} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </>}
            </div>
          )}
        </section>
      )}

      {/* ══ FEATURES — large cards ══ */}
      {features.length > 0 && (
        <section style={{ background: DARK2, paddingBlock: '8rem' }}>
          <div className="max-w-7xl mx-auto px-8">
            <div ref={s3r}
              style={{ transition: 'all 1s ease', opacity: s3v ? 1 : 0, transform: s3v ? 'translateY(0)' : 'translateY(30px)' }}>
              <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: GOLD, opacity: 0.7 }}>Características</p>
              <h2 className="font-serif font-bold mb-16 text-white/90"
                style={{ fontSize: 'clamp(2rem,4vw,4rem)' }}>
                Detalhes do imóvel
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: 'rgba(255,255,255,0.06)' }}>
                {features.map(({ icon: Icon, label, value }, i) => (
                  <div key={label} className="flex flex-col justify-between p-10"
                    style={{
                      background: DARK2,
                      transition: `all 0.8s ease ${i * 120}ms`,
                      opacity: s3v ? 1 : 0,
                      transform: s3v ? 'translateY(0)' : 'translateY(24px)',
                    }}>
                    <Icon className="w-6 h-6 mb-8" style={{ color: GOLD, opacity: 0.8 }} />
                    <div>
                      <p className="font-serif font-bold mb-2"
                        style={{ fontSize: 'clamp(2rem,3.5vw,3.5rem)', color: '#F5F5F5' }}>
                        {value}
                      </p>
                      <p className="text-xs uppercase tracking-[0.25em] opacity-40">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ LOCATION ══ */}
      {location && (
        <section style={{ background: '#0a0a0a', paddingBlock: '8rem' }}>
          <div ref={s4r} className="max-w-6xl mx-auto px-8"
            style={{ transition: 'all 1.2s ease', opacity: s4v ? 1 : 0, transform: s4v ? 'translateY(0)' : 'translateY(30px)' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] mb-6" style={{ color: GOLD, opacity: 0.7 }}>Localização</p>
                <h2 className="font-serif font-bold leading-tight mb-8 text-white/90"
                  style={{ fontSize: 'clamp(2.5rem,5vw,5rem)' }}>
                  {imovel.cidade ?? imovel.distrito ?? 'Portugal'}
                </h2>
                <p className="opacity-50 text-sm leading-relaxed mb-8 max-w-sm">
                  {[imovel.localizacao, imovel.cidade, imovel.distrito].filter(Boolean).join(', ')}
                </p>
                <div className="flex items-center gap-2 text-sm" style={{ color: GOLD }}>
                  <MapPin className="w-4 h-4" />
                  <span className="opacity-70">{location}</span>
                </div>
              </div>
              {/* Decorative geo block */}
              <div className="relative hidden lg:block" style={{ aspectRatio: '1', maxWidth: 420 }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.06) 0%, rgba(31,63,68,0.3) 100%)', border: '1px solid rgba(201,169,110,0.12)' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 mx-auto mb-4" style={{ color: GOLD, opacity: 0.3 }} />
                      <p className="font-serif text-2xl opacity-20">{imovel.cidade ?? 'Portugal'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ CONTACT / CTA ══ */}
      <section id="contacto" style={{ background: DARK2, paddingBlock: '8rem' }}>
        <div ref={s5r} className="max-w-6xl mx-auto px-8"
          style={{ transition: 'all 1.2s ease', opacity: s5v ? 1 : 0, transform: s5v ? 'translateY(0)' : 'translateY(30px)' }}>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            {/* Left — info */}
            <div>
              <p className="text-xs uppercase tracking-[0.3em] mb-6" style={{ color: GOLD, opacity: 0.7 }}>Contacto</p>
              <h2 className="font-serif font-bold leading-tight mb-6 text-white/90"
                style={{ fontSize: 'clamp(2rem,4vw,4rem)' }}>
                Agendar visita privada
              </h2>
              <p className="opacity-40 text-sm leading-relaxed mb-12 max-w-xs">
                Disponível para visitas personalizadas, com acompanhamento exclusivo da nossa equipa.
              </p>

              {/* CTAs */}
              <div className="space-y-4">
                <Link href={`/visita?imovel=${imovel.id}`}
                  className="flex items-center gap-4 w-full group"
                  style={{ padding: '1.25rem 1.5rem', background: GOLD, borderRadius: 12 }}>
                  <Calendar className="w-5 h-5 text-black flex-shrink-0" />
                  <span className="font-semibold text-black text-sm tracking-wide">Agendar Visita Privada</span>
                  <ChevronRight className="w-4 h-4 text-black ml-auto group-hover:translate-x-1 transition-transform" />
                </Link>

                <a href="https://wa.me/351913440800"
                  className="flex items-center gap-4 w-full"
                  style={{ padding: '1.25rem 1.5rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <MessageCircle className="w-5 h-5 flex-shrink-0" style={{ color: GOLD }} />
                  <span className="text-sm text-white/70">WhatsApp — resposta imediata</span>
                </a>

                <a href="tel:+351913440800"
                  className="flex items-center gap-4 w-full"
                  style={{ padding: '1.25rem 1.5rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <Phone className="w-5 h-5 flex-shrink-0" style={{ color: GOLD }} />
                  <span className="text-sm text-white/70">+351 913 440 800</span>
                </a>
              </div>
            </div>

            {/* Right — quick form */}
            <div style={{ background: '#111', borderRadius: 20, padding: '2.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
              <LuxuryForm imovelId={imovel.id} imovelTitulo={imovel.titulo} />
            </div>
          </div>
        </div>
      </section>

      {/* ══ MINIMAL FOOTER ══ */}
      <div style={{ background: '#0a0a0a', padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8">
        <Link href="/">
          <img src="/logos/logo-white.png" alt="Painel Temático" className="h-5 w-auto opacity-40" />
        </Link>
        <div className="flex items-center gap-6 text-xs opacity-30">
          <Link href="/imoveis" className="hover:opacity-60 transition-opacity">Imóveis</Link>
          <Link href="/projetos" className="hover:opacity-60 transition-opacity">Projetos</Link>
          <Link href="/contacto" className="hover:opacity-60 transition-opacity">Contacto</Link>
        </div>
        <p className="text-xs opacity-20">© 2025 Painel Temático</p>
      </div>

      {/* Global keyframes */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
    </div>
  )
}

/* ── Inline form (no ContactForm component — luxury style) ── */
function LuxuryForm({ imovelId, imovelTitulo }: { imovelId: string; imovelTitulo: string }) {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '0.875rem 1rem', color: '#F5F5F5', fontSize: '0.875rem',
    outline: 'none', transition: 'border-color 0.2s',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em',
    color: 'rgba(245,245,245,0.35)', marginBottom: '0.5rem',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imovel_id: imovelId, imovel_titulo: imovelTitulo }),
      })
      setStatus(res.ok ? 'ok' : 'error')
    } catch { setStatus('error') }
  }

  if (status === 'ok') return (
    <div className="text-center py-12">
      <p className="font-serif text-2xl mb-3" style={{ color: '#C9A96E' }}>Mensagem enviada</p>
      <p className="text-sm opacity-40">A nossa equipa entrará em contacto brevemente.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="font-serif text-xl mb-6" style={{ color: 'rgba(245,245,245,0.7)' }}>Pedir informações</p>

      <div><label style={labelStyle}>Nome</label>
        <input required style={inputStyle} value={form.nome} placeholder="O seu nome"
          onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
          onFocus={e => (e.target.style.borderColor = '#C9A96E')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} /></div>

      <div className="grid grid-cols-2 gap-4">
        <div><label style={labelStyle}>Email</label>
          <input required type="email" style={inputStyle} value={form.email} placeholder="email@exemplo.pt"
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            onFocus={e => (e.target.style.borderColor = '#C9A96E')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} /></div>
        <div><label style={labelStyle}>Telefone</label>
          <input style={inputStyle} value={form.telefone} placeholder="+351 9xx xxx xxx"
            onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
            onFocus={e => (e.target.style.borderColor = '#C9A96E')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} /></div>
      </div>

      <div><label style={labelStyle}>Mensagem</label>
        <textarea rows={4} style={{ ...inputStyle, resize: 'none' }} value={form.mensagem}
          placeholder="Tenho interesse neste imóvel..."
          onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))}
          onFocus={e => (e.target.style.borderColor = '#C9A96E')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} /></div>

      {status === 'error' && <p className="text-red-400 text-xs">Erro ao enviar. Tente novamente.</p>}

      <button type="submit" disabled={status === 'loading'}
        className="w-full font-semibold text-sm tracking-wide transition-opacity disabled:opacity-60"
        style={{ padding: '1rem', borderRadius: 10, background: '#C9A96E', color: '#000' }}>
        {status === 'loading' ? 'A enviar…' : 'Enviar Pedido'}
      </button>
    </form>
  )
}
