'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Shield, Award, MapPin, Hammer, Users, Heart, ChevronDown, ArrowRight } from 'lucide-react'
import type { MembroEquipa } from '@/types/database'
import { EditableText } from '@/components/EditableText'

interface Props {
  equipa: MembroEquipa[]
  sobreTexto: string
  amiNumero: string
  manifestoCitacao: string
  historiaP1: string
  historiaP2: string
  historiaP3: string
}

/* ─── data ─── */
const STATS = [
  { value: 10,  suffix: '+', label: 'Anos\nde experiência' },
  { value: 50,  suffix: '+', label: 'Famílias\napoiadas'   },
  { value: 4,   suffix: '',  label: 'Projetos\nativos'     },
  { value: 100, suffix: '%', label: 'Clientes\nsatisfeitos'},
]

const VALORES = [
  { num: '01', icon: Shield, title: 'Confiança',    desc: 'Transparência total em cada etapa do processo. Sem surpresas, sem letra pequena.'            },
  { num: '02', icon: Hammer, title: 'Qualidade',    desc: 'Construímos com os melhores materiais e técnicas para garantir durabilidade e conforto.'     },
  { num: '03', icon: Heart,  title: 'Compromisso',  desc: 'Cada projeto é tratado como se fosse nosso. O seu sonho é a nossa responsabilidade.'         },
  { num: '04', icon: MapPin, title: 'Proximidade',  desc: 'Conhecemos profundamente o mercado de Braga. Estamos sempre perto de si.'                    },
  { num: '05', icon: Users,  title: 'Equipa',       desc: 'Profissionais experientes e apaixonados que garantem rigor em cada fase da obra.'             },
  { num: '06', icon: Award,  title: 'Excelência',   desc: 'Reconhecidos pela qualidade construtiva e pelo acompanhamento pós-entrega.'                  },
]

const PROCESSO = [
  { step: '01', title: 'Projeto',     desc: 'Arquitetura e engenharia pensadas ao detalhe, com foco na funcionalidade e estética.'    },
  { step: '02', title: 'Construção',  desc: 'Execução rigorosa com materiais certificados e mão-de-obra especializada.'               },
  { step: '03', title: 'Acabamentos', desc: 'Escolha personalizada de acabamentos para refletir o seu gosto e estilo de vida.'         },
  { step: '04', title: 'Entrega',     desc: 'Acompanhamento até à entrega das chaves — e muito além disso.'                           },
]

/* ─── hooks ─── */
function useVisible(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible] as const
}

/* ─── count-up ─── */
function CountUp({ target, suffix, active }: { target: number; suffix: string; active: boolean }) {
  const [count, setCount] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!active || started.current) return
    started.current = true
    const duration = 1800
    const startTime = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(eased * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active, target])

  return <>{count}{suffix}</>
}

