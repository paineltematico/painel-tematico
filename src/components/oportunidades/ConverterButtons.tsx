'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Home, Loader2, X } from 'lucide-react'

interface Props {
  oportunidadeId: string
  jaConvertida: boolean
  convertidoTipo: 'lead' | 'imovel' | null
  convertidoId: string | null
}

export default function ConverterButtons({ oportunidadeId, jaConvertida, convertidoTipo, convertidoId }: Props) {
  const [modal, setModal] = useState<'lead' | 'imovel' | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  const converter = async (destino: 'lead' | 'imovel') => {
    setLoading(true)
    setErro('')
    const res = await fetch(`/api/admin/oportunidades/${oportunidadeId}/converter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destino }),
    })
    const d = await res.json().catch(() => ({}))
    setLoading(false)
    if (res.ok && d.redirect) {
      router.push(d.redirect)
    } else {
      setErro(d.error ?? 'Erro ao converter.')
    }
  }

  if (jaConvertida) {
    const href = convertidoTipo === 'lead' ? `/admin/leads/${convertidoId}` : `/admin/imoveis/${convertidoId}`
    return (
      <a href={href} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition-colors">
        {convertidoTipo === 'lead' ? <UserPlus className="w-4 h-4" /> : <Home className="w-4 h-4" />}
        Ver {convertidoTipo === 'lead' ? 'Lead' : 'Imóvel'} criado
      </a>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setModal('lead')}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#00545F] text-white text-sm font-semibold hover:bg-[#006B78] transition-colors shadow-sm"
      >
        <UserPlus className="w-4 h-4" /> Converter em Lead
      </button>
      <button
        onClick={() => setModal('imovel')}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border-2 border-[#00545F] text-[#00545F] text-sm font-semibold hover:bg-[#00545F]/5 transition-colors"
      >
        <Home className="w-4 h-4" /> Converter em Imóvel
      </button>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !loading && setModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-serif font-bold text-[#1F3F44] text-lg">
                {modal === 'lead' ? 'Converter em Lead?' : 'Converter em Imóvel?'}
              </h3>
              <button onClick={() => !loading && setModal(null)} className="text-[#94a3b8] hover:text-[#64748b]"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-[#64748b] mb-5">
              {modal === 'lead'
                ? 'Cria um novo lead no CRM com os dados desta pessoa. A oportunidade fica marcada como convertida.'
                : 'Cria um rascunho de imóvel (não publicado) com a localização, preço e fotos. Podes editá-lo antes de publicar.'}
            </p>
            {erro && <p className="text-red-500 text-xs mb-3">{erro}</p>}
            <div className="flex gap-2">
              <button onClick={() => setModal(null)} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-[#64748b] text-sm font-semibold hover:bg-[#f8fafc] transition-colors">
                Cancelar
              </button>
              <button onClick={() => converter(modal)} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00545F] text-white text-sm font-semibold hover:bg-[#006B78] transition-colors disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Converter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
