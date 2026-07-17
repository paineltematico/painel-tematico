'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRightLeft, X, Loader2, ChevronDown } from 'lucide-react'

interface BasicUser { id: string; nome: string }

interface Props {
  leadId: string
  responsavelId: string | null
  users: BasicUser[]
}

export default function LeadTransferirButton({ leadId, responsavelId, users }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [destino, setDestino] = useState('')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const submit = async () => {
    if (!destino) { setErro('Selecione um comercial'); return }
    setLoading(true); setErro('')
    const res = await fetch(`/api/admin/leads/${leadId}/transferir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responsavel_id: destino, motivo: motivo.trim() || undefined }),
    })
    if (res.ok) {
      setOpen(false)
      setDestino(''); setMotivo('')
      router.refresh()
    } else {
      const d = await res.json().catch(() => ({}))
      setErro(d.error ?? 'Erro ao transferir.')
    }
    setLoading(false)
  }

  const outros = users.filter(u => u.id !== responsavelId)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 sm:px-4 rounded-xl border border-[#e2e8f0] text-[#475569] text-sm font-semibold hover:bg-[#f8fafc] transition-colors flex items-center gap-2"
        title="Transferir"
      >
        <ArrowRightLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Transferir</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F3F44] text-base">Transferir lead</h3>
                  <p className="text-xs text-[#94a3b8]">Atribuir a outro comercial</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#1F3F44]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
                  Para quem transferir <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={destino}
                    onChange={e => { setDestino(e.target.value); setErro('') }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] appearance-none bg-white"
                  >
                    <option value="">Selecionar comercial...</option>
                    {outros.map(u => (
                      <option key={u.id} value={u.id}>{u.nome}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Motivo (opcional)</label>
                <textarea
                  rows={2}
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  placeholder="Ex: melhor conhecimento da zona, pedido do cliente..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] resize-none"
                />
              </div>
              {erro && <p className="text-red-500 text-xs">{erro}</p>}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-[#475569] text-sm font-semibold hover:bg-[#f8fafc]">
                Cancelar
              </button>
              <button
                onClick={submit}
                disabled={loading || !destino}
                className="flex-1 py-2.5 rounded-xl bg-[#1F3F44] text-white text-sm font-semibold hover:bg-[#1e293b] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
                Transferir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
