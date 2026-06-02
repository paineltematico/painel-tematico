import Link from 'next/link'
import type { Artigo } from '@/types/database'

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ArtigoCard({ artigo }: { artigo: Artigo }) {
  return (
    <Link href={`/blog/${artigo.slug}`} className="group flex flex-col">
      {/* Image */}
      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#F2EEEE] mb-4">
        {artigo.imagem ? (
          <img
            src={artigo.imagem}
            alt={artigo.titulo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E8E3E3] to-[#F2EEEE]">
            <span className="text-[#00545F]/30 text-4xl font-serif font-bold">PT</span>
          </div>
        )}
      </div>

      {/* Category */}
      {artigo.categoria && (
        <span className="text-xs font-semibold text-[#00545F] uppercase tracking-widest mb-2">
          {artigo.categoria}
        </span>
      )}

      {/* Title */}
      <h3 className="font-serif font-semibold text-[#1F3F44] text-base sm:text-lg leading-snug mb-2 group-hover:text-[#00545F] transition-colors line-clamp-3">
        {artigo.titulo}
      </h3>

      {/* Date */}
      <p className="text-[#94a3b8] text-sm mt-auto">
        {formatDate(artigo.publicado_em ?? artigo.created_at)}
      </p>
    </Link>
  )
}
