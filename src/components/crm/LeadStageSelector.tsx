'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ESTADOS } from '@/lib/crm'
import { cn } from '@/lib/utils'
import type { LeadEstado } from '@/types/database'

interface Props { leadId: string; current: LeadEstado }

export default function LeadStageSelector({ leadId, current }: Props) {
  const [active, setActive] = useState<LeadEstado>(current)
  const [loading, setLoading] = useState<LeadEstado | null>(null)
  const router = useRouter()

  const change = async (novo: LeadEstado) => {
    if (novo === active) return
    setLoading(novo)
    const anterior = active
    setActive(novo)

    // Atualiza o estado e regista a atividade server-side
    const res = await fetch(`/api/admin/leads/${leadId}/estado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: novo, estado_anterior: anterior }),
    })
    if (!res.ok) setActive(anterior)

    setLoading(null)
    router.refresh()
  }

  return (
    <div className="space-y-2">
      {ESTADOS.map((e) => (
        <button
          key={e.value}
          onClick={() => change(e.value)}
          disabled={loading !== null}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all',
            active === e.value
              ? `${e.bg} border-current ${e.color} shadow-sm`
              : 'border-[#e2e8f0] text-[#64748b] hover:border-[#94a3b8]',
            loading === e.value && 'opacity-70'
          )}
        >
          <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', e.dot)} />
          <span className="text-sm font-medium flex-1">{e.label}</span>
          {active === e.value && (
            <span className="text-xs font-bold">✓</span>
          )}
        </button>
      ))}
    </div>
  )
}
