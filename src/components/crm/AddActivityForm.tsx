'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ATIVIDADE_TIPOS } from '@/lib/crm'
import { Loader2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AtividadeTipo } from '@/types/database'

interface Props { leadId: string }

const QUICK_TYPES = ATIVIDADE_TIPOS.filter(
  t => t.value !== 'mudanca_estado' && t.value !== 'arquivamento' && t.value !== 'transferencia'
)

export default function AddActivityForm({ leadId }: Props) {
  const [tipo, setTipo] = useState<AtividadeTipo>('nota')
  const [conteudo, setConteudo] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [erro, setErro] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!conteudo.trim()) return
    setLoading(true)
    setErro('')

    const res = await fetch(`/api/admin/leads/${leadId}/atividade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, conteudo }),
    })

    if (res.ok) {
      setConteudo('')
      router.refresh()
    } else {
      const d = await res.json().catch(() => ({}))
      setErro(d.error ?? 'Erro ao registar atividade.')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {/* Type selector */}
      <div className="flex gap-2 flex-wrap">
        {QUICK_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTipo(t.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all',
              tipo === t.value
                ? 'bg-[#1F3F44] text-white border-[#1F3F44]'
                : 'border-[#e2e8f0] text-[#475569] hover:border-[#94a3b8]'
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Text area */}
      <div className="relative">
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          rows={3}
          placeholder={
            tipo === 'nota' ? 'Adicione uma nota...' :
            tipo === 'chamada' ? 'Resumo da chamada...' :
            tipo === 'email' ? 'O que foi enviado/discutido...' :
            tipo === 'reuniao' ? 'O que foi discutido na reunião...' :
            'Notas sobre a visita...'
          }
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(e as unknown as React.FormEvent)
          }}
        />
        <p className="absolute bottom-2.5 right-3 text-xs text-[#94a3b8] pointer-events-none">⌘↵</p>
      </div>

      {erro && <p className="text-red-500 text-xs">{erro}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !conteudo.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00545F] text-white text-sm font-semibold hover:bg-[#006B78] transition-colors disabled:opacity-50 shadow-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Registar
        </button>
      </div>
    </form>
  )
}
