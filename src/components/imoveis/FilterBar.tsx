'use client'

import { useCallback, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const TIPOLOGIAS = ['T0', 'T1', 'T2', 'T3', 'T4', 'T4+']
const PRECOS = [
  { label: '< 100k', min: '', max: '100000' },
  { label: '100–250k', min: '100000', max: '250000' },
  { label: '250–500k', min: '250000', max: '500000' },
  { label: '500k–1M', min: '500000', max: '1000000' },
  { label: '> 1M', min: '1000000', max: '' },
]

interface Filters {
  q?: string
  tipo?: string
  tipologia?: string
  min?: string
  max?: string
}

/**
 * Barra de filtros horizontal e pegajosa (sticky) — pesquisa + chips de
 * negócio/tipologia/preço numa só linha, deslizável no mobile. Mantém a
 * navegação por parâmetros de URL (?tipo=&tipologia=&min=&max=&q=).
 */
export default function FilterBar({ currentFilters }: { currentFilters: Filters }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(currentFilters.q ?? '')

  const push = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      mutate(params)
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  const setParam = (key: string, value: string) =>
    push((p) => (value ? p.set(key, value) : p.delete(key)))

  const hasFilters = Boolean(
    currentFilters.tipo || currentFilters.tipologia || currentFilters.min || currentFilters.max || currentFilters.q
  )

  const chip = (active: boolean) =>
    cn(
      'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap',
      active
        ? 'bg-[#1F3F44] text-white border-[#1F3F44] shadow-sm'
        : 'bg-white border-[#E4DFD6] text-[#5c6664] hover:border-[#1F3F44]/50 hover:text-[#1F3F44]'
    )

  return (
    <div className="sticky top-0 z-30 bg-[#FAF9F7]/90 backdrop-blur-md border-b border-[#ECE7DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          {/* Pesquisa */}
          <form
            className="relative shrink-0 w-40 sm:w-56"
            onSubmit={(e) => {
              e.preventDefault()
              setParam('q', q.trim())
            }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a39b8d] pointer-events-none" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cidade, zona…"
              className="w-full pl-8.5 pr-3 py-1.5 rounded-full bg-white border border-[#E4DFD6] text-xs text-[#1F3F44] placeholder-[#a39b8d] focus:outline-none focus:ring-2 focus:ring-[#00545F]/25 focus:border-[#00545F] transition-all"
            />
          </form>

          {/* Chips — deslizável no mobile */}
          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5">
            {['Venda', 'Arrendamento'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setParam('tipo', currentFilters.tipo === t ? '' : t)}
                className={chip(currentFilters.tipo === t)}
              >
                {t}
              </button>
            ))}

            <span className="shrink-0 w-px h-5 bg-[#E4DFD6]" aria-hidden="true" />

            {TIPOLOGIAS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setParam('tipologia', currentFilters.tipologia === t ? '' : t)}
                className={chip(currentFilters.tipologia === t)}
              >
                {t}
              </button>
            ))}

            <span className="shrink-0 w-px h-5 bg-[#E4DFD6]" aria-hidden="true" />

            {PRECOS.map((r) => {
              const active =
                (currentFilters.min ?? '') === r.min && (currentFilters.max ?? '') === r.max && (r.min !== '' || r.max !== '')
              return (
                <button
                  key={r.label}
                  type="button"
                  onClick={() =>
                    push((p) => {
                      if (active) {
                        p.delete('min')
                        p.delete('max')
                      } else {
                        if (r.min) p.set('min', r.min)
                        else p.delete('min')
                        if (r.max) p.set('max', r.max)
                        else p.delete('max')
                      }
                    })
                  }
                  className={chip(active)}
                >
                  {r.label}
                </button>
              )
            })}

            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setQ('')
                  router.push(pathname, { scroll: false })
                }}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#8a8377] hover:text-[#1F3F44] transition-colors"
              >
                <X className="w-3 h-3" /> Limpar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
