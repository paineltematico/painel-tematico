'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PRIORIDADES } from '@/lib/crm'
import { cn } from '@/lib/utils'
import type { LeadPrioridade } from '@/types/database'

interface Props { leadId: string; current: LeadPrioridade }

export default function LeadPrioritySelector({ leadId, current }: Props) {
  const [active, setActive] = useState<LeadPrioridade>(current)
  const router = useRouter()

  const change = async (p: LeadPrioridade) => {
    if (p === active) return
    setActive(p)
    await supabase.from('contactos_imoveis').update({ prioridade: p }).eq('id', leadId)
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      {PRIORIDADES.map((p) => (
        <button
          key={p.value}
          onClick={() => change(p.value)}
          className={cn(
            'flex-1 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all text-center',
            active === p.value ? `${p.color} border-current shadow-sm` : 'border-[#e2e8f0] text-[#64748b] hover:border-[#94a3b8]'
          )}
        >
          {p.emoji} {p.label}
        </button>
      ))}
    </div>
  )
}
