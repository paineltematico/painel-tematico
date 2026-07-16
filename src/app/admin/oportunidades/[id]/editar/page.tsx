'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2 } from 'lucide-react'
import OportunidadeCampos, { FORM_VAZIO, toPayload, type FormOportunidade } from '@/components/oportunidades/OportunidadeCampos'

export default function EditarOportunidadePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [form, setForm] = useState<FormOportunidade>(FORM_VAZIO)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetch(`/api/admin/oportunidades/${id}`)
      .then((r) => r.json())
      .then((op) => {
        setForm({
          pessoa_nome: op.pessoa_nome ?? '',
          pessoa_email: op.pessoa_email ?? '',
          pessoa_telefone: op.pessoa_telefone ?? '',
          tipo: op.tipo ?? 'venda',
          localizacao: op.localizacao ?? '',
          morada: op.morada ?? '',
          cidade: op.cidade ?? '',
          codigo_postal: op.codigo_postal ?? '',
          mapa_url: op.mapa_url ?? '',
          tipologia: op.tipologia ?? '',
          area_m2: op.area_m2?.toString() ?? '',
          preco_esperado_min: op.preco_esperado_min?.toString() ?? '',
          preco_esperado_max: op.preco_esperado_max?.toString() ?? '',
          descricao: op.descricao ?? '',
        })
        setLoaded(true)
      })
  }, [id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.pessoa_nome.trim()) { setErro('Indica o nome.'); return }
    setLoading(true)
    setErro('')
    const res = await fetch(`/api/admin/oportunidades/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toPayload(form)),
    })
    setLoading(false)
    if (res.ok) router.push(`/admin/oportunidades/${id}`)
    else { const d = await res.json().catch(() => ({})); setErro(d.error ?? 'Erro ao guardar.') }
  }

  if (!loaded) return <div className="max-w-2xl mx-auto py-16 text-center text-[#94a3b8]"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/admin/oportunidades/${id}`} className="inline-flex items-center gap-1 text-sm text-[#64748b] hover:text-[#00545F] mb-4">
        <ChevronLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="font-serif text-2xl font-bold text-[#1F3F44] mb-6">Editar Oportunidade</h1>

      <form onSubmit={submit} className="space-y-6">
        <OportunidadeCampos form={form} setForm={setForm} />

        {erro && <p className="text-red-500 text-sm">{erro}</p>}
        <div className="flex justify-end gap-3">
          <Link href={`/admin/oportunidades/${id}`} className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-[#64748b] text-sm font-semibold hover:bg-[#f8fafc] transition-colors">Cancelar</Link>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00545F] text-white text-sm font-semibold hover:bg-[#006B78] transition-colors disabled:opacity-60 shadow-sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Guardar
          </button>
        </div>
      </form>
    </div>
  )
}
