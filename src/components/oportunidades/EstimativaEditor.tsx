'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Check, Loader2, Calculator } from 'lucide-react'
import { formatEuro, totalEstimativa } from '@/lib/oportunidades'
import { cn } from '@/lib/utils'
import type { LinhaEstimativa } from '@/types/database'

interface Props {
  oportunidadeId: string
  initial: LinhaEstimativa[]
}

// Atalhos para as linhas mais comuns de um negócio imobiliário
const SUGESTOES = [
  { label: 'Valor pedido',   valor: 0 },
  { label: 'Obras',          valor: 0 },
  { label: 'Comissão',       valor: 0 },
  { label: 'IMT + Escritura', valor: 0 },
]

export default function EstimativaEditor({ oportunidadeId, initial }: Props) {
  const [linhas, setLinhas] = useState<LinhaEstimativa[]>(initial ?? [])
  const [saved, setSaved] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const total = totalEstimativa(linhas)

  const update = (next: LinhaEstimativa[]) => { setLinhas(next); setSaved(false) }

  const addLinha = (label = '', valor = 0) =>
    update([...linhas, { id: crypto.randomUUID(), label, valor }])

  const save = async () => {
    setSaving(true)
    const res = await fetch(`/api/admin/oportunidades/${oportunidadeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estimativa: linhas.filter((l) => l.label.trim()) }),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); router.refresh() }
  }

  return (
    <div>
      {linhas.length === 0 ? (
        <div className="text-center py-6 mb-3">
          <Calculator className="w-8 h-8 text-[#cbd5e1] mx-auto mb-2" />
          <p className="text-sm text-[#94a3b8] mb-3">Sem linhas de orçamento.</p>
          <div className="flex gap-1.5 flex-wrap justify-center">
            {SUGESTOES.map((s) => (
              <button key={s.label} onClick={() => addLinha(s.label, s.valor)}
                className="px-2.5 py-1 rounded-lg border border-[#e2e8f0] text-xs text-[#475569] hover:border-[#00545F] hover:text-[#00545F] transition-colors">
                + {s.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2 mb-3">
          {linhas.map((linha, i) => (
            <div key={linha.id} className="flex items-center gap-2">
              <input
                value={linha.label}
                onChange={(e) => update(linhas.map((l, j) => j === i ? { ...l, label: e.target.value } : l))}
                placeholder="Descrição"
                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/20 focus:border-[#00545F] transition-all"
              />
              <input
                type="number"
                value={linha.valor === 0 ? '' : linha.valor}
                onChange={(e) => update(linhas.map((l, j) => j === i ? { ...l, valor: Number(e.target.value) || 0 } : l))}
                placeholder="0"
                className={cn(
                  'w-28 flex-shrink-0 px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-[#00545F]/20 focus:border-[#00545F] transition-all',
                  linha.valor < 0 ? 'text-red-600' : 'text-[#1F3F44]'
                )}
              />
              <button
                onClick={() => update(linhas.filter((_, j) => j !== i))}
                className="p-2 text-[#94a3b8] hover:text-red-500 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {linhas.length > 0 && (
        <>
          <button onClick={() => addLinha()} className="flex items-center gap-1.5 text-xs text-[#00545F] font-semibold hover:underline mb-3">
            <Plus className="w-3.5 h-3.5" /> Adicionar linha
          </button>

          {/* Total */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] mb-3">
            <span className="text-sm font-semibold text-[#1F3F44]">Total estimado</span>
            <span className={cn('text-lg font-bold font-serif tabular-nums', total < 0 ? 'text-red-600' : 'text-[#00545F]')}>
              {formatEuro(total)}
            </span>
          </div>
        </>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#94a3b8]">Valores negativos = custos</p>
        {saved ? (
          <span className="flex items-center gap-1 text-xs text-emerald-600"><Check className="w-3 h-3" /> Guardado</span>
        ) : (
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F3F44] text-white text-xs font-semibold hover:bg-[#1e293b] transition-colors disabled:opacity-60">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Guardar orçamento
          </button>
        )}
      </div>
    </div>
  )
}
