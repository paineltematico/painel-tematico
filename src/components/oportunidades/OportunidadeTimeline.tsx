'use client'

import { ESTADOS, formatRelativeDate } from '@/lib/oportunidades'
import type { OportunidadeAtividade } from '@/types/database'

const ICONS: Record<string, string> = {
  nota: '📝', chamada: '📞', email: '✉️', mudanca_estado: '🔄',
}

interface Props { atividades: OportunidadeAtividade[] }

export default function OportunidadeTimeline({ atividades }: Props) {
  if (atividades.length === 0) return (
    <div className="text-center py-8 text-[#94a3b8]">
      <p className="text-sm">Sem atividade registada ainda.</p>
      <p className="text-xs mt-1">Registe notas, chamadas e emails acima.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {atividades.map((at, i) => {
        const estadoNovo = at.estado_novo ? ESTADOS.find((e) => e.value === at.estado_novo) : null
        return (
          <div key={at.id} className="flex gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-sm">
                {ICONS[at.tipo] ?? '📋'}
              </div>
              {i < atividades.length - 1 && <div className="w-px flex-1 bg-[#e2e8f0] mt-2 min-h-[16px]" />}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                {at.tipo === 'mudanca_estado' ? (
                  <p className="text-sm text-[#1F3F44]">
                    {at.conteudo ?? 'Estado alterado'}
                    {estadoNovo && <span className={`ml-1 font-semibold ${estadoNovo.color}`}>→ {estadoNovo.label}</span>}
                  </p>
                ) : (
                  <p className="text-sm text-[#1F3F44] whitespace-pre-wrap">{at.conteudo}</p>
                )}
              </div>
              <p className="text-xs text-[#94a3b8] mt-1">{formatRelativeDate(at.created_at)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
