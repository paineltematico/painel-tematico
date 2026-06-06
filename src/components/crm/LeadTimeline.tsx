'use client'

import { useState } from 'react'
import { Pencil, Check, X, History, ChevronDown, ChevronUp } from 'lucide-react'
import { ATIVIDADE_TIPOS, ESTADOS, formatRelativeDate } from '@/lib/crm'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { LeadAtividade } from '@/types/database'

interface Versao {
  conteudo: string
  editado_em: string
}

type AtividadeComVersoes = LeadAtividade & {
  updated_at?: string
  versoes?: Versao[]
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

interface Props {
  atividades: LeadAtividade[]
  isSuperAdmin?: boolean
}

export default function LeadTimeline({ atividades: initial, isSuperAdmin = false }: Props) {
  const [items, setItems]       = useState<AtividadeComVersoes[]>(initial)
  const [editing, setEditing]   = useState<string | null>(null)
  const [draft, setDraft]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null) // which item's history is open

  const startEdit = (at: AtividadeComVersoes) => {
    setEditing(at.id)
    setDraft(at.conteudo ?? '')
  }

  const cancelEdit = () => { setEditing(null); setDraft('') }

  const saveEdit = async (id: string) => {
    setSaving(true)
    const now = new Date().toISOString()
    const current = items.find(a => a.id === id) as AtividadeComVersoes

    // Build new versoes — append current content before overwriting
    const prevVersoes: Versao[] = current.versoes ?? []
    const newVersoes: Versao[] = [
      ...prevVersoes,
      {
        conteudo:  current.conteudo ?? '',
        editado_em: current.updated_at ?? current.created_at,
      },
    ]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('lead_atividades') as any)
      .update({ conteudo: draft, updated_at: now, versoes: newVersoes })
      .eq('id', id)

    if (!error) {
      setItems(prev => prev.map(a =>
        a.id === id
          ? { ...a, conteudo: draft, updated_at: now, versoes: newVersoes }
          : a
      ))
    }
    setEditing(null)
    setDraft('')
    setSaving(false)
  }

  if (items.length === 0) return (
    <div className="text-center py-8 text-[#94a3b8]">
      <p className="text-sm">Sem atividade registada ainda.</p>
      <p className="text-xs mt-1">Registe chamadas, emails e visitas acima.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {items.map((at, i) => {
        const tipo      = ATIVIDADE_TIPOS.find((t) => t.value === at.tipo)
        const isEditing = editing === at.id
        const editavel  = !['mudanca_estado', 'arquivamento', 'transferencia'].includes(at.tipo)
        const wasEdited = !!at.updated_at
        const versoes   = at.versoes ?? []
        const isExpanded = expanded === at.id

        return (
          <div key={at.id} className="flex gap-3 group">
            {/* Icon + connector */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-sm flex-shrink-0">
                {tipo?.icon ?? '📋'}
              </div>
              {i < items.length - 1 && (
                <div className="w-px flex-1 bg-[#e2e8f0] mt-2 min-h-[16px]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2 min-w-0">

              {/* Header */}
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-semibold text-[#1F3F44]">
                  {tipo?.label ?? at.tipo}
                </span>
                <span
                  className="text-xs text-[#94a3b8]"
                  title={formatDateTime(at.created_at)}
                >
                  {formatRelativeDate(at.created_at)}
                </span>
                {wasEdited && (
                  <span className="text-xs text-[#94a3b8]">(editado)</span>
                )}
                {/* Pencil on hover */}
                {editavel && !isEditing && (
                  <button
                    onClick={() => startEdit(at)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-[#94a3b8] hover:text-[#1F3F44] hover:bg-[#f1f5f9]"
                    title="Editar"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
                {/* History button — super admin only, when there are versions */}
                {isSuperAdmin && versoes.length > 0 && !isEditing && (
                  <button
                    onClick={() => setExpanded(isExpanded ? null : at.id)}
                    className="flex items-center gap-1 text-[10px] text-[#94a3b8] hover:text-[#00545F] transition-colors ml-1"
                    title="Ver versões anteriores"
                  >
                    <History className="w-3 h-3" />
                    {versoes.length} {versoes.length === 1 ? 'versão anterior' : 'versões anteriores'}
                    {isExpanded
                      ? <ChevronUp className="w-3 h-3" />
                      : <ChevronDown className="w-3 h-3" />
                    }
                  </button>
                )}
              </div>

              {/* Body */}
              {at.tipo === 'mudanca_estado' ? (
                <p className="text-xs text-[#64748b]">
                  <span className="font-medium">
                    {ESTADOS.find(e => e.value === at.estado_anterior)?.label ?? at.estado_anterior}
                  </span>
                  {' → '}
                  <span className="font-medium text-[#00545F]">
                    {ESTADOS.find(e => e.value === at.estado_novo)?.label ?? at.estado_novo}
                  </span>
                </p>
              ) : (at.tipo === 'arquivamento' || at.tipo === 'transferencia') ? (
                <p className={cn(
                  'text-sm rounded-xl p-3 border leading-relaxed',
                  at.tipo === 'arquivamento'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                )}>
                  {at.conteudo}
                </p>
              ) : isEditing ? (
                <div className="space-y-2">
                  <textarea
                    autoFocus
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    rows={3}
                    className="w-full text-sm text-[#475569] bg-white border border-[#00545F]/40 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#00545F]/30"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(at.id)}
                      disabled={saving}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00545F] text-white text-xs font-semibold hover:bg-[#006B78] disabled:opacity-60 transition-colors"
                    >
                      <Check className="w-3 h-3" /> Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#e2e8f0] text-[#64748b] text-xs font-semibold hover:bg-[#f8fafc] transition-colors"
                    >
                      <X className="w-3 h-3" /> Cancelar
                    </button>
                  </div>
                </div>
              ) : at.conteudo ? (
                <p className="text-sm text-[#475569] bg-[#f8fafc] rounded-xl p-3 border border-[#e2e8f0] leading-relaxed">
                  {at.conteudo}
                </p>
              ) : null}

              {/* Version history — super admin only */}
              {isSuperAdmin && isExpanded && versoes.length > 0 && (
                <div className="mt-2 space-y-2 border-l-2 border-[#e2e8f0] pl-3">
                  <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">
                    Versões anteriores
                  </p>
                  {[...versoes].reverse().map((v, vi) => (
                    <div key={vi} className="bg-[#fafafa] rounded-lg border border-[#e2e8f0] p-2.5">
                      <p className="text-[10px] text-[#94a3b8] mb-1" title={formatDateTime(v.editado_em)}>
                        {formatDateTime(v.editado_em)}
                      </p>
                      <p className="text-xs text-[#64748b] leading-relaxed">{v.conteudo}</p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )
      })}
    </div>
  )
}
