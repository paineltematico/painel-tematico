'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const field = 'w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all'
const label = 'block text-xs font-semibold text-[#475569] mb-1.5 uppercase tracking-wider'

export default function EditarLeadPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [form, setForm] = useState({
    nome: '', email: '', telefone: '', mensagem: '',
    imovel_titulo: '', prioridade: 'normal', fonte: 'manual',
  })

  useEffect(() => {
    fetch(`/api/admin/leads/${id}`)
      .then(r => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setForm({
          nome:          data.nome ?? '',
          email:         data.email ?? '',
          telefone:      data.telefone ?? '',
          mensagem:      data.mensagem ?? '',
          imovel_titulo: data.imovel_titulo ?? '',
          prioridade:    data.prioridade ?? 'normal',
          fonte:         data.fonte ?? 'manual',
        })
        setLoading(false)
      })
  }, [id])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email && !form.telefone) {
      setError('Indique pelo menos o telemóvel ou o email.')
      return
    }
    setSaving(true)
    setError('')
    // Campos com undefined são omitidos pelo JSON.stringify — só atualiza o que foi preenchido
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome:          form.nome,
        email:         form.email || undefined,
        telefone:      form.telefone || undefined,
        mensagem:      form.mensagem || undefined,
        imovel_titulo: form.imovel_titulo || undefined,
        prioridade:    form.prioridade as 'baixa' | 'normal' | 'alta',
        fonte:         form.fonte,
      }),
    })

    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Erro ao guardar')
      setSaving(false)
      return
    }
    router.push(`/admin/leads/${id}`)
    router.refresh()
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 animate-spin text-[#94a3b8]" />
    </div>
  )

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/admin/leads/${id}`} className="p-2 rounded-xl hover:bg-[#F2EEEE] transition-colors text-[#64748b]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Editar Lead</h1>
          <p className="text-[#64748b] text-sm">{form.nome}</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={label}>Nome *</label>
              <input required value={form.nome} onChange={set('nome')} className={field} />
            </div>
            <div>
              <label className={label}>Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="email@exemplo.com" className={field} />
            </div>
            <div>
              <label className={label}>Telemóvel</label>
              <input type="tel" value={form.telefone} onChange={set('telefone')} placeholder="+351 900 000 000" className={field} />
            </div>
            <div className="col-span-2">
              <label className={label}>Imóvel de interesse</label>
              <input value={form.imovel_titulo} onChange={set('imovel_titulo')} placeholder="ex: Moradia T4 Braga" className={field} />
            </div>
            <div className="col-span-2">
              <label className={label}>Mensagem / Contexto</label>
              <textarea rows={3} value={form.mensagem} onChange={set('mensagem')} className={cn(field, 'resize-none')} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Prioridade</label>
              <select value={form.prioridade} onChange={set('prioridade')} className={field}>
                <option value="alta">🔴 Alta</option>
                <option value="normal">🟡 Normal</option>
                <option value="baixa">🟢 Baixa</option>
              </select>
            </div>
            <div>
              <label className={label}>Fonte</label>
              <select value={form.fonte} onChange={set('fonte')} className={field}>
                <option value="manual">Manual</option>
                <option value="site">Site</option>
                <option value="telefone">Telefone</option>
                <option value="referencia">Referência</option>
                <option value="portal">Portal imobiliário</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>
        )}

        <div className="flex gap-3 justify-end pb-8">
          <Link href={`/admin/leads/${id}`}
            className="px-6 py-3 rounded-xl border border-[#e2e8f0] text-[#475569] font-semibold text-sm hover:bg-[#f8fafc] transition-colors">
            Cancelar
          </Link>
          <button type="submit" disabled={saving}
            className="px-8 py-3 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors disabled:opacity-60 flex items-center gap-2">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> A guardar...</>
              : <><CheckCircle className="w-4 h-4" /> Guardar</>}
          </button>
        </div>
      </form>
    </div>
  )
}
