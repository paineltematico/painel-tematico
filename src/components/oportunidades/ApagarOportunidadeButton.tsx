'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2, X } from 'lucide-react'

export default function ApagarOportunidadeButton({ oportunidadeId }: { oportunidadeId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const apagar = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/oportunidades/${oportunidadeId}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin/oportunidades')
      router.refresh()
    } else {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" /> Apagar
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !loading && setOpen(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-serif font-bold text-[#1F3F44] text-lg">Apagar oportunidade?</h3>
              <button onClick={() => !loading && setOpen(false)} className="text-[#94a3b8] hover:text-[#64748b]"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-[#64748b] mb-5">Esta ação é permanente. Documentos e histórico serão perdidos. O evento no Google Calendar também será removido.</p>
            <div className="flex gap-2">
              <button onClick={() => setOpen(false)} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-[#64748b] text-sm font-semibold hover:bg-[#f8fafc] transition-colors">Cancelar</button>
              <button onClick={apagar} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
