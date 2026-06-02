'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function MarkLeadRead({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const mark = async () => {
    setLoading(true)
    await supabase.from('contactos_imoveis').update({ lido: true }).eq('id', id)
    router.refresh()
  }

  return (
    <button
      onClick={mark}
      disabled={loading}
      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e2e8f0] text-xs text-[#64748b] hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
      Marcar lido
    </button>
  )
}
