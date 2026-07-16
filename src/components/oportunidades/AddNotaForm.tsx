'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OportunidadeAtividadeTipo } from '@/types/database'

interface Props { oportunidadeId: string }

const TIPOS: { value: OportunidadeAtividadeTipo; label: string; icon: string }[] = [
  { value: 'nota',    label: 'Nota',    icon: '📝' },
  { value: 'chamada', label: 'Chamada', icon: '📞' },
  { value: 'email',   label: 'Email',   icon: '✉️' },
]

export default function AddNotaForm({ oportunidadeId }: Props) {
  const [tipo, setTipo] = useState<OportunidadeAtividadeTipo>('nota')
  const [conteudo, setConteudo] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!conteudo.trim()) return
    setLoading(true)
    setErro('')
    const res = await fetch(`/api/admin/oportunidades/${oportunidadeId}/atividade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, conteudo }),
    })
    if (res.ok) {
      setConteudo('')
      router.refresh()
    } else {
      const d = await res.json().catch(() => ({}))
      setErro(d.error ?? 'Erro ao registar.')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {TIPOS.map((t) => (
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
      <div className="relative">
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          rows={3}
          placeholder={tipo === 'chamada' ? 'Resumo da chamada...' : tipo === 'email' ? 'O que foi enviado/discutido...' : 'Adicione uma nota...'}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all resize-none"
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(e as unknown as React.FormEvent) }}
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
