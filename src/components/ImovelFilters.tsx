'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { X, Search, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const TIPOLOGIAS = ['T0', 'T1', 'T2', 'T3', 'T4', 'T4+']
const PRICE_RANGES = [
  { label: 'Até 100.000€', min: '', max: '100000' },
  { label: '100k – 250k', min: '100000', max: '250000' },
  { label: '250k – 500k', min: '250000', max: '500000' },
  { label: '500k – 1M', min: '500000', max: '1000000' },
  { label: 'Mais de 1M', min: '1000000', max: '' },
]

interface Props {
  currentFilters: {
    q?: string
    tipo?: string
    tipologia?: string
    min?: string
    max?: string
  }
}

export default function ImovelFilters({ currentFilters }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false) // painel recolhido em mobile

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const clearAll = () => router.push(pathname)

  const hasFilters = currentFilters.tipo || currentFilters.tipologia || currentFilters.min || currentFilters.max || currentFilters.q
  const nFiltros = [currentFilters.tipo, currentFilters.tipologia, (currentFilters.min || currentFilters.max), currentFilters.q].filter(Boolean).length

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] lg:sticky lg:top-24">
      {/* Barra de topo — em mobile funciona como toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 sm:p-5 lg:cursor-default"
      >
        <span className="flex items-center gap-2 font-semibold text-[#1F3F44] text-sm">
          <SlidersHorizontal className="w-4 h-4" /> Filtros
          {nFiltros > 0 && <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#00545F] text-white text-[11px] font-bold">{nFiltros}</span>}
        </span>
        <span className="flex items-center gap-3">
          {hasFilters && (
            <span
              onClick={(e) => { e.stopPropagation(); clearAll() }}
              className="flex items-center gap-1 text-xs text-[#94a3b8] hover:text-[#1F3F44] transition-colors"
            >
              <X className="w-3 h-3" /> Limpar
            </span>
          )}
          <ChevronDown className={cn('w-4 h-4 text-[#94a3b8] transition-transform lg:hidden', open && 'rotate-180')} />
        </span>
      </button>

      <div className={cn('px-4 sm:px-5 pb-5 space-y-6', open ? 'block' : 'hidden lg:block')}>
      {/* Pesquisa */}
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none" />
          <input
            type="search"
            defaultValue={currentFilters.q}
            onChange={(e) => {
              const v = e.target.value
              clearTimeout((window as unknown as { __imf?: number }).__imf)
              ;(window as unknown as { __imf?: number }).__imf = window.setTimeout(() => updateFilter('q', v), 400)
            }}
            placeholder="Cidade, zona, título…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e2e8f0] text-sm text-[#1F3F44] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#00545F]/20 focus:border-[#00545F] transition-all"
          />
        </div>
      </div>

      {/* Tipo */}
      <div>
        <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3">Negócio</p>
        <div className="grid grid-cols-3 gap-2">
          {['', 'Venda', 'Arrendamento'].map((t) => (
            <button
              key={t}
              onClick={() => updateFilter('tipo', t)}
              className={cn(
                'py-2 px-3 rounded-lg text-xs font-medium border transition-all',
                currentFilters.tipo === t || (!currentFilters.tipo && t === '')
                  ? 'bg-[#1F3F44] text-white border-[#1F3F44]'
                  : 'border-[#e2e8f0] text-[#475569] hover:border-[#1F3F44] hover:text-[#1F3F44]'
              )}
            >
              {t || 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* Tipologia */}
      <div>
        <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3">Tipologia</p>
        <div className="grid grid-cols-3 gap-2">
          {TIPOLOGIAS.map((t) => (
            <button
              key={t}
              onClick={() => updateFilter('tipologia', currentFilters.tipologia === t ? '' : t)}
              className={cn(
                'py-2 rounded-lg text-xs font-medium border transition-all',
                currentFilters.tipologia === t
                  ? 'bg-[#00545F] text-white border-[#00545F]'
                  : 'border-[#e2e8f0] text-[#475569] hover:border-[#00545F] hover:text-[#00545F]'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Preço */}
      <div>
        <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3">Preço</p>
        <div className="space-y-2">
          {PRICE_RANGES.map((r) => {
            const active = currentFilters.min === r.min && currentFilters.max === r.max
            return (
              <button
                key={r.label}
                onClick={() => {
                  if (active) {
                    updateFilter('min', '')
                    updateFilter('max', '')
                  } else {
                    const params = new URLSearchParams(searchParams.toString())
                    if (r.min) params.set('min', r.min); else params.delete('min')
                    if (r.max) params.set('max', r.max); else params.delete('max')
                    router.push(`${pathname}?${params.toString()}`)
                  }
                }}
                className={cn(
                  'w-full text-left py-2 px-3 rounded-lg text-xs border transition-all',
                  active
                    ? 'bg-[#00545F]/10 border-[#00545F] text-[#00545F] font-semibold'
                    : 'border-[#e2e8f0] text-[#475569] hover:border-[#00545F]/50'
                )}
              >
                {r.label}
              </button>
            )
          })}
        </div>
      </div>
      </div>
    </div>
  )
}
