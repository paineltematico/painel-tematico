import Link from 'next/link'
import { MapPin, CheckCircle, Clock } from 'lucide-react'
import type { Projeto } from '@/types/database'

const ESTADO_LABEL: Record<string, string> = {
  em_curso:    'Em Curso',
  concluido:   'Concluído',
  brevemente:  'Brevemente',
}

export default function ProjetoCard({ projeto }: { projeto: Projeto }) {
  const hasBg = Boolean(projeto.imagem)

  return (
    <Link
      href={`/projetos/${projeto.slug}`}
      className="group relative flex-shrink-0 w-72 sm:w-80 rounded-2xl overflow-hidden flex flex-col bg-[#1F3F44] cursor-pointer"
      style={{ minHeight: 460 }}
    >
      {/* Background image */}
      {hasBg ? (
        <img
          src={projeto.imagem!}
          alt={projeto.nome}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #00545F 0%, #1F3F44 100%)',
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Top: estado badge */}
        <div className="flex-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6BBFC9]" />
            Empreendimento
          </span>
        </div>

        {/* Bottom: title + info + CTA */}
        <div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight mb-1 group-hover:text-[#6BBFC9] transition-colors">
            {projeto.nome}
          </h3>
          {projeto.subtitulo && (
            <p className="text-white/70 text-sm mb-4">{projeto.subtitulo}</p>
          )}

          {/* Location */}
          {projeto.localizacao && (
            <div className="flex items-center gap-1.5 text-white/60 text-xs mb-3">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{projeto.cidade && `${projeto.cidade} › `}{projeto.localizacao}</span>
            </div>
          )}

          {/* Units */}
          <div className="flex items-center gap-1.5 text-white/70 text-sm mb-5">
            {projeto.estado === 'brevemente' ? (
              <><Clock className="w-4 h-4 text-amber-400" /> Em breve</>
            ) : projeto.unidades_disponiveis !== null ? (
              <><CheckCircle className="w-4 h-4 text-emerald-400" /> {projeto.unidades_disponiveis} disponíveis</>
            ) : null}
          </div>

          {/* CTA */}
          <div className="w-full py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold text-center group-hover:bg-white/20 transition-colors">
            Ver imóveis
          </div>
        </div>
      </div>
    </Link>
  )
}
