'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, Trash2, RotateCcw, Loader2, X, AlertTriangle } from 'lucide-react'

interface Props {
  leadId: string
  arquivado: boolean
  isSuperAdmin: boolean
}

export default function LeadArchivarButton({ leadId, arquivado, isSuperAdmin }: Props) {
  const router = useRouter()
  const [modal, setModal] = useState<'arquivar' | 'restaurar' | 'destruir' | null>(null)
  const [motivo, setMotivo] = useState('')
  const [confirm2, setConfirm2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const closeModal = () => {
    setModal(null)
    setMotivo('')
    setConfirm2(false)
    setErro('')
  }

  const arquivar = async () => {
    if (!motivo.trim()) { setErro('Indica o motivo do arquivo.'); return }
    setLoading(true)
    const res = await fetch(`/api/admin/leads/${leadId}/arquivar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo }),
    })
    if (res.ok) {
      closeModal()
      router.push('/admin/leads')
      router.refresh()
    } else {
      const d = await res.json()
      setErro(d.error ?? 'Erro ao arquivar')
      setLoading(false)
    }
  }

  const restaurar = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/leads/${leadId}/restaurar`, { method: 'POST' })
    if (res.ok) {
      closeModal()
      router.refresh()
    } else {
      const d = await res.json()
      setErro(d.error ?? 'Erro ao restaurar')
      setLoading(false)
    }
  }

  const destruir = async () => {
    if (!confirm2) { setConfirm2(true); return }
    setLoading(true)
    const res = await fetch(`/api/admin/leads/${leadId}/destruir`, { method: 'DELETE' })
    if (res.ok) {
      closeModal()
      router.push('/admin/leads')
      router.refresh()
    } else {
      const d = await res.json()
      setErro(d.error ?? 'Erro ao destruir')
      setLoading(false)
    }
  }

  return (
    <>
      {/* Botões */}
      <div className="flex gap-2 flex-shrink-0">
        {arquivado ? (
          isSuperAdmin && (
            <>
              <button
                onClick={() => setModal('restaurar')}
                className="p-2 sm:px-4 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2"
                title="Restaurar"
              >
                <RotateCcw className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Restaurar</span>
              </button>
              <button
                onClick={() => setModal('destruir')}
                className="p-2 sm:px-4 rounded-xl border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-50 transition-colors flex items-center gap-2"
                title="Destruir"
              >
                <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Destruir</span>
              </button>
            </>
          )
        ) : (
          <button
            onClick={() => setModal('arquivar')}
            className="p-2 sm:px-4 rounded-xl border border-[#e2e8f0] text-[#64748b] text-sm font-semibold hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors flex items-center gap-2"
            title="Arquivar"
          >
            <Archive className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Arquivar</span>
          </button>
        )}
      </div>

      {/* Modal Arquivar */}
      {modal === 'arquivar' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Archive className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F3F44] text-base">Arquivar Lead</h3>
                  <p className="text-xs text-[#94a3b8]">O lead deixa de aparecer para a equipa</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#1F3F44] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
                Motivo do arquivo *
              </label>
              <textarea
                autoFocus
                rows={3}
                value={motivo}
                onChange={e => { setMotivo(e.target.value); setErro('') }}
                placeholder="Ex: Cliente não respondeu após 3 tentativas de contacto..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] resize-none transition-all"
              />
              {erro && <p className="text-red-500 text-xs mt-1.5">{erro}</p>}
            </div>

            <p className="text-xs text-[#94a3b8] mb-5 bg-[#f8fafc] rounded-lg p-3 border border-[#e2e8f0]">
              O motivo fica registado no histórico e é visível apenas para o Super Admin.
            </p>

            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-[#475569] text-sm font-semibold hover:bg-[#f8fafc] transition-colors">
                Cancelar
              </button>
              <button
                onClick={arquivar}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                Arquivar lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Restaurar */}
      {modal === 'restaurar' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F3F44] text-base">Restaurar Lead</h3>
                  <p className="text-xs text-[#94a3b8]">Voltará a aparecer para toda a equipa</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#1F3F44] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {erro && <p className="text-red-500 text-xs mb-4">{erro}</p>}
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-[#475569] text-sm font-semibold hover:bg-[#f8fafc] transition-colors">
                Cancelar
              </button>
              <button
                onClick={restaurar}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                Restaurar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Destruir */}
      {modal === 'destruir' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F3F44] text-base">Destruir Permanentemente</h3>
                  <p className="text-xs text-red-500">Esta ação é irreversível</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#1F3F44] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!confirm2 ? (
              <p className="text-sm text-[#475569] mb-5">
                O lead e todo o seu histórico serão <strong className="text-red-600">apagados permanentemente</strong> da base de dados. Não há forma de recuperar.
              </p>
            ) : (
              <p className="text-sm font-semibold text-red-600 mb-5 bg-red-50 rounded-xl p-3 border border-red-200">
                ⚠️ Tens a certeza absoluta? Clica novamente para confirmar a destruição permanente.
              </p>
            )}

            {erro && <p className="text-red-500 text-xs mb-4">{erro}</p>}

            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-[#475569] text-sm font-semibold hover:bg-[#f8fafc] transition-colors">
                Cancelar
              </button>
              <button
                onClick={destruir}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {confirm2 ? 'Confirmar destruição' : 'Destruir lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
