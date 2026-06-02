'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
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

interface AdminUser {
  id: string
  email: string
  nome: string
  role: AdminRole
  ativo: boolean
  ultimo_login: string | null
  created_at: string
}

export default function EditarUtilizadorPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [user, setUser]       = useState<AdminUser | null>(null)
  const [form, setForm]       = useState({ nome: '', role: 'comercial' as AdminRole, password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    fetch('/api/admin/utilizadores')
      .then(r => r.json())
      .then(d => {
        const found = (d.users ?? []).find((u: AdminUser) => u.id === id)
        if (found) {
          setUser(found)
          setForm({ nome: found.nome, role: found.role, password: '' })
        }
        setLoading(false)
      })
  }, [id])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const body: Record<string, string> = { nome: form.nome, role: form.role }
    if (form.password) body.password = form.password

    const res = await fetch(`/api/admin/utilizadores/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setError(data.error ?? 'Erro ao guardar'); return }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setForm(f => ({ ...f, password: '' }))
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 text-[#94a3b8] animate-spin" />
    </div>
  )

  if (!user) return (
    <div className="max-w-2xl mx-auto text-center py-24">
      <p className="text-[#1F3F44] font-semibold">Utilizador não encontrado</p>
      <Link href="/admin/utilizadores" className="text-[#00545F] text-sm mt-3 inline-block hover:underline">
        Voltar à lista
      </Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/utilizadores" className="p-2 rounded-xl hover:bg-[#F2EEEE] transition-colors text-[#64748b]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Editar Utilizador</h1>
          <p className="text-[#94a3b8] text-sm">{user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E8E3E3] p-8 space-y-6">

        {/* Nome */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Nome completo</label>
            <input value={form.nome} onChange={set('nome')} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input value={user.email} disabled className={`${inputCls} opacity-50 cursor-not-allowed`} />
          </div>
        </div>

        {/* Função */}
        <div>
          <label className={labelCls}>Função / Nível de acesso</label>
          <select value={form.role} onChange={set('role')} className={inputCls}>
            {ROLES.map(r => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
          <p className="text-xs text-[#64748b] mt-2 bg-[#f8fafc] rounded-lg px-3 py-2 border border-[#e2e8f0]">
            {ROLE_DESCRIPTIONS[form.role]}
          </p>
        </div>

        {/* Nova password (opcional) */}
        <div>
          <label className={labelCls}>Nova palavra-passe <span className="text-[#94a3b8] normal-case font-normal">(deixe em branco para não alterar)</span></label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
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

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
        )}

        {saved && (
          <div className="flex items-center gap-2 text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
            <CheckCircle className="w-4 h-4" /> Guardado com sucesso
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            href="/admin/utilizadores"
            className="flex-1 py-2.5 rounded-xl border border-[#E8E3E3] text-[#64748b] font-semibold text-sm text-center hover:bg-[#F2EEEE] transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || !form.nome}
            className="flex-1 py-2.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> A guardar...</> : 'Guardar alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}