/* ─── component ─── */
export default function SobreClient({
  equipa, sobreTexto, amiNumero, manifestoCitacao, historiaP1, historiaP2, historiaP3,
}: Props) {
  const [manifestoRef, manifestoVis] = useVisible()
  const [statsRef,     statsVis]     = useVisible(0.3)
  const [histRef,      histVis]      = useVisible()
  const [valoresRef,   valoresVis]   = useVisible()
  const [processoRef,  processoVis]  = useVisible()
  const [equipaRef,    equipaVis]    = useVisible()

  return (
    <div className="overflow-x-hidden">

      {/* ══ HERO ══ */}
      <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #0d2326 0%, #1F3F44 45%, #00545F 100%)' }}>

        {/* dot grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, #4ecdc4 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
          <span className="font-serif font-black text-[22vw] text-white/[0.025] whitespace-nowrap tracking-tight">
            PAINEL
          </span>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-3 text-[#4ecdc4] text-xs font-semibold uppercase tracking-[0.25em] mb-10">
            <span className="w-10 h-px bg-[#4ecdc4]" />
            Desde 2015 · Braga, Portugal
            <span className="w-10 h-px bg-[#4ecdc4]" />
          </div>

          <h1 className="font-serif font-bold text-white leading-[0.92] tracking-tight">
            <span className="block" style={{ fontSize: 'clamp(3.2rem,9vw,7.5rem)' }}>Construímos</span>
            <span className="block text-[#4ecdc4]" style={{ fontSize: 'clamp(3.2rem,9vw,7.5rem)' }}>mais do que</span>
            <span className="block" style={{ fontSize: 'clamp(3.2rem,9vw,7.5rem)' }}>casas.</span>
          </h1>

          <EditableText
            settingKey="sobre_texto"
            value={sobreTexto || 'Construímos sonhos com rigor, qualidade e transparência — projetos pensados para durar.'}
            as="p"
            className="mt-8 text-white/55 text-lg sm:text-xl font-light max-w-xl mx-auto leading-relaxed"
            multiline
          />

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/projetos"
              className="w-full sm:w-auto px-10 py-4 rounded-xl bg-[#4ecdc4] text-[#1F3F44] font-bold text-sm tracking-wide hover:bg-white transition-colors shadow-xl">
              Ver Projetos
            </Link>
            <Link href="/contacto"
              className="w-full sm:w-auto px-10 py-4 rounded-xl border border-white/25 text-white font-semibold text-sm tracking-wide hover:bg-white/10 transition-colors">
              Falar Connosco
            </Link>
          </div>
        </div>

        {/* scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/35 animate-bounce">
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* ══ MANIFESTO ══ */}
      <section className="py-24 bg-white">
        <div ref={manifestoRef}
          className="max-w-5xl mx-auto px-6 transition-all duration-1000"
          style={{ opacity: manifestoVis ? 1 : 0, transform: manifestoVis ? 'translateY(0)' : 'translateY(40px)' }}>
          <div className="flex gap-0 lg:gap-10 items-stretch">
            <span className="hidden lg:block w-1 bg-[#4ecdc4] rounded-full flex-shrink-0" />
            <div className="lg:pl-2">
              <p className="font-serif italic font-bold text-[#1F3F44] leading-[1.15]"
                style={{ fontSize: 'clamp(1.6rem,3.8vw,2.8rem)' }}>
                <EditableText
                  settingKey="manifesto_citacao"
                  value={manifestoCitacao}
                  multiline
                />
              </p>
              <div className="mt-7 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1F3F44] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#4ecdc4] font-serif font-bold text-sm">PT</span>
                </div>
                <div>
                  <p className="font-semibold text-[#1F3F44] text-sm">Painel Temático</p>
                  <p className="text-[#94a3b8] text-xs">Construção e Promoção Imobiliária, Braga</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section className="py-0 bg-[#1F3F44] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div ref={statsRef}
          className="relative max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/10">
          {STATS.map(({ value, suffix, label }, i) => (
            <div key={i}
              className="px-8 py-14 text-center transition-all duration-700"
              style={{ opacity: statsVis ? 1 : 0, transform: statsVis ? 'translateY(0)' : 'translateY(24px)', transitionDelay: `${i * 120}ms` }}>
              <p className="font-serif font-black text-[#4ecdc4] leading-none"
                style={{ fontSize: 'clamp(3rem,5vw,4.5rem)' }}>
                <CountUp target={value} suffix={suffix} active={statsVis} />
              </p>
              <p className="mt-3 text-white/50 text-sm font-medium whitespace-pre-line leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HISTÓRIA ══ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div ref={histRef}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center transition-all duration-1000"
            style={{ opacity: histVis ? 1 : 0, transform: histVis ? 'translateY(0)' : 'translateY(40px)' }}>

            {/* visual block */}
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/5] bg-[#1F3F44] rounded-3xl overflow-hidden relative">
                {/* hatched pattern */}
                <div className="absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage: `repeating-linear-gradient(45deg, #4ecdc4 0px, #4ecdc4 1px, transparent 1px, transparent 28px),
                                      repeating-linear-gradient(-45deg, #4ecdc4 0px, #4ecdc4 1px, transparent 1px, transparent 28px)`,
                  }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d2326]/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-[#4ecdc4]/70 text-xs uppercase tracking-widest mb-1 font-medium">Braga, Portugal</p>
                  <p className="font-serif font-bold text-white text-2xl leading-snug">
                    Raízes locais.<br />Visão global.
                  </p>
                </div>
              </div>
              {/* badge */}
              <div className="absolute -bottom-5 -right-5 bg-[#4ecdc4] rounded-2xl px-6 py-5 shadow-2xl">
                <p className="font-serif font-black text-[#1F3F44] text-3xl leading-none">10+</p>
                <p className="text-[#1F3F44]/70 text-xs font-semibold mt-1 leading-tight">Anos em<br />Braga</p>
              </div>
            </div>

            {/* text */}
            <div className="order-1 lg:order-2">
              <p className="text-[#00545F] text-sm font-semibold uppercase tracking-widest mb-4">A Nossa História</p>
              <h2 className="font-serif font-bold text-[#1F3F44] mb-6 leading-tight"
                style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)' }}>
                Nascemos em Braga.<br />Crescemos com as famílias.
              </h2>
              <div className="space-y-4 text-[#64748b] leading-relaxed">
                <p><EditableText settingKey="sobre_historia_p1" value={historiaP1} multiline /></p>
                <p><EditableText settingKey="sobre_historia_p2" value={historiaP2} multiline /></p>
                <p><EditableText settingKey="sobre_historia_p3" value={historiaP3} multiline /></p>
              </div>
              <div className="mt-8">
                <Link href="/projetos"
                  className="inline-flex items-center gap-2 text-[#00545F] font-semibold text-sm group">
                  Ver os nossos projetos
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ VALORES ══ */}
      <section className="py-24 bg-[#f7f8f9] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#00545F] text-sm font-semibold uppercase tracking-widest mb-3">O que nos guia</p>
            <h2 className="font-serif font-bold text-[#1F3F44]" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)' }}>
              Os nossos valores
            </h2>
          </div>
          <div ref={valoresRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALORES.map(({ num, icon: Icon, title, desc }, i) => (
              <div key={num}
                className="relative bg-white rounded-3xl p-8 border border-[#e5e7eb] overflow-hidden group cursor-default
                           hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
                style={{
                  opacity: valoresVis ? 1 : 0,
                  transform: valoresVis ? 'translateY(0)' : 'translateY(32px)',
                  transition: `opacity .6s ease ${i * 80}ms, transform .6s ease ${i * 80}ms, box-shadow .3s, translate .3s`,
                }}>
                {/* ghost number */}
                <span className="absolute -right-3 -bottom-5 font-serif font-black text-[6rem] leading-none
                                 text-[#f0f1f3] group-hover:text-[#e8f4f5] transition-colors select-none pointer-events-none">
                  {num}
                </span>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[#1F3F44] flex items-center justify-center mb-5
                                  group-hover:bg-[#00545F] transition-colors">
                    <Icon className="w-6 h-6 text-[#4ecdc4]" />
                  </div>
                  <h3 className="font-serif font-bold text-[#1F3F44] text-xl mb-2">{title}</h3>
                  <p className="text-[#64748b] text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROCESSO — alternating timeline ══ */}
      <section className="py-24 bg-[#1F3F44] relative overflow-hidden">
        {/* vertical stripes bg */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 80px)' }} />

        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-[#4ecdc4] text-sm font-semibold uppercase tracking-widest mb-3">Como trabalhamos</p>
            <h2 className="font-serif font-bold text-white" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)' }}>
              Do terreno às chaves — com rigor
            </h2>
          </div>

          <div ref={processoRef} className="relative">
            {/* animated vertical line */}
            <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-white/10 lg:-translate-x-px" />
            <div className="absolute left-6 lg:left-1/2 top-0 w-px bg-[#4ecdc4] lg:-translate-x-px origin-top"
              style={{
                height: '100%',
                transform: `${processoVis ? 'scaleY(1)' : 'scaleY(0)'} translateX(-50%)`,
                transition: 'transform 2s ease',
                transformOrigin: 'top center',
              }} />

            <div className="space-y-14">
              {PROCESSO.map(({ step, title, desc }, i) => {
                const isRight = i % 2 !== 0
                return (
                  <div key={step}
                    className="relative flex items-start gap-10 lg:gap-0"
                    style={{
                      opacity: processoVis ? 1 : 0,
                      transform: processoVis
                        ? 'translateX(0)'
                        : isRight ? 'translateX(40px)' : 'translateX(-40px)',
                      transition: `opacity .7s ease ${i * 200}ms, transform .7s ease ${i * 200}ms`,
                    }}>
                    {/* dot */}
                    <div className="absolute left-6 lg:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#4ecdc4] border-4 border-[#1F3F44] z-10 mt-2 flex-shrink-0" />

                    {/* content — mobile: always right of line; desktop: alternating */}
                    <div className={`flex-1 pl-14 lg:pl-0 ${isRight ? 'lg:pl-16' : 'lg:pr-16 lg:text-right'}`}>
                      <p className="font-serif font-black text-[#4ecdc4]/25 text-5xl leading-none mb-1">{step}</p>
                      <h3 className="font-serif font-bold text-white text-2xl mb-2">{title}</h3>
                      <p className="text-white/55 leading-relaxed text-sm">{desc}</p>
                    </div>
                    {/* spacer for alternating */}
                    <div className="hidden lg:block flex-1" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══ EQUIPA ══ */}
      {equipa.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-[#00545F] text-sm font-semibold uppercase tracking-widest mb-3">Equipa</p>
              <h2 className="font-serif font-bold text-[#1F3F44]" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)' }}>
                As pessoas por trás dos projetos
              </h2>
            </div>
            <div ref={equipaRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {equipa.map((membro, i) => (
                <div key={membro.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-[#e5e7eb] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  style={{
                    opacity: equipaVis ? 1 : 0,
                    transform: equipaVis ? 'translateY(0)' : 'translateY(32px)',
                    transition: `opacity .6s ease ${i * 80}ms, transform .6s ease ${i * 80}ms, box-shadow .3s, translate .3s`,
                  }}>
                  <div className="aspect-[3/4] bg-[#1F3F44] relative overflow-hidden">
                    {membro.foto
                      ? <img src={membro.foto} alt={membro.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-serif font-black text-white/15 select-none" style={{ fontSize: '5rem' }}>
                            {membro.nome.charAt(0)}
                          </span>
                        </div>
                      )}
                    {/* bio overlay */}
                    {membro.bio && (
                      <div className="absolute inset-0 bg-[#00545F]/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 pointer-events-none">
                        <p className="text-white/90 text-sm leading-relaxed">{membro.bio}</p>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif font-bold text-[#1F3F44] text-lg">{membro.nome}</h3>
                    <p className="text-[#00545F] text-sm font-semibold">{membro.cargo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ AMI BAND ══ */}
      <section className="py-10 bg-[#f7f8f9] border-y border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#1F3F44] flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-[#4ecdc4]" />
              </div>
              <div>
                <p className="font-semibold text-[#1F3F44] text-sm">Empresa certificada e licenciada</p>
                <p className="text-[#64748b] text-sm">
                  Licença IMI n.º <strong className="text-[#1F3F44]">{amiNumero}</strong>
                </p>
              </div>
            </div>
            <p className="text-[#94a3b8] text-sm text-center sm:text-right max-w-sm">
              Pleno cumprimento da regulamentação nacional de construção e urbanismo.
            </p>
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section className="py-28 bg-[#1F3F44] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #4ecdc4 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* large faded word */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
          <span className="font-serif font-black text-[18vw] text-white/[0.025] whitespace-nowrap">CASA</span>
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif font-bold text-white leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
            Pronto para encontrar<br />o seu novo lar?
          </h2>
          <p className="text-white/55 text-lg mb-10">
            Explore os nossos projetos ou fale diretamente com a nossa equipa.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/projetos"
              className="w-full sm:w-auto px-10 py-4 rounded-xl bg-[#4ecdc4] text-[#1F3F44] font-bold text-sm tracking-wide hover:bg-white transition-colors shadow-lg">
              Ver Projetos
            </Link>
            <Link href="/contacto"
              className="w-full sm:w-auto px-10 py-4 rounded-xl border border-white/25 text-white font-semibold text-sm tracking-wide hover:bg-white/10 transition-colors">
              Falar Connosco
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
