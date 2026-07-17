'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NovoLeadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phoneWarned, setPhoneWarned] = useState(false)
  const [form, setForm] = useState({
    nome: '', email: '', telefone: '', mensagem: '',
    imovel_titulo: '', prioridade: 'normal', fonte: 'manual',
  })

  const field = 'w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all'
  const label = 'block text-xs font-semibold text-[#475569] mb-1.5 uppercase tracking-wider'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Sem email e sem telefone → bloqueia sempre
    if (!form.email && !form.telefone) {
      setError('Indique pelo menos o telemóvel ou o email.')
      document.getElementById('campo-telefone')?.focus()
      return
    }

    // Tem email mas sem telefone → avisa 1x, na 2ª tentativa avança
    if (form.email && !form.telefone && !phoneWarned) {
      setPhoneWarned(true)
      document.getElementById('campo-telefone')?.focus()
      return
    }

    setLoading(true)
    const res = await fetch('/api/admin/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome,
        email: form.email,
        telefone: form.telefone || null,
        mensagem: form.mensagem || null,
        imovel_titulo: form.imovel_titulo || null,
        prioridade: form.prioridade,
        fonte: form.fonte,
      }),
    })

    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Erro ao criar o lead.')
      setLoading(false)
      return
    }
    const data = await res.json()
    router.push(`/admin/leads/${data.id}`)
  }

  return (
    <div className="max-w-xl mx-auto">
      <nav className="flex items-center gap-1.5 text-xs text-[#94a3b8] mb-6">
        <Link href="/admin/leads" className="hover:text-[#1F3F44] transition-colors">Leads</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#1F3F44] font-medium">Novo Lead</span>
      </nav>

      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Novo Lead</h1>
        <p className="text-[#64748b] text-sm mt-0.5">Adicione manualmente um contacto ao CRM.</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={label}>Nome *</label>
              <input required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Nome completo" className={field} />
            </div>
            <div>
              <label className={label}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="email@exemplo.com"
                className={field}
              />
            </div>
            <div>
              <label className={cn(label, phoneWarned && !form.telefone && !form.email && 'text-amber-600')}>
                Telemóvel {phoneWarned && !form.telefone && !form.email && <span className="text-amber-600 normal-case font-normal">— preencha este campo</span>}
              </label>
              <input
                id="campo-telefone"
                type="tel"
                value={form.telefone}
                onChange={e => setForm({...form, telefone: e.target.value})}
                placeholder="+351 900 000 000"
                className={cn(field, phoneWarned && !form.telefone && !form.email && 'border-amber-400 ring-2 ring-amber-300/50 focus:border-amber-400')}
              />
              {phoneWarned && !form.telefone && !form.email && (
                <p className="text-amber-600 text-xs mt-1.5 flex items-center gap-1">
                  <span>⚠️</span> Indique pelo menos o telemóvel ou o email para guardar.
                </p>
              )}
            </div>
            <div className="col-span-2">
              <label className={label}>Imóvel de interesse</label>
              <input value={form.imovel_titulo} onChange={e => setForm({...form, imovel_titulo: e.target.value})} placeholder="ex: Moradia T4 Braga" className={field} />
            </div>
            <div className="col-span-2">
              <label className={label}>Mensagem / Contexto</label>
              <textarea rows={3} value={form.mensagem} onChange={e => setForm({...form, mensagem: e.target.value})} placeholder="Contexto do contacto..." className={cn(field, 'resize-none')} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Prioridade</label>
              <select value={form.prioridade} onChange={e => setForm({...form, prioridade: e.target.value})} className={field}>
                <option value="alta">🔴 Alta</option>
                <option value="normal">🟡 Normal</option>
                <option value="baixa">🟢 Baixa</option>
              </select>
            </div>
            <div>
              <label className={label}>Fonte</label>
              <select value={form.fonte} onChange={e => setForm({...form, fonte: e.target.value})} className={field}>
                <option value="manual">Manual</option>
                <option value="site">Site</option>
                <option value="telefone">Telefone</option>
                <option value="referencia">Referência</option>
                <option value="portal">Portal imobiliário</option>
              </select>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

        <div className="flex gap-3 justify-end pb-8">
          <Link href="/admin/leads" className="px-6 py-3 rounded-xl border border-[#e2e8f0] text-[#475569] font-semibold text-sm hover:bg-[#f8fafc] transition-colors">
            Cancelar
          </Link>
          <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors disabled:opacity-60 flex items-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> A criar...</> : 'Criar Lead'}
          </button>
        </div>
      </form>
    </div>
  )
}
