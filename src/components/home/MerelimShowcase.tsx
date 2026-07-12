'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Home, Layers, Trees, MapPin } from 'lucide-react'
import Reveal from '@/components/motion/Reveal'
import TextReveal from '@/components/motion/TextReveal'
import Parallax from '@/components/motion/Parallax'
import Magnetic from '@/components/motion/Magnetic'

const interiores = [
  { src: '/images/merelim/sala-real-2.jpeg', label: 'Sala em open space' },
  { src: '/images/merelim/cozinha-real-1.jpeg', label: 'Cozinha equipada' },
  { src: '/images/merelim/quarto-real-3.jpeg', label: 'Suíte principal' },
]

const features = [
  { icon: Home, label: 'Tipologia', value: 'Moradias T3' },
  { icon: Layers, label: 'Distribuição', value: '3 pisos' },
  { icon: Trees, label: 'Exterior', value: 'Jardim + garagem' },
]

/**
 * Vitrine imersiva do empreendimento Merelim S. Pedro — render em parallax,
 * grelha de interiores com reveal e mapa de implantação.
 */
export default function MerelimShowcase() {
  return (
    <section className="relative bg-[#1F3F44] text-white overflow-hidden py-24 sm:py-32">
      {/* Textura de fundo */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '38px 38px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <Reveal from="up" className="max-w-2xl mb-12">
          <p className="inline-flex items-center gap-2 text-[#6BBFC9] text-sm font-semibold uppercase tracking-widest mb-4">
            <MapPin className="w-4 h-4" /> Merelim S. Pedro · Braga
          </p>
          <TextReveal
            as="h2"
            text="Um empreendimento pensado ao pormenor"
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]"
          />
        </Reveal>

        {/* Render principal com parallax */}
        <Reveal from="up" className="relative rounded-3xl overflow-hidden mb-8 aspect-[16/9]">
          <Parallax amount={70} className="absolute inset-0 -top-10 -bottom-10">
            <Image
              src="/images/merelim/render-2.jpeg"
              alt="Render das moradias de Merelim S. Pedro"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover"
            />
          </Parallax>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F3F44]/70 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-6">
            {features.map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15">
                  <f.icon className="w-5 h-5 text-[#6BBFC9]" />
                </div>
                <div>
                  <p className="text-white font-semibold leading-tight">{f.value}</p>
                  <p className="text-white/60 text-xs">{f.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Grelha de interiores */}
        <Reveal stagger className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-16">
          {interiores.map((it) => (
            <div key={it.src} className="group relative rounded-2xl overflow-hidden aspect-[4/5]">
              <Image
                src={it.src}
                alt={it.label}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <p className="absolute bottom-4 left-5 text-white font-medium tracking-wide">
                {it.label}
              </p>
            </div>
          ))}
        </Reveal>

        {/* Mapa de implantação + CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <Reveal from="left" className="relative rounded-2xl overflow-hidden aspect-[16/10] border border-white/10">
            <Image
              src="/images/merelim/mapa-1.jpeg"
              alt="Mapa de implantação de Merelim S. Pedro"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </Reveal>
          <Reveal from="right">
            <h3 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
              Localização com tudo por perto
            </h3>
            <p className="text-white/70 leading-relaxed mb-8 max-w-md">
              Escola primária, piscina municipal, campos de futebol e acessos à estrada
              nacional — a poucos minutos a pé. Um lugar tranquilo, com a comodidade da cidade
              ao virar da esquina.
            </p>
            <Magnetic>
              <Link
                href="/projetos"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#00545F] text-white font-semibold hover:bg-[#006B78] transition-colors shadow-lg"
              >
                Explorar o projeto <ArrowRight className="w-4 h-4" />
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
