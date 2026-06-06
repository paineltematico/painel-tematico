'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, RotateCcw, X, Loader2 } from 'lucide-react'

interface Props {
  imovelId: string
  perdida: boolean
  motivo?: string | null
}

export default function AngariracaoPerdidaButton({ imovelId, perdida, motivo }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(motivo ?? '')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const submit = async (marcarPerdida: boolean) => {
    setLoading(true)
    setErro('')
    const res = await fetch(`/api/admin/imoveis/${imovelId}/perdida`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perdida: marcarPerdida, motivo: text.trim() || null }),
    })
    if (res.ok) {
      setOpen(false)
      router.refresh()
    } else {
      const d = await res.json().catch(() => ({}))
      setErro(d.error ?? 'Erro ao atualizar.')
    }
    setLoading(false)
  }

  if (perdida) {
    return (
      <button
        onClick={() => submit(false)}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
        Recuperar angariação
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e2e8f0] text-[#64748b] text-sm font-semibold hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
      >
        <AlertTriangle className="w-3.5 h-3.5" /> Marcar angariação perdida
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F3F44] text-base">Angariação perdida</h3>
                  <p className="text-xs text-[#94a3b8]">O imóvel fica marcado como perdido nas estatísticas</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#1F3F44]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
                Motivo (opcional)
              </label>
              <textarea
                autoFocus
                rows={3}
                value={text}
                onChange={e => { setText(e.target.value); setErro('') }}
                placeholder="Ex: cliente optou por outra agência, preço fora do mercado..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-none transition-all"
              />
              {erro && <p className="text-red-500 text-xs mt-1.5">{erro}</p>}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-[#475569] text-sm font-semibold hover:bg-[#f8fafc] transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => submit(true)}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Confirmar perda
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
