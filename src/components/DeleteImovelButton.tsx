'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Props { id: string; titulo: string }

export default function DeleteImovelButton({ id, titulo }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    await supabase.from('imoveis').delete().eq('id', id)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => setConfirming(false)}
          className="px-2.5 py-1 rounded-lg text-xs text-[#64748b] hover:bg-[#f1f5f9] transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-2.5 py-1 rounded-lg text-xs bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-1 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          Confirmar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-2 rounded-lg text-[#94a3b8] hover:text-red-500 hover:bg-red-50 transition-colors"
      title={`Apagar "${titulo}"`}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
