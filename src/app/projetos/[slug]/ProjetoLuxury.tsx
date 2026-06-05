'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, X, ChevronRight, ZoomIn, Download,
  FileText, Play, Phone, MessageCircle, Calendar,
  ArrowDown, MapPin, Home, CheckCircle, Building2, Clock,
} from 'lucide-react'
import type { Projeto, Unidade, AtualizacaoObra, Testemunho } from '@/types/database'

/* ── palette ── */
const G  = '#C9A96E'   // gold
const D  = '#07100f'   // darkest — near-black with brand teal undertone
const D2 = '#0d1a1c'   // dark teal-black
const D3 = '#101f22'   // medium dark teal (echoes #1F3F44 at low luminosity)

/* ── helpers ── */
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

function CountUp({ to, suffix = '', active }: { to: number; suffix?: string; active: boolean }) {
  const [n, setN] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (!active || started.current) return
    started.current = true
    const dur = 1600, t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1)
      setN(Math.round((1 - Math.pow(1 - p, 3)) * to))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active, to])
  return <>{n}{suffix}</>
}

function getEmbed(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?color=c9a96e&title=0&byline=0`
  return url.includes('/embed') ? url : null
}

function isPDF(url: string) { return url.toLowerCase().includes('.pdf') }

function plantLabel(url: string, i: number) {
  return decodeURIComponent(url.split('/').pop() ?? '')
    .replace(/^[a-z0-9-]+-\d+\./, '').replace(/[-_]/g, ' ').replace(/\.\w+$/, '') || `Planta ${i + 1}`
}

const ESTADO_CFG = {
  em_curso:   { label: 'Em Construção', Icon: Building2, cls: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#93c5fd' },
  concluido:  { label: 'Concluído',     Icon: CheckCircle, cls: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', text: '#86efac' },
  brevemente: { label: 'Brevemente',    Icon: Clock, cls: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.3)', text: '#fde047' },
}

/* ══════════════════════════════════════════════════════════════ */
export default function ProjetoLuxury({
  projeto, unidades, atualizacoes, testemunhos,
}: {
  projeto: Projeto
  unidades: Unidade[]
  atualizacoes: AtualizacaoObra[]
  testemunhos: Testemunho[]
}) {
  /* parallax */
  const bgRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let tick = false
    const fn = () => {
      if (tick) return; tick = true
      requestAnimationFrame(() => {
        if (bgRef.current) bgRef.current.style.transform = `translateY(${window.scrollY * 0.32}px)`
        tick = false
      })
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* lightbox */
  const fotos   = Array.isArray(projeto.fotos)   ? projeto.fotos   : []
  const plantas = Array.isArray(projeto.plantas) ? projeto.plantas : []
  const videos  = Array.isArray(projeto.videos)  ? projeto.videos  : []
  const embeds  = videos.map(v => ({ raw: v, embed: getEmbed(v) })).filter(v => v.embed)

  const [lb, setLb] = useState<number | null>(null)
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

  /* section visibility */
  const [r1, v1] = useVisible()
  const [r2, v2] = useVisible()
  const [r3, v3] = useVisible()
  const [r4, v4] = useVisible()
  const [r5, v5] = useVisible()
  const [r6, v6] = useVisible()

  const heroMedia   = projeto.hero_video || null
  const heroImg     = projeto.imagem_hero || projeto.imagem
  const estado      = ESTADO_CFG[projeto.estado]
  const { Icon: StateIcon } = estado
  const unidadesDisp = unidades.filter(u => u.estado === 'disponivel').length
  const lastUpdate   = atualizacoes[0]

  const ticker = `${projeto.nome.toUpperCase()} · ${projeto.cidade ?? 'BRAGA'} · ${estado.label.toUpperCase()} · ${projeto.unidades_total ? `${projeto.unidades_total} UNIDADES` : ''} · `.repeat(6)

  /* ─── RENDER ─── */
  return (
    <div style={{ background: D, color: '#F5F5F5', fontFamily: 'var(--font-cera)', overflowX: 'hidden' }}>

      {/* ══ OVERLAY NAV ══ */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-5"
        style={{ background: 'linear-gradient(to bottom, rgba(7,16,15,0.92) 0%, transparent 100%)' }}>
        <Link href="/projetos" className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Todos os projetos
        </Link>
        <Link href="/"><img src="/logos/logo-white.png" alt="Painel Temático" className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" /></Link>
        <a href="#contacto" className="text-xs font-semibold uppercase tracking-[0.2em] px-5 py-2.5 rounded-full border transition-all"
          style={{ borderColor: G, color: G }}
          onMouseEnter={e => { const el = e.currentTarget; el.style.background = G; el.style.color = '#000' }}
          onMouseLeave={e => { const el = e.currentTarget; el.style.background = ''; el.style.color = G }}>
          Contactar
        </a>
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden" style={{ height: '100vh', minHeight: 700 }}>
        {/* media */}
        {heroMedia
          ? <video src={heroMedia} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
          : heroImg
            ? <div ref={bgRef} className="absolute will-change-transform"
                style={{ inset: '-30% 0', backgroundImage: `url(${heroImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            : <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#1F3F44 0%,#0a0a0a 100%)' }} />}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(7,16,15,0.97) 0%,rgba(7,16,15,0.35) 55%,rgba(7,16,15,0.6) 100%)' }} />

        {/* content */}
        <div className="absolute inset-0 flex flex-col justify-end px-8 sm:px-14 pb-20 pt-32">
          {/* label row */}
          <div className="flex items-center gap-4 mb-5" style={{ animation: 'fadeUp 1s 0.1s ease both' }}>
            <span className="text-xs uppercase tracking-[0.3em] opacity-50">Empreendimento</span>
            <span className="w-1 h-1 rounded-full opacity-30" style={{ background: G }} />
            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border"
              style={{ background: estado.cls, borderColor: estado.border, color: estado.text }}>
              <StateIcon className="w-3 h-3" />{estado.label}
            </span>
          </div>

          {/* title */}
          <h1 className="font-serif font-bold tracking-tight leading-[0.88] mb-5"
            style={{ fontSize: 'clamp(3.5rem,9vw,10rem)', animation: 'fadeUp 1s 0.2s ease both' }}>
            {projeto.nome}
          </h1>

          {projeto.subtitulo && (
            <p className="mb-6 opacity-55 font-light" style={{ fontSize: 'clamp(1rem,1.8vw,1.4rem)', animation: 'fadeUp 1s 0.35s ease both' }}>
              {projeto.subtitulo}
            </p>
          )}

          {projeto.localizacao && (
            <div className="flex items-center gap-2 mb-12 opacity-45" style={{ animation: 'fadeUp 1s 0.45s ease both' }}>
              <MapPin className="w-4 h-4" style={{ color: G }} />
              <span className="text-sm tracking-wide">{projeto.cidade ? `${projeto.cidade} · ` : ''}{projeto.localizacao}</span>
            </div>
          )}

          {/* bottom stats row */}
          <div className="flex items-center gap-10 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', animation: 'fadeUp 1s 0.55s ease both' }}>
            {projeto.unidades_total && (
              <div><p className="font-serif font-bold text-3xl">{projeto.unidades_total}</p><p className="text-[10px] uppercase tracking-[0.2em] opacity-40 mt-1">Unidades</p></div>
            )}
            {unidadesDisp > 0 && (
              <div><p className="font-serif font-bold text-3xl" style={{ color: G }}>{unidadesDisp}</p><p className="text-[10px] uppercase tracking-[0.2em] opacity-40 mt-1">Disponíveis</p></div>
            )}
            {projeto.cidade && (
              <div><p className="font-serif font-bold text-3xl">{projeto.cidade}</p><p className="text-[10px] uppercase tracking-[0.2em] opacity-40 mt-1">Localização</p></div>
            )}
            {lastUpdate && projeto.estado === 'em_curso' && (
              <div><p className="font-serif font-bold text-3xl" style={{ color: G }}>{lastUpdate.percentagem_conclusao}%</p><p className="text-[10px] uppercase tracking-[0.2em] opacity-40 mt-1">Concluído</p></div>
            )}
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-30" style={{ animation: 'bounce 2s 2s infinite' }}>
          <ArrowDown className="w-5 h-5" />
        </div>
      </section>

      {/* ══ TICKER ══ */}
      <div className="overflow-hidden py-4" style={{ background: D2, borderBlock: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'ticker 30s linear infinite' }}>
          <span className="text-xs uppercase tracking-[0.3em] opacity-25 pr-8">{ticker}</span>
          <span className="text-xs uppercase tracking-[0.3em] opacity-25 pr-8">{ticker}</span>
        </div>
      </div>

      {/* ══ STORY ══ */}
      {projeto.descricao && (
        <section style={{ background: D3, paddingBlock: '9rem' }}>
          <div ref={r1} className="max-w-6xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-5 gap-20 items-start"
            style={{ transition: 'all 1.2s ease', opacity: v1 ? 1 : 0, transform: v1 ? 'none' : 'translateY(40px)' }}>
            <div className="lg:col-span-3">
              <p className="text-xs uppercase tracking-[0.3em] mb-8" style={{ color: G, opacity: 0.75 }}>A nossa visão</p>
              <p className="font-serif leading-[1.75] text-white/75"
                style={{ fontSize: 'clamp(1.1rem,1.8vw,1.4rem)' }}>
                {projeto.descricao}
              </p>
            </div>
            <div className="lg:col-span-2 space-y-0">
              {[
                { label: 'Estado',       value: estado.label },
                { label: 'Localização',  value: `${projeto.cidade ?? ''} ${projeto.localizacao ? `· ${projeto.localizacao}` : ''}`.trim() },
                ...(projeto.unidades_total ? [{ label: 'Total de unidades', value: String(projeto.unidades_total) }] : []),
                ...(unidadesDisp > 0 ? [{ label: 'Disponíveis', value: String(unidadesDisp) }] : []),
              ].map(({ label, value }, i) => (
                <div key={label} className="flex items-center justify-between py-5"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    transition: `all 0.8s ease ${100 + i * 100}ms`,
                    opacity: v1 ? 1 : 0,
                    transform: v1 ? 'none' : 'translateX(20px)',
                  }}>
                  <span className="text-xs uppercase tracking-[0.2em] opacity-35">{label}</span>
                  <span className="font-semibold text-sm text-white/80">{value || '—'}</span>
                </div>
              ))}
              {/* Progress bar if em_curso */}
              {lastUpdate && projeto.estado === 'em_curso' && (
                <div className="pt-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs uppercase tracking-[0.2em] opacity-35">Conclusão</span>
                    <span className="font-serif font-bold text-xl" style={{ color: G }}>{lastUpdate.percentagem_conclusao}%</span>
                  </div>
                  <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 99 }}>
                    <div style={{ height: '100%', width: v1 ? `${lastUpdate.percentagem_conclusao}%` : '0%', background: G, borderRadius: 99, transition: 'width 1.5s ease 0.5s' }} />
                  </div>
                  {lastUpdate.fase && <p className="text-xs opacity-30 mt-3 uppercase tracking-[0.15em]">{lastUpdate.fase}</p>}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══ GALLERY ══ */}
      {fotos.length > 0 && (
        <section style={{ background: D, paddingBlock: '7rem' }}>
          <div className="max-w-7xl mx-auto px-8">
            {/* Header */}
            <div ref={r2} className="flex items-end justify-between mb-10"
              style={{ transition: 'all 1s ease', opacity: v2 ? 1 : 0, transform: v2 ? 'none' : 'translateY(24px)' }}>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] mb-2 opacity-40">Galeria</p>
                <h2 className="font-serif font-bold" style={{ fontSize: 'clamp(2rem,4vw,4.5rem)' }}>
                  {fotos.length} fotografias
                </h2>
              </div>
              <p className="text-xs opacity-25 uppercase tracking-[0.2em] hidden sm:block">← → para navegar</p>
            </div>

            {/* Featured first image */}
            {fotos[0] && (
              <div className="relative overflow-hidden rounded-xl mb-3 group cursor-zoom-in"
                onClick={() => setLb(0)}
                style={{ aspectRatio: '16/7', transition: 'all 1s ease 0.2s', opacity: v2 ? 1 : 0 }}>
                <img src={fotos[0]} alt="Principal" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <ZoomIn className="w-10 h-10 text-white drop-shadow" />
                </div>
                <span className="absolute bottom-4 right-4 text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.6)' }}>
                  1 / {fotos.length}
                </span>
              </div>
            )}

            {/* Masonry rest */}
            {fotos.length > 1 && (
              <div className="columns-2 lg:columns-3 gap-3">
                {fotos.slice(1).map((url, i) => (
                  <div key={i} className="break-inside-avoid mb-3 group relative overflow-hidden rounded-xl cursor-zoom-in"
                    onClick={() => setLb(i + 1)}>
                    <img src={url} alt={`Foto ${i + 2}`} loading="lazy"
                      className="w-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.25)' }}>
                      <ZoomIn className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lightbox */}
          {lb !== null && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.97)' }} onClick={() => setLb(null)}>
              <img src={fotos[lb]} alt="" className="max-h-[88vh] max-w-[88vw] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
              <button onClick={() => setLb(null)} className="absolute top-5 right-5 w-11 h-11 rounded-full flex items-center justify-center text-white" style={{ background: 'rgba(255,255,255,0.1)' }}><X className="w-5 h-5" /></button>
              <div className="absolute top-5 left-1/2 -translate-x-1/2 text-sm" style={{ color: 'rgba(245,245,245,0.3)' }}>{lb + 1} / {fotos.length}</div>
              {fotos.length > 1 && <>
                <button onClick={e => { e.stopPropagation(); prev() }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: 'rgba(255,255,255,0.08)' }}><ChevronLeft className="w-6 h-6" /></button>
                <button onClick={e => { e.stopPropagation(); next() }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: 'rgba(255,255,255,0.08)' }}><ChevronRight className="w-6 h-6" /></button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[80vw] overflow-x-auto">
                  {fotos.map((u, i) => (
                    <button key={i} onClick={e => { e.stopPropagation(); setLb(i) }} className="flex-shrink-0 w-12 h-9 rounded overflow-hidden border-2 transition-all"
                      style={{ borderColor: i === lb ? G : 'transparent', opacity: i === lb ? 1 : 0.3 }}>
                      <img src={u} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </>}
            </div>
          )}
        </section>
      )}

      {/* ══ VIDEOS ══ */}
      {embeds.length > 0 && (
        <section style={{ background: D2, paddingBlock: '8rem' }}>
          <div className="max-w-6xl mx-auto px-8">
            <div ref={r3} style={{ transition: 'all 1s ease', opacity: v3 ? 1 : 0, transform: v3 ? 'none' : 'translateY(30px)' }}>
              <p className="text-xs uppercase tracking-[0.3em] mb-4 opacity-40">Vídeos</p>
              <h2 className="font-serif font-bold mb-14" style={{ fontSize: 'clamp(2rem,4vw,4.5rem)' }}>
                Conheça o projeto
              </h2>
              <div className={`grid gap-5 ${embeds.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
                {embeds.map(({ embed }, i) => (
                  <div key={i} className="relative overflow-hidden rounded-xl" style={{ aspectRatio: '16/9', background: '#000' }}>
                    <iframe src={embed!} title={`Vídeo ${i + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen className="absolute inset-0 w-full h-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ PLANTS DOWNLOAD ══ */}
      {plantas.length > 0 && (
        <section style={{ background: D, paddingBlock: '8rem' }}>
          <div className="max-w-6xl mx-auto px-8">
            <div ref={r4} style={{ transition: 'all 1s ease', opacity: v4 ? 1 : 0, transform: v4 ? 'none' : 'translateY(30px)' }}>
              <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: G, opacity: 0.7 }}>Plantas</p>
              <h2 className="font-serif font-bold mb-14" style={{ fontSize: 'clamp(2rem,4vw,4.5rem)' }}>
                Descarregar plantas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plantas.map((url, i) => (
                  <a key={i} href={url} download target="_blank" rel="noreferrer"
                    className="group flex items-center gap-5 p-6 rounded-2xl transition-all duration-300"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(201,169,110,0.07)'; el.style.borderColor = 'rgba(201,169,110,0.3)' }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,0.04)'; el.style.borderColor = 'rgba(255,255,255,0.07)' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{ background: 'rgba(201,169,110,0.1)' }}>
                      {isPDF(url)
                        ? <FileText className="w-5 h-5" style={{ color: G }} />
                        : <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white/80 truncate capitalize">{plantLabel(url, i)}</p>
                      <p className="text-xs opacity-30 mt-0.5 uppercase tracking-[0.15em]">{isPDF(url) ? 'PDF' : 'Imagem'}</p>
                    </div>
                    <Download className="w-4 h-4 flex-shrink-0 opacity-30 group-hover:opacity-70 transition-opacity" style={{ color: G }} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ UNITS ══ */}
      {unidades.length > 0 && (
        <section id="unidades" style={{ background: D2, paddingBlock: '8rem' }}>
          <div className="max-w-7xl mx-auto px-8">
            <div ref={r5} style={{ transition: 'all 1s ease', opacity: v5 ? 1 : 0, transform: v5 ? 'none' : 'translateY(30px)' }}>
              <p className="text-xs uppercase tracking-[0.3em] mb-4 opacity-40">Disponibilidade</p>
              <h2 className="font-serif font-bold mb-14" style={{ fontSize: 'clamp(2rem,4vw,4.5rem)' }}>
                Frações disponíveis
              </h2>
              {/* Horizontal scroll */}
              <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin', scrollbarColor: `${G} transparent` }}>
                {unidades.map((u, i) => {
                  const isDisp = u.estado === 'disponivel'
                  const isReserved = u.estado === 'reservado'
                  return (
                    <div key={u.id} className="flex-shrink-0 w-64 rounded-2xl p-6 transition-all duration-500"
                      style={{
                        background: isDisp ? 'rgba(201,169,110,0.06)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isDisp ? 'rgba(201,169,110,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        opacity: v5 ? 1 : 0,
                        transform: v5 ? 'none' : 'translateY(20px)',
                        transition: `all 0.6s ease ${i * 60}ms`,
                      }}>
                      <div className="flex items-center justify-between mb-6">
                        <p className="font-serif font-bold text-2xl text-white/90">{u.referencia}</p>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full"
                          style={{
                            background: isDisp ? 'rgba(201,169,110,0.15)' : isReserved ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.05)',
                            color: isDisp ? G : isReserved ? '#fbbf24' : 'rgba(255,255,255,0.3)',
                          }}>
                          {isDisp ? 'Disponível' : isReserved ? 'Reservado' : 'Vendido'}
                        </span>
                      </div>
                      {u.tipologia && <p className="text-sm font-semibold mb-1" style={{ color: G, opacity: 0.8 }}>{u.tipologia}</p>}
                      <div className="space-y-2 mb-6">
                        {u.area_m2 && <div className="flex items-center justify-between text-xs"><span className="opacity-35 uppercase tracking-[0.1em]">Área</span><span className="opacity-70">{u.area_m2} m²</span></div>}
                        {u.piso !== null && <div className="flex items-center justify-between text-xs"><span className="opacity-35 uppercase tracking-[0.1em]">Piso</span><span className="opacity-70">{u.piso}</span></div>}
                      </div>
                      {u.preco && isDisp && (
                        <p className="font-serif font-bold text-xl" style={{ color: G }}>
                          {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(u.preco)}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ TIMELINE ══ */}
      {atualizacoes.length > 0 && projeto.estado === 'em_curso' && (
        <section style={{ background: D3, paddingBlock: '8rem' }}>
          <div className="max-w-4xl mx-auto px-8">
            <p className="text-xs uppercase tracking-[0.3em] mb-4 opacity-40">Progresso</p>
            <h2 className="font-serif font-bold mb-16" style={{ fontSize: 'clamp(2rem,4vw,4.5rem)' }}>Evolução da obra</h2>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="absolute left-5 top-0 w-px origin-top" style={{ background: G, opacity: 0.5, height: '100%', transform: 'scaleY(1)', transition: 'transform 2s ease' }} />
              <div className="space-y-12">
                {atualizacoes.map((a, i) => (
                  <div key={a.id} className="flex gap-8">
                    <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-serif font-bold text-xs"
                      style={{
                        background: i === 0 ? G : D3,
                        border: `1px solid ${i === 0 ? G : 'rgba(255,255,255,0.12)'}`,
                        color: i === 0 ? '#000' : 'rgba(255,255,255,0.4)',
                      }}>
                      {a.percentagem_conclusao}%
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-serif font-semibold text-white/80 text-lg">{a.titulo}</h3>
                        <span className="text-xs opacity-25 whitespace-nowrap flex-shrink-0">
                          {new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'long' }).format(new Date(a.data_atualizacao))}
                        </span>
                      </div>
                      {a.fase && <p className="text-xs uppercase tracking-[0.15em] mb-2" style={{ color: G, opacity: 0.5 }}>{a.fase}</p>}
                      {a.descricao && <p className="text-sm opacity-40 leading-relaxed">{a.descricao}</p>}
                      {a.fotos && a.fotos.length > 0 && (
                        <div className="flex gap-2 mt-4">
                          {a.fotos.slice(0, 4).map((f, fi) => (
                            <img key={fi} src={f} alt="" className="w-20 h-14 object-cover rounded-lg opacity-70 hover:opacity-100 transition-opacity" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ CONTACT ══ */}
      <section id="contacto" style={{ background: D2, paddingBlock: '9rem' }}>
        <div ref={r6} className="max-w-2xl mx-auto px-8"
          style={{ transition: 'all 1.2s ease', opacity: v6 ? 1 : 0, transform: v6 ? 'none' : 'translateY(30px)' }}>
          <p className="text-xs uppercase tracking-[0.3em] mb-6" style={{ color: G, opacity: 0.7 }}>Contacto</p>
          <h2 className="font-serif font-bold leading-tight mb-6 text-white/90" style={{ fontSize: 'clamp(2rem,4vw,4rem)' }}>
            Marque uma visita ao projeto
          </h2>
          <p className="opacity-40 text-sm leading-relaxed mb-12">
            A nossa equipa está disponível para o acompanhar numa visita exclusiva e personalizada.
          </p>
          <div className="space-y-4">
            <Link href="/visita"
              className="flex items-center gap-4 w-full group rounded-xl font-semibold text-sm text-black"
              style={{ padding: '1.25rem 1.5rem', background: G }}>
              <Calendar className="w-5 h-5 flex-shrink-0" />
              <span className="tracking-wide">Agendar Visita Privada</span>
              <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="https://wa.me/351913440800"
              className="flex items-center gap-4 w-full rounded-xl text-sm text-white/60 transition-colors"
              style={{ padding: '1.25rem 1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}>
              <MessageCircle className="w-5 h-5 flex-shrink-0" style={{ color: G }} />
              WhatsApp — resposta imediata
            </a>
            <a href="tel:+351913440800"
              className="flex items-center gap-4 w-full rounded-xl text-sm text-white/60 transition-colors"
              style={{ padding: '1.25rem 1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}>
              <Phone className="w-5 h-5 flex-shrink-0" style={{ color: G }} />
              +351 913 440 800
            </a>
          </div>
        </div>
      </section>

      {/* ══ FOOTER STRIP ══ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-6"
        style={{ background: D, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/"><img src="/logos/logo-white.png" alt="Painel Temático" className="h-5 w-auto opacity-35" /></Link>
        <div className="flex items-center gap-6">
          {[{ label: 'Projetos', href: '/projetos' }, { label: 'Imóveis', href: '/imoveis' }, { label: 'Contacto', href: '/contacto' }].map(({ label, href }) => (
            <Link key={href} href={href} className="text-xs opacity-25 hover:opacity-50 uppercase tracking-[0.2em] transition-opacity">{label}</Link>
          ))}
        </div>
        <p className="text-xs opacity-15">© 2025 Painel Temático</p>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
        @keyframes bounce { 0%,100% { transform:translateX(-50%) translateY(0) } 50% { transform:translateX(-50%) translateY(8px) } }
        @keyframes ticker { from { transform:translateX(0) } to { transform:translateX(-50%) } }
      `}</style>
    </div>
  )
}

/* ── Inline contact form ── */
function ProjetoForm({ projetoNome, projetoId }: { projetoNome: string; projetoId: string }) {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')

  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '0.875rem 1rem', color: '#F5F5F5', fontSize: '0.875rem',
    outline: 'none', transition: 'border-color 0.2s',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '0.65rem', textTransform: 'uppercase',
    letterSpacing: '0.2em', color: 'rgba(245,245,245,0.3)', marginBottom: '0.5rem',
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setStatus('loading')
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, projeto_nome: projetoNome, projeto_id: projetoId }),
      })
      setStatus(res.ok ? 'ok' : 'error')
    } catch { setStatus('error') }
  }

  if (status === 'ok') return (
    <div className="text-center py-12">
      <p className="font-serif text-2xl mb-3" style={{ color: G }}>Mensagem enviada</p>
      <p className="text-sm opacity-35">Entraremos em contacto brevemente.</p>
    </div>
  )

  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="font-serif text-xl mb-6 text-white/60">Pedir informações</p>
      <div><label style={lbl}>Nome</label>
        <input required style={inp} value={form.nome} placeholder="O seu nome"
          onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
          onFocus={e => (e.target.style.borderColor = G)} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label style={lbl}>Email</label>
          <input required type="email" style={inp} value={form.email} placeholder="email@exemplo.pt"
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            onFocus={e => (e.target.style.borderColor = G)} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} /></div>
        <div><label style={lbl}>Telefone</label>
          <input style={inp} value={form.telefone} placeholder="+351 9xx xxx xxx"
            onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
            onFocus={e => (e.target.style.borderColor = G)} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} /></div>
      </div>
      <div><label style={lbl}>Mensagem</label>
        <textarea rows={4} style={{ ...inp, resize: 'none' }} value={form.mensagem} placeholder="Tenho interesse neste projeto..."
          onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))}
          onFocus={e => (e.target.style.borderColor = G)} onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} /></div>
      {status === 'error' && <p className="text-red-400 text-xs">Erro ao enviar. Tente novamente.</p>}
      <button type="submit" disabled={status === 'loading'}
        className="w-full font-semibold text-sm tracking-wide transition-opacity disabled:opacity-60 rounded-xl"
        style={{ padding: '1rem', background: G, color: '#000' }}>
        {status === 'loading' ? 'A enviar…' : 'Enviar Pedido'}
      </button>
    </form>
  )
}
