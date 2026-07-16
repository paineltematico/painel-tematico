'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ESTADOS } from '@/lib/oportunidades'
import { cn } from '@/lib/utils'
import type { OportunidadeEstado } from '@/types/database'

interface Props { oportunidadeId: string; current: OportunidadeEstado }

// A conversão é feita pelos botões dedicados — aqui só permitimos os estados de trabalho.
const SELECIONAVEIS = ESTADOS.filter((e) => e.value !== 'convertida')

export default function OportunidadeEstadoSelector({ oportunidadeId, current }: Props) {
  const [active, setActive] = useState<OportunidadeEstado>(current)
  const [loading, setLoading] = useState<OportunidadeEstado | null>(null)
  const router = useRouter()

  const change = async (novo: OportunidadeEstado) => {
    if (novo === active) return
    setLoading(novo)
    const anterior = active
    setActive(novo)
    const res = await fetch(`/api/admin/oportunidades/${oportunidadeId}/estado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: novo, estado_anterior: anterior }),
    })
    if (!res.ok) setActive(anterior)
    setLoading(null)
    router.refresh()
  }

  const jaConvertida = current === 'convertida'

  return (
    <div className="space-y-2">
      {jaConvertida && (
        <div className="mb-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          ✓ Convertida — estado bloqueado
        </div>
      )}
      {SELECIONAVEIS.map((e) => (
        <button
          key={e.value}
          onClick={() => change(e.value)}
          disabled={loading !== null || jaConvertida}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all',
            active === e.value
              ? `${e.bg} border-current ${e.color} shadow-sm`
              : 'border-[#e2e8f0] text-[#64748b] hover:border-[#94a3b8]',
            (loading === e.value || jaConvertida) && 'opacity-70',
            jaConvertida && 'cursor-not-allowed'
          )}
        >
          <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', e.dot)} />
          <span className="text-sm font-medium flex-1">{e.label}</span>
          {active === e.value && <span className="text-xs font-bold">✓</span>}
        </button>
      ))}
    </div>
  )
}
