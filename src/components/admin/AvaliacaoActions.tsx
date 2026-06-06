'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Mail, Loader2 } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'novo',       label: 'Novo' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'concluido',  label: 'Concluído' },
]

interface Props {
  id: string
  status: string
  email: string
  nome: string
  tipo: string | null
  cidade: string | null
  avaliacaoId: string
}

export default function AvaliacaoActions({ id, status, email, nome, tipo, cidade, avaliacaoId }: Props) {
  const router = useRouter()
  const [sending, setSending] = useState<string | null>(null)

  const updateStatus = async (newStatus: string) => {
    await fetch(`/api/admin/avaliacoes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    router.refresh()
  }

  const sendFollowUp = async (emailType: 'followup1' | 'followup2') => {
    setSending(emailType)
    await fetch(`/api/admin/avaliacoes/${id}/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailType, email, nome, tipo, cidade, avaliacaoId }),
    })
    setSending(null)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
      {/* Status dropdown */}
      <div className="relative">
        <select
          value={status}
          onChange={e => updateStatus(e.target.value)}
          className="pl-3 pr-7 py-1.5 rounded-xl border border-[#e2e8f0] text-xs font-semibold text-[#475569] bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 cursor-pointer"
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94a3b8] pointer-events-none" />
      </div>

      {/* Send follow-up email 2 */}
      <button
        onClick={() => sendFollowUp('followup1')}
        disabled={!!sending}
        title="Enviar pedido de fotografias"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e2e8f0] text-xs font-semibold text-[#475569] hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-colors disabled:opacity-50"
      >
        {sending === 'followup1' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
        📸 Pedir fotos
      </button>

      {/* Send follow-up email 3 */}
      <button
        onClick={() => sendFollowUp('followup2')}
        disabled={!!sending}
        title="Enviar 'estudo quase pronto'"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e2e8f0] text-xs font-semibold text-[#475569] hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 transition-colors disabled:opacity-50"
      >
        {sending === 'followup2' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
        ✅ Estudo pronto
      </button>
    </div>
  )
}
