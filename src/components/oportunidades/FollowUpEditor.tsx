'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock, Check, Loader2, Trash2 } from 'lucide-react'

interface Props {
  oportunidadeId: string
  initialData: string | null   // YYYY-MM-DD
  initialNota: string | null
  hasEvent: boolean
}

export default function FollowUpEditor({ oportunidadeId, initialData, initialNota, hasEvent }: Props) {
  const [data, setData] = useState(initialData ?? '')
  const [nota, setNota] = useState(initialNota ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  const save = async (clear = false) => {
    setSaving(true)
    setSaved(false)
    const res = await fetch(`/api/admin/oportunidades/${oportunidadeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        follow_up_data: clear ? null : (data || null),
        follow_up_nota: clear ? null : (nota || null),
      }),
    })
    setSaving(false)
    if (res.ok) {
      if (clear) { setData(''); setNota('') }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      router.refresh()
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Data do lembrete</label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Nota (o que fazer)</label>
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          rows={2}
          placeholder="Ex: Confirmar se ainda quer vender..."
          className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all resize-none"
        />
      </div>

      {hasEvent && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-600">
          <CalendarClock className="w-3.5 h-3.5" /> Evento criado no Google Calendar
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => save(false)}
          disabled={saving || !data}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00545F] text-white text-sm font-semibold hover:bg-[#006B78] transition-colors disabled:opacity-50 shadow-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <CalendarClock className="w-4 h-4" />}
          {saved ? 'Guardado' : 'Agendar lembrete'}
        </button>
        {initialData && (
          <button
            onClick={() => save(true)}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e2e8f0] text-[#64748b] text-sm hover:bg-[#f8fafc] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remover
          </button>
        )}
      </div>
      <p className="text-xs text-[#94a3b8]">Recebes um email no dia agendado.</p>
    </div>
  )
}
