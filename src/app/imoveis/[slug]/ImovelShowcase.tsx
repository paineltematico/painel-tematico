'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Bed, Bath, Car, Maximize2, MapPin, ChevronLeft, ChevronRight,
  Phone, MessageCircle, Calendar, Share2, Copy, Printer, Check,
} from 'lucide-react'
import type { Imovel } from '@/types/database'
import { cn, formatPrice, formatArea } from '@/lib/utils'
import Gallery, { Lightbox } from '@/components/imoveis/Gallery'
import Reveal from '@/components/motion/Reveal'
import Parallax from '@/components/motion/Parallax'
import Magnetic from '@/components/motion/Magnetic'

interface Angariador {
  nome: string
  role: string
}

/**
 * Página de detalhe do imóvel — clara, sofisticada e "photo-first".
 * Hero fotográfico com parallax, cartão de preço/CTAs sobreposto, galeria
 * mobile-first (swipe nativo + lightbox), plantas, especificidades, mapa,
 * responsável e formulário de contacto. Paleta da marca sobre fundos claros.
 */
export default function ImovelShowcase({
  imovel,
  angariador,
}: {
  imovel: Imovel
  angariador?: Angariador | null
}) {
  const fotos = imovel.fotos ?? []
  const plantas = imovel.plantas ?? []
  const heroImg = fotos[0] ?? null

  const [scrolled, setScrolled] = useState(false)
  const [copied, setCopied] = useState(false)
  const [lbPlantas, setLbPlantas] = useState<number | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.45)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: imovel.titulo, url: window.location.href })
      } catch {
        /* cancelado */
      }
    } else {
      handleCopy()
    }
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const features = [
    imovel.quartos != null && { icon: Bed, label: 'Quartos', value: String(imovel.quartos) },
    imovel.casas_banho != null && { icon: Bath, label: 'Casas de banho', value: String(imovel.casas_banho) },
    imovel.area_m2 != null && { icon: Maximize2, label: 'Área', value: formatArea(imovel.area_m2) },
    imovel.garagem && { icon: Car, label: 'Garagem', value: 'Incluída' },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string }[]

  const location = [imovel.localizacao, imovel.cidade, imovel.distrito].filter(Boolean).join(' · ')
  const address = [imovel.localizacao, imovel.cidade, imovel.distrito].filter(Boolean).join(', ')

  return (
    <div className="bg-[#FAF9F7] text-[#1F3F44]">
      {/* ══ NAV — transparente sobre a foto, clara ao descer ══ */}
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-8 py-4 transition-all duration-300 print:hidden',
          scrolled
            ? 'bg-[#FAF9F7]/90 backdrop-blur-md border-b border-[#ECE7DE]'
            : 'bg-gradient-to-b from-black/45 to-transparent'
        )}
      >
        <Link
          href="/imoveis"
          className={cn(
            'flex items-center gap-1.5 text-sm font-medium transition-colors group',
            scrolled ? 'text-[#1F3F44] hover:text-[#00545F]' : 'text-white/85 hover:text-white'
          )}
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Todos os imóveis
        </Link>
        <Link href="/" className="hidden sm:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={scrolled ? '/logos/logo-dark.jpg' : '/logos/logo-white.png'}
            alt="Painel Temático"
            className={cn('h-6 w-auto transition-opacity', scrolled ? 'rounded' : 'opacity-90')}
          />
        </Link>
        <a
          href="#contacto"
          className={cn(
            'text-xs font-semibold uppercase tracking-[0.15em] px-4 sm:px-5 py-2.5 rounded-full transition-all',
            scrolled
              ? 'bg-[#00545F] text-white hover:bg-[#006B78]'
              : 'border border-white/70 text-white hover:bg-white hover:text-[#1F3F44]'
          )}
        >
          Contactar
        </a>
      </nav>

      {/* ══ HERO fotográfico ══ */}
      <header className="relative overflow-hidden" style={{ height: 'min(78svh, 820px)', minHeight: 480 }}>
        {heroImg ? (
          <Parallax amount={80} className="absolute inset-0 -top-12 -bottom-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImg} alt={imovel.titulo} className="w-full h-full object-cover" />
          </Parallax>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1F3F44] to-[#0f2427]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/25 pointer-events-none" />

        <div className="absolute inset-x-0 bottom-0 px-4 sm:px-8 lg:px-14 pb-24 sm:pb-28">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-3" style={{ animation: 'ptFadeUp 0.9s 0.1s ease both' }}>
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] px-2.5 py-1 rounded-full bg-white/92 text-[#1F3F44]">
                {imovel.tipo}
              </span>
              {imovel.tipologia && (
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] px-2.5 py-1 rounded-full bg-[#00545F]/90 text-white">
                  {imovel.tipologia}
                </span>
              )}
            </div>
            <h1
              className="font-serif font-bold text-white leading-[0.95] tracking-tight max-w-4xl [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]"
              style={{ fontSize: 'clamp(2rem, 5.5vw, 4.6rem)', animation: 'ptFadeUp 0.9s 0.2s ease both' }}
            >
              {imovel.titulo}
            </h1>
            {location && (
              <p
                className="flex items-center gap-2 text-white/85 text-sm mt-4"
                style={{ animation: 'ptFadeUp 0.9s 0.32s ease both' }}
              >
                <MapPin className="w-4 h-4 text-[#6BBFC9]" /> {location}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* ══ Cartão de preço + CTAs (sobreposto ao hero) ══ */}
      <div className="relative z-10 px-4 sm:px-8 lg:px-14 -mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl ring-1 ring-[#ECE7DE] shadow-[0_24px_60px_-30px_rgba(31,63,68,0.35)] px-5 sm:px-8 py-5 sm:py-6 flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#8a8377] mb-1">Preço</p>
              {imovel.preco ? (
                <p className="font-serif font-bold text-3xl sm:text-4xl text-[#00545F]">
                  {formatPrice(imovel.preco, imovel.tipo)}
                </p>
              ) : (
                <p className="font-serif font-bold text-2xl text-[#8a8377]">Sob consulta</p>
              )}
            </div>

            <div className="flex items-center gap-6 sm:gap-8">
              {features.slice(0, 4).map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center">
                  <Icon className="w-4.5 h-4.5 mx-auto mb-1 text-[#00545F]" />
                  <p className="font-semibold text-sm leading-none">{value}</p>
                  <p className="text-[10px] text-[#8a8377] mt-1 uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2.5 lg:justify-end flex-wrap">
              <Magnetic>
                <Link
                  href={`/visita?imovel=${imovel.id}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#00545F] text-white text-sm font-semibold hover:bg-[#006B78] transition-colors shadow-sm"
                >
                  <Calendar className="w-4 h-4" /> Agendar visita
                </Link>
              </Magnetic>
              <a
                href="https://wa.me/351913440800"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[#E4DFD6] text-sm font-medium text-[#1F3F44] hover:border-[#00545F] hover:text-[#00545F] transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <div className="flex items-center gap-1.5">
                {[
                  { icon: Share2, label: 'Partilhar', onClick: handleShare },
                  { icon: copied ? Check : Copy, label: copied ? 'Copiado!' : 'Copiar link', onClick: handleCopy },
                  { icon: Printer, label: 'Imprimir', onClick: () => window.print() },
                ].map(({ icon: Icon, label, onClick }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={onClick}
                    title={label}
                    aria-label={label}
                    className="w-10 h-10 rounded-xl border border-[#E4DFD6] flex items-center justify-center text-[#5c6664] hover:border-[#00545F] hover:text-[#00545F] transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ GALERIA — a protagonista ══ */}
      {fotos.length > 1 && (
        <section className="pt-12 sm:pt-16 px-4 sm:px-8 lg:px-14">
          <div className="max-w-7xl mx-auto">
            <Reveal from="up">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-[#00545F] text-xs font-semibold uppercase tracking-[0.22em] mb-1.5">Galeria</p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold">
                    {fotos.length} fotografias
                  </h2>
                </div>
                <p className="text-xs text-[#a39b8d] hidden sm:block">Clique para ampliar</p>
              </div>
              <Gallery images={fotos} title={imovel.titulo} />
            </Reveal>
          </div>
        </section>
      )}

      {/* ══ DESCRIÇÃO + características ══ */}
      {(imovel.descricao || features.length > 0) && (
        <section className="py-14 sm:py-20 px-4 sm:px-8 lg:px-14">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">
            {imovel.descricao && (
              <Reveal from="up" className="lg:col-span-3">
                <p className="text-[#00545F] text-xs font-semibold uppercase tracking-[0.22em] mb-5">Descrição</p>
                <p className="font-serif text-[#2c4a4e] leading-[1.8]" style={{ fontSize: 'clamp(1.05rem, 1.6vw, 1.35rem)' }}>
                  {imovel.descricao}
                </p>
              </Reveal>
            )}
            {features.length > 0 && (
              <Reveal from="right" className={imovel.descricao ? 'lg:col-span-2' : 'lg:col-span-5'}>
                <div className="bg-white rounded-2xl ring-1 ring-[#ECE7DE] p-6 sm:p-7">
                  {features.map(({ icon: Icon, label, value }, i) => (
                    <div
                      key={label}
                      className={cn('flex items-center gap-4 py-3.5', i > 0 && 'border-t border-[#F1EDE6]')}
                    >
                      <span className="w-9 h-9 rounded-xl bg-[#E9F4F3] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#00545F]" />
                      </span>
                      <span className="text-sm text-[#6b7572]">{label}</span>
                      <span className="ml-auto font-semibold text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* ══ ESPECIFICIDADES ══ */}
      {imovel.especificidades && imovel.especificidades.length > 0 && (
        <section className="pb-14 sm:pb-20 px-4 sm:px-8 lg:px-14">
          <div className="max-w-7xl mx-auto">
            <Reveal from="up">
              <p className="text-[#00545F] text-xs font-semibold uppercase tracking-[0.22em] mb-5">Especificidades</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
                {imovel.especificidades.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 border-b border-[#ECE7DE]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6BBFC9] flex-shrink-0" />
                    <span className="text-sm text-[#4a5a58]">{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ══ PLANTAS ══ */}
      {plantas.length > 0 && (
        <section className="pb-14 sm:pb-20 px-4 sm:px-8 lg:px-14">
          <div className="max-w-7xl mx-auto">
            <Reveal from="up">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-[#00545F] text-xs font-semibold uppercase tracking-[0.22em] mb-1.5">Plantas</p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold">
                    {plantas.length === 1 ? 'Planta do imóvel' : `${plantas.length} plantas`}
                  </h2>
                </div>
                <p className="text-xs text-[#a39b8d] hidden sm:block">Clique para ampliar</p>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {plantas.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLbPlantas(i)}
                    className="group shrink-0 snap-start w-[280px] sm:w-[380px] aspect-[4/3] bg-white rounded-2xl ring-1 ring-[#ECE7DE] hover:ring-[#00545F]/40 overflow-hidden transition-all p-3"
                    aria-label={`Abrir planta ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Planta ${i + 1}`}
                      loading="lazy"
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </button>
                ))}
              </div>
            </Reveal>
          </div>
          {lbPlantas !== null && (
            <Lightbox images={plantas} title={`${imovel.titulo} — plantas`} initial={lbPlantas} onClose={() => setLbPlantas(null)} />
          )}
        </section>
      )}

      {/* ══ LOCALIZAÇÃO ══ */}
      {location && (
        <section className="pb-14 sm:pb-20 px-4 sm:px-8 lg:px-14">
          <div className="max-w-7xl mx-auto">
            <Reveal from="up">
              <p className="text-[#00545F] text-xs font-semibold uppercase tracking-[0.22em] mb-1.5">Localização</p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
                {imovel.cidade ?? imovel.distrito ?? 'Portugal'}
              </h2>
              <p className="flex items-center gap-2 text-sm text-[#6b7572] mb-6">
                <MapPin className="w-4 h-4 text-[#00545F]" /> {address}
              </p>
              <div className="rounded-2xl overflow-hidden ring-1 ring-[#ECE7DE]" style={{ height: 400 }}>
                <iframe
                  title="Localização no mapa"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'saturate(0.85)' }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ══ RESPONSÁVEL + CONTACTO ══ */}
      <section id="contacto" className="py-14 sm:py-20 px-4 sm:px-8 lg:px-14 bg-white border-t border-[#ECE7DE]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
          <Reveal from="left">
            <p className="text-[#00545F] text-xs font-semibold uppercase tracking-[0.22em] mb-4">Contacto</p>
            <h2 className="font-serif font-bold leading-tight mb-3" style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.6rem)' }}>
              Agendar visita
            </h2>
            <p className="text-[#6b7572] text-sm leading-relaxed mb-8 max-w-sm">
              Visitas acompanhadas pela nossa equipa, ao seu ritmo e sem compromisso.
            </p>

            {angariador && (
              <div className="flex items-center gap-4 mb-8 p-4 rounded-2xl bg-[#FAF9F7] ring-1 ring-[#ECE7DE]">
                <span className="w-12 h-12 rounded-full bg-[#E9F4F3] flex items-center justify-center font-serif font-bold text-lg text-[#00545F] flex-shrink-0">
                  {angariador.nome.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="font-semibold text-sm">{angariador.nome}</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8377] mt-0.5">
                    Responsável por este imóvel
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2.5 max-w-sm">
              <Link
                href={`/visita?imovel=${imovel.id}`}
                className="flex items-center gap-3 w-full rounded-xl px-5 py-4 bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors group"
              >
                <Calendar className="w-4.5 h-4.5" /> Agendar visita
                <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://wa.me/351913440800"
                className="flex items-center gap-3 w-full rounded-xl px-5 py-4 ring-1 ring-[#E4DFD6] text-sm text-[#1F3F44] hover:ring-[#00545F] transition-all"
              >
                <MessageCircle className="w-4.5 h-4.5 text-[#00545F]" /> WhatsApp — resposta rápida
              </a>
              <a
                href="tel:+351913440800"
                className="flex items-center gap-3 w-full rounded-xl px-5 py-4 ring-1 ring-[#E4DFD6] text-sm text-[#1F3F44] hover:ring-[#00545F] transition-all"
              >
                <Phone className="w-4.5 h-4.5 text-[#00545F]" /> +351 913 440 800
              </a>
            </div>
          </Reveal>

          <Reveal from="right">
            <div className="bg-[#FAF9F7] rounded-2xl ring-1 ring-[#ECE7DE] p-6 sm:p-8">
              <InfoForm imovelId={imovel.id} imovelTitulo={imovel.titulo} />
            </div>
          </Reveal>
        </div>
      </section>

      <style>{`
        @keyframes ptFadeUp { from { opacity: 0; transform: translateY(26px) } to { opacity: 1; transform: translateY(0) } }
        @media print { nav, .print\\:hidden { display: none !important } section { break-inside: avoid } }
      `}</style>
    </div>
  )
}

/* ── Formulário de pedido de informações (claro) ── */
function InfoForm({ imovelId, imovelTitulo }: { imovelId: string; imovelTitulo: string }) {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')

  const inputCls =
    'w-full bg-white ring-1 ring-[#E4DFD6] rounded-xl px-4 py-3 text-sm text-[#1F3F44] placeholder-[#a39b8d] focus:outline-none focus:ring-2 focus:ring-[#00545F]/40 transition-all'
  const labelCls = 'block text-[10px] uppercase tracking-[0.18em] text-[#8a8377] mb-1.5'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imovel_id: imovelId, imovel_titulo: imovelTitulo }),
      })
      setStatus(res.ok ? 'ok' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'ok') {
    return (
      <div className="text-center py-12">
        <p className="font-serif text-2xl text-[#00545F] mb-2">Mensagem enviada</p>
        <p className="text-sm text-[#8a8377]">A nossa equipa entrará em contacto brevemente.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="font-serif text-xl font-semibold mb-5">Pedir informações</p>
      <div>
        <label className={labelCls}>Nome</label>
        <input
          required
          className={inputCls}
          value={form.nome}
          placeholder="O seu nome"
          onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
        />
      </div>
      <div>
        <label className={labelCls}>Email</label>
        <input
          required
          type="email"
          className={inputCls}
          value={form.email}
          placeholder="email@exemplo.pt"
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
      </div>
      <div>
        <label className={labelCls}>Telefone</label>
        <input
          className={inputCls}
          value={form.telefone}
          placeholder="+351 9xx xxx xxx"
          onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
        />
      </div>
      <div>
        <label className={labelCls}>Mensagem</label>
        <textarea
          rows={3}
          className={cn(inputCls, 'resize-none')}
          value={form.mensagem}
          placeholder="Tenho interesse neste imóvel…"
          onChange={(e) => setForm((f) => ({ ...f, mensagem: e.target.value }))}
        />
      </div>
      {status === 'error' && <p className="text-red-600 text-xs">Erro ao enviar. Tente novamente.</p>}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded-xl py-3.5 bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors disabled:opacity-60"
      >
        {status === 'loading' ? 'A enviar…' : 'Enviar pedido'}
      </button>
    </form>
  )
}
