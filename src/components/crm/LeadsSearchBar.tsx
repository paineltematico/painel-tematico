'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useCallback, useTransition } from 'react'

export default function LeadsSearchBar({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  const update = useCallback((q: string) => {
    const p = new URLSearchParams(params.toString())
    if (q) p.set('q', q)
    else p.delete('q')
    startTransition(() => router.replace(`${pathname}?${p.toString()}`))
  }, [router, pathname, params])

  return (
    <div className="relative flex-1 max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none" />
      <input
        type="search"
        defaultValue={defaultValue}
        onChange={e => update(e.target.value)}
        placeholder="Pesquisar por nome…"
        className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#1F3F44] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#00545F]/20 focus:border-[#00545F] transition-all"
      />
      {defaultValue && (
        <button
          onClick={() => {
            const input = document.querySelector<HTMLInputElement>('input[type="search"]')
            if (input) { input.value = ''; update('') }
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
