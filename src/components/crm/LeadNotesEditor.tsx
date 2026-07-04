'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

interface Props { leadId: string; initialNotes: string }

export default function LeadNotesEditor({ leadId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes)
  const [saved, setSaved] = useState(true)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const res = await fetch(`/api/admin/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notas: notes }),
    })
    setSaving(false)
    if (res.ok) setSaved(true)
  }

  return (
    <div>
      <textarea
        value={notes}
        onChange={(e) => { setNotes(e.target.value); setSaved(false) }}
        rows={4}
        placeholder="Adicione notas internas sobre este lead..."
        className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all resize-none text-[#1F3F44] placeholder-[#94a3b8]"
      />
      <div className="flex justify-end mt-2">
        {saved ? (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <Check className="w-3 h-3" /> Guardado
          </span>
        ) : (
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F3F44] text-white text-xs font-semibold hover:bg-[#1e293b] transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            Guardar notas
          </button>
        )}
      </div>
    </div>
  )
}
