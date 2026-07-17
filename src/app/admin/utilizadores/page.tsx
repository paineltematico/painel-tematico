'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { UserCog, Plus, Loader2, Trash2, CheckCircle, XCircle, Edit3 } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/auth'
import type { AdminRole } from '@/lib/auth'
import { cn } from '@/lib/utils'

interface AdminUser {
  id: string
  email: string
  nome: string
  role: AdminRole
  ativo: boolean
  ultimo_login: string | null
  created_at: string
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d))
}

export default function UtilizadoresPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/utilizadores').then(r => r.json()).then(d => {
      setUsers(d.users ?? [])
      setLoading(false)
    })
  }, [])

  const toggleAtivo = async (id: string, ativo: boolean) => {
    setToggling(id)
    await fetch(`/api/admin/utilizadores/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo }),
    })
    setUsers(u => u.map(x => x.id === id ? { ...x, ativo } : x))
    setToggling(null)
  }

  const deleteUser = async (id: string, nome: string) => {
    if (!confirm(`Eliminar o utilizador "${nome}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(id)
    const res = await fetch(`/api/admin/utilizadores/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setUsers(u => u.filter(x => x.id !== id))
    } else {
      const d = await res.json()
      alert(d.error ?? 'Erro ao eliminar utilizador')
    }
    setDeleting(null)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#00545F]/10 flex items-center justify-center flex-shrink-0">
            <UserCog className="w-5 h-5 text-[#00545F]" />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1F3F44]">Utilizadores</h1>
            <p className="text-[#64748b] text-sm">Gerir acessos e permissões</p>
          </div>
        </div>
        <Link
          href="/admin/utilizadores/novo"
          className="flex items-center gap-2 px-4 sm:px-5 min-h-11 py-2.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Novo utilizador</span><span className="sm:hidden">Novo</span>
        </Link>
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.entries(ROLE_LABELS) as [AdminRole, string][]).map(([role, label]) => (
          <span key={role} className={cn('px-3 py-1 rounded-full text-xs font-semibold border', ROLE_COLORS[role])}>
            {label}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center">
          <Loader2 className="w-6 h-6 text-[#94a3b8] animate-spin mx-auto" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-16 text-center">
          <UserCog className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
          <p className="font-serif font-semibold text-[#1F3F44]">Sem utilizadores</p>
          <p className="text-[#94a3b8] text-sm mt-1">O acesso master usa a palavra-passe do .env</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="bg-white rounded-2xl border border-[#e2e8f0] p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1F3F44]">{u.nome}</p>
                  <p className="text-xs text-[#94a3b8] break-all">{u.email}</p>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Link
                    href={`/admin/utilizadores/${u.id}`}
                    className="p-2 rounded-lg text-[#94a3b8] hover:text-[#1F3F44] hover:bg-[#f1f5f9] transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => deleteUser(u.id, u.nome)}
                    disabled={deleting === u.id}
                    className="p-2 rounded-lg text-[#94a3b8] hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    {deleting === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold border', ROLE_COLORS[u.role])}>
                  {ROLE_LABELS[u.role]}
                </span>
                <button
                  onClick={() => toggleAtivo(u.id, !u.ativo)}
                  disabled={toggling === u.id}
                  className="flex items-center gap-1.5 text-xs font-semibold"
                >
                  {toggling === u.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#94a3b8]" />
                  ) : u.ativo ? (
                    <><CheckCircle className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-700">Ativo</span></>
                  ) : (
                    <><XCircle className="w-4 h-4 text-[#94a3b8]" /> <span className="text-[#94a3b8]">Inativo</span></>
                  )}
                </button>
                <span className="text-xs text-[#94a3b8]">Último login: {formatDate(u.ultimo_login)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
