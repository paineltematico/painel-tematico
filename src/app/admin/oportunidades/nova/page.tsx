'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, ImageIcon } from 'lucide-react'
import OportunidadeCampos, { FORM_VAZIO, toPayload, type FormOportunidade } from '@/components/oportunidades/OportunidadeCampos'

export default function NovaOportunidadePage() {
  const router = useRouter()
  const [form, setForm] = useState<FormOportunidade>(FORM_VAZIO)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.pessoa_nome.trim()) { setErro('Indica o nome da pessoa.'); return }
    setLoading(true)
    setErro('')
    const res = await fetch('/api/admin/oportunidades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toPayload(form)),
    })
    const d = await res.json().catch(() => ({}))
    setLoading(false)
    if (res.ok && d.id) router.push(`/admin/oportunidades/${d.id}`)
    else setErro(d.error ?? 'Erro ao criar.')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/oportunidades" className="inline-flex items-center gap-1 text-sm text-[#64748b] hover:text-[#00545F] mb-4">
        <ChevronLeft className="w-4 h-4" /> Oportunidades
      </Link>
      <h1 className="font-serif text-2xl font-bold text-[#1F3F44] mb-1">Nova Oportunidade</h1>
      <p className="text-[#64748b] text-sm mb-6">Só o nome é obrigatório — o resto podes ir preenchendo depois.</p>

      <form onSubmit={submit} className="space-y-6">
        <OportunidadeCampos form={form} setForm={setForm} />

        <div className="flex items-start gap-2.5 rounded-xl bg-[#00545F]/5 border border-[#00545F]/15 px-4 py-3">
          <ImageIcon className="w-4 h-4 text-[#00545F] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[#475569]">
            <strong className="text-[#1F3F44]">Fotos e documentos</strong> adicionam-se já a seguir — assim que criares a oportunidade, abre a página dela e verás os campos para carregar imagens e PDFs.
          </p>
        </div>

        {erro && <p className="text-red-500 text-sm">{erro}</p>}
        <div className="flex justify-end gap-3">
          <Link href="/admin/oportunidades" className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-[#64748b] text-sm font-semibold hover:bg-[#f8fafc] transition-colors">Cancelar</Link>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00545F] text-white text-sm font-semibold hover:bg-[#006B78] transition-colors disabled:opacity-60 shadow-sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Criar oportunidade
          </button>
        </div>
      </form>
    </div>
  )
}
