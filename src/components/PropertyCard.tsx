import Link from 'next/link'
import { MapPin, Bed, Bath, Car, Maximize2 } from 'lucide-react'
import { cn, formatPrice, formatArea } from '@/lib/utils'
import type { Imovel } from '@/types/database'

interface Props {
  imovel: Imovel
  featured?: boolean
}

// Placeholder gradient covers when no photo is available
const GRADIENTS = [
  'from-slate-700 to-slate-900',
  'from-slate-800 to-navy',
  'from-zinc-700 to-zinc-900',
]

export default function PropertyCard({ imovel, featured = false }: Props) {
  const hasPhoto = imovel.fotos && imovel.fotos.length > 0

  return (
    <Link
      href={`/imoveis/${imovel.slug}`}
      className={cn(
        'group block bg-white rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-sm',
        'hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
        featured && 'shadow-md'
      )}
    >
      {/* Image */}
      <div className={cn('relative overflow-hidden', featured ? 'h-56' : 'h-48')}>
        {hasPhoto ? (
          <img
            src={imovel.fotos[0]}
            alt={imovel.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={cn('w-full h-full bg-gradient-to-br', GRADIENTS[0], 'flex items-center justify-center')}>
            <span className="text-white/20 text-6xl font-serif font-bold select-none">PT</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={cn(
              'text-xs font-bold px-2.5 py-1 rounded-full',
              imovel.tipo === 'Venda'
                ? 'bg-[#1F3F44] text-white'
                : 'bg-[#00545F] text-white'
            )}
          >
            {imovel.tipo}
          </span>
          {imovel.tipologia && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 text-[#1F3F44]">
              {imovel.tipologia}
            </span>
          )}
        </div>

        {featured && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#00545F] text-white">
              Destaque
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Location */}
        {imovel.cidade && (
          <div className="flex items-center gap-1 text-[#64748b] text-xs mb-2">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>{imovel.localizacao ? `${imovel.localizacao}, ` : ''}{imovel.cidade}</span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-serif font-semibold text-[#1F3F44] text-base leading-snug mb-3 line-clamp-2 group-hover:text-[#00545F] transition-colors">
          {imovel.titulo}
        </h3>

        {/* Features */}
        <div className="flex items-center gap-4 text-[#64748b] text-xs mb-4">
          {imovel.quartos !== null && imovel.quartos !== undefined && (
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" /> {imovel.quartos} quartos
            </span>
          )}
          {imovel.casas_banho !== null && imovel.casas_banho !== undefined && (
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" /> {imovel.casas_banho} WC
            </span>
          )}
          {imovel.area_m2 && (
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" /> {formatArea(imovel.area_m2)}
            </span>
          )}
          {imovel.garagem && (
            <span className="flex items-center gap-1">
              <Car className="w-3.5 h-3.5" /> Garagem
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#e2e8f0] pt-4">
          {imovel.preco ? (
            <p className="text-[#00545F] font-bold text-lg font-serif">
              {formatPrice(imovel.preco, imovel.tipo)}
            </p>
          ) : (
            <p className="text-[#94a3b8] text-sm">Preço sob consulta</p>
          )}
        </div>
      </div>
    </Link>
  )
}
