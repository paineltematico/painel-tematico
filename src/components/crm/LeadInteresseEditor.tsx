'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Check, X, Home, ExternalLink, Loader2, Save } from 'lucide-react'
import Link from 'next/link'

interface Props {
  leadId: string
  imovelTitulo: string | null
  imovelId: string | null
  notasInteresse: string | null
  readOnly?: boolean
}

export default function LeadInteresseEditor({ leadId, imovelTitulo, imovelId, notasInteresse, readOnly }: Props) {
  const router = useRouter()

  // Inline edit for imovel_titulo
  const [editingTitulo, setEditingTitulo] = useState(false)
  const [titulo, setTitulo] = useState(imovelTitulo ?? '')
  const [savingTitulo, setSavingTitulo] = useState(false)

  // Notas de interesse
  const [notas, setNotas] = useState(notasInteresse ?? '')
  const [savingNotas, setSavingNotas] = useState(false)
  const [savedNotas, setSavedNotas] = useState(false)

  const saveTitulo = async () => {
    setSavingTitulo(true)
    await fetch(`/api/admin/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imovel_titulo: titulo.trim() || null }),
    })
    setSavingTitulo(false)
    setEditingTitulo(false)
    router.refresh()
  }

  const saveNotas = async () => {
    setSavingNotas(true)
    await fetch(`/api/admin/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notas_interesse: notas.trim() || null }),
    })
    setSavingNotas(false)
    setSavedNotas(true)
    setTimeout(() => setSavedNotas(false), 2000)
    router.refresh()
  }

  return (
    <div className="mt-5 pt-5 border-t border-[#e2e8f0] grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Imóvel de interesse */}
      <div className="bg-[#f8fafc] rounded-xl p-4">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Imóvel de interesse</p>
          {!readOnly && !editingTitulo && (
            <button
              onClick={() => setEditingTitulo(true)}
              className="p-1 rounded-lg text-[#94a3b8] hover:text-[#1F3F44] hover:bg-white transition-colors"
              title="Editar imóvel"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>

        {editingTitulo ? (
          <div className="space-y-2">
            <input
              autoFocus
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value.slice(0, 30))}
              maxLength={30}
              placeholder="Nome do imóvel..."
              className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F]"
              onKeyDown={e => { if (e.key === 'Enter') saveTitulo(); if (e.key === 'Escape') setEditingTitulo(false) }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94a3b8]">{titulo.length}/30</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => { setTitulo(imovelTitulo ?? ''); setEditingTitulo(false) }}
                  className="p-1.5 rounded-lg border border-[#e2e8f0] text-[#94a3b8] hover:bg-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={saveTitulo}
                  disabled={savingTitulo}
                  className="p-1.5 rounded-lg bg-[#00545F] text-white hover:bg-[#006B78] disabled:opacity-60"
                >
                  {savingTitulo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-[#00545F] flex-shrink-0" />
            <span className="text-sm font-medium text-[#1F3F44] truncate">
              {titulo || <span className="text-[#94a3b8] font-normal italic">Não especificado</span>}
            </span>
            {imovelId && titulo && (
              <Link href={`/imoveis/${imovelId}`} target="_blank" className="text-[#94a3b8] hover:text-[#00545F] flex-shrink-0">
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Notas de interesse do cliente */}
      <div className="bg-[#f8fafc] rounded-xl p-4">
        <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">Interesses do cliente</p>
        {readOnly ? (
          <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-wrap">
            {notas || <span className="italic text-[#94a3b8]">Sem descrição</span>}
          </p>
        ) : (
          <div className="space-y-2">
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value.slice(0, 1000))}
              rows={3}
              maxLength={1000}
              placeholder="Descreva o que o cliente procura, preferências, requisitos..."
              className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] resize-none transition-all"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94a3b8]">{notas.length}/1000</span>
              <button
                onClick={saveNotas}
                disabled={savingNotas}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00545F] text-white text-xs font-semibold hover:bg-[#006B78] disabled:opacity-60 transition-colors"
              >
                {savingNotas
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : savedNotas
                    ? <Check className="w-3 h-3" />
                    : <Save className="w-3 h-3" />
                }
                {savedNotas ? 'Guardado!' : 'Guardar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
