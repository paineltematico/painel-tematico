'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react'
import { ROLE_LABELS } from '@/lib/auth'
import type { AdminRole } from '@/lib/auth'

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all'
const labelCls = 'block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5'

const ROLES: AdminRole[] = ['super_admin', 'diretor', 'comercial', 'marketing', 'gestor_projeto']

const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  super_admin:    'Acesso total, incluindo gestão de utilizadores e configurações críticas.',
  diretor:        'Acesso a tudo exceto gestão de utilizadores.',
  comercial:      'Gestão de leads, CRM e consulta de imóveis.',
  marketing:      'Gestão de conteúdos, blog, construção e equipa.',
  gestor_projeto: 'Atualização de obras, projetos, unidades e construção.',
}

export default function NovoUtilizadorPage() {
  const router = useRouter()
  const [form, setForm] = useState({ nome: '', email: '', password: '', role: 'comercial' as AdminRole })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/utilizadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      let data: { error?: string } = {}
      try { data = await res.json() } catch { /* ignore parse errors */ }
      setLoading(false)
      if (!res.ok) { setError(data.error ?? 'Erro ao criar utilizador'); return }
      router.push('/admin/utilizadores')
    } catch {
      setLoading(false)
      setError('Erro de ligação. Tenta novamente.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/utilizadores" className="p-2 rounded-xl hover:bg-[#F2EEEE] transition-colors text-[#64748b]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Novo Utilizador</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E8E3E3] p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Nome completo *</label>
            <input value={form.nome} onChange={set('nome')} required className={inputCls} placeholder="João Silva" />
          </div>
          <div>
            <label className={labelCls}>Email *</label>
            <input type="email" value={form.email} onChange={set('email')} required className={inputCls} placeholder="joao@paineltematico.pt" />
          </div>
        </div>

        <div>
          <label className={labelCls}>Palavra-passe *</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              required
              minLength={8}
              className={`${inputCls} pr-10`}
              placeholder="Mínimo 8 caracteres"
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#1F3F44]">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className={labelCls}>Função / Nível de acesso *</label>
          <select value={form.role} onChange={set('role')} className={inputCls}>
            {ROLES.map(r => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
          <p className="text-xs text-[#64748b] mt-2 bg-[#f8fafc] rounded-lg px-3 py-2 border border-[#e2e8f0]">
            {ROLE_DESCRIPTIONS[form.role]}
          </p>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/admin/utilizadores" className="flex-1 py-2.5 rounded-xl border border-[#E8E3E3] text-[#64748b] font-semibold text-sm text-center hover:bg-[#F2EEEE] transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || !form.nome || !form.email || !form.password}
            className="flex-1 py-2.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> A criar...</> : 'Criar utilizador'}
          </button>
        </div>
      </form>
    </div>
  )
}
