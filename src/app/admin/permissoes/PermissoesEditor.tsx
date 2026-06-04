'use client'

import { useState } from 'react'
import { Check, X, Minus, Loader2, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/auth'
import { can, ROLE_PERMISSIONS } from '@/lib/permissions'
import type { AdminRole } from '@/lib/auth'
import type { Permission } from '@/lib/permissions'

interface DBUser {
  id: string
  nome: string
  email: string
  role: AdminRole
  ativo: boolean
  permissions_extra:  string[] | null
  permissions_denied: string[] | null
}

// Permission groups for display
const GROUPS: { label: string; emoji: string; perms: { key: Permission; label: string }[] }[] = [
  { label: 'Dashboard',    emoji: '📊', perms: [
    { key: 'dashboard.view',    label: 'Ver' },
  ]},
  { label: 'Imóveis',      emoji: '🏠', perms: [
    { key: 'imoveis.view',      label: 'Ver' },
    { key: 'imoveis.create',    label: 'Criar' },
    { key: 'imoveis.edit',      label: 'Editar' },
    { key: 'imoveis.delete',    label: 'Eliminar' },
  ]},
  { label: 'Leads / CRM',  emoji: '👥', perms: [
    { key: 'leads.view',        label: 'Ver' },
    { key: 'leads.create',      label: 'Criar' },
    { key: 'leads.edit',        label: 'Editar' },
    { key: 'leads.delete',      label: 'Eliminar' },
  ]},
  { label: 'Projetos',     emoji: '🏗️', perms: [
    { key: 'projetos.view',     label: 'Ver' },
    { key: 'projetos.create',   label: 'Criar' },
    { key: 'projetos.edit',     label: 'Editar' },
    { key: 'projetos.delete',   label: 'Eliminar' },
  ]},
  { label: 'Unidades',     emoji: '🔑', perms: [
    { key: 'unidades.view',     label: 'Ver' },
    { key: 'unidades.edit',     label: 'Editar' },
  ]},
  { label: 'Obra',         emoji: '🔧', perms: [
    { key: 'obra.view',         label: 'Ver' },
    { key: 'obra.edit',         label: 'Editar' },
  ]},
  { label: 'Blog',         emoji: '📝', perms: [
    { key: 'blog.view',         label: 'Ver' },
    { key: 'blog.create',       label: 'Criar' },
    { key: 'blog.edit',         label: 'Editar' },
    { key: 'blog.delete',       label: 'Eliminar' },
  ]},
  { label: 'Construção',   emoji: '🏛️', perms: [
    { key: 'construcao.view',   label: 'Ver' },
    { key: 'construcao.edit',   label: 'Editar' },
  ]},
  { label: 'Equipa',       emoji: '👤', perms: [
    { key: 'equipa.view',       label: 'Ver' },
    { key: 'equipa.edit',       label: 'Editar' },
  ]},
  { label: 'Testemunhos',  emoji: '⭐', perms: [
    { key: 'testemunhos.view',  label: 'Ver' },
    { key: 'testemunhos.edit',  label: 'Editar' },
  ]},
  { label: 'Definições',   emoji: '⚙️', perms: [
    { key: 'definicoes.view',   label: 'Ver' },
    { key: 'definicoes.edit',   label: 'Editar' },
  ]},
  { label: 'Utilizadores', emoji: '🔐', perms: [
    { key: 'utilizadores.view',   label: 'Ver' },
    { key: 'utilizadores.create', label: 'Criar' },
    { key: 'utilizadores.edit',   label: 'Editar' },
    { key: 'utilizadores.delete', label: 'Eliminar' },
  ]},
]

type PermState = 'role' | 'granted' | 'denied'

function getPermState(perm: Permission, extra: string[], denied: string[]): PermState {
  if (denied.includes(perm)) return 'denied'
  if (extra.includes(perm))  return 'granted'
  return 'role'
}

function cycleState(current: PermState, roleHas: boolean): PermState {
  // role default → toggle grant/deny
  if (roleHas) {
    // Role already has it: default → denied → default
    if (current === 'role')    return 'denied'
    if (current === 'denied')  return 'role'
    return 'role'
  } else {
    // Role doesn't have it: default → granted → default
    if (current === 'role')    return 'granted'
    if (current === 'granted') return 'role'
    return 'role'
  }
}

interface Props { users: DBUser[]; currentUserId: string }

export default function PermissoesEditor({ users, currentUserId }: Props) {
  const [selectedId, setSelectedId] = useState<string>(
    users.find(u => u.id !== currentUserId && u.ativo)?.id ?? users[0]?.id ?? ''
  )
  const [overrides, setOverrides] = useState<Record<string, { extra: string[]; denied: string[] }>>(() => {
    const map: Record<string, { extra: string[]; denied: string[] }> = {}
    users.forEach(u => {
      map[u.id] = {
        extra:  u.permissions_extra  ?? [],
        denied: u.permissions_denied ?? [],
      }
    })
    return map
  })
  const [saving, setSaving]     = useState(false)
  const [saved,  setSaved]      = useState<string | null>(null)

  const selectedUser = users.find(u => u.id === selectedId)
  const userOverride = selectedId ? overrides[selectedId] : null

  const togglePerm = (perm: Permission) => {
    if (!selectedId || !userOverride) return
    const roleHas  = can(selectedUser!.role, perm)
    const current  = getPermState(perm, userOverride.extra, userOverride.denied)
    const next     = cycleState(current, roleHas)

    setOverrides(prev => {
      const o = { ...prev[selectedId] }
      o.extra  = o.extra.filter(p => p !== perm)
      o.denied = o.denied.filter(p => p !== perm)
      if (next === 'granted') o.extra  = [...o.extra,  perm]
      if (next === 'denied')  o.denied = [...o.denied, perm]
      return { ...prev, [selectedId]: o }
    })
  }

  const save = async () => {
    if (!selectedId || !userOverride) return
    setSaving(true)
    await fetch('/api/admin/permissoes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId:             selectedId,
        permissions_extra:  userOverride.extra,
        permissions_denied: userOverride.denied,
      }),
    })
    setSaving(false)
    setSaved(selectedId)
    setTimeout(() => setSaved(null), 2500)
  }

  const resetUser = () => {
    if (!selectedId) return
    const original = users.find(u => u.id === selectedId)
    setOverrides(prev => ({
      ...prev,
      [selectedId]: {
        extra:  original?.permissions_extra  ?? [],
        denied: original?.permissions_denied ?? [],
      },
    }))
  }

  return (
    <div className="flex gap-5 items-start">

      {/* User list */}
      <div className="w-64 flex-shrink-0 bg-white rounded-2xl border border-[#E8E3E3] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Utilizadores</p>
        </div>
        <ul className="divide-y divide-[#e2e8f0]">
          {users.map(u => {
            const o = overrides[u.id]
            const hasOverrides = (o?.extra.length ?? 0) + (o?.denied.length ?? 0) > 0
            const isSelf = u.id === currentUserId
            return (
              <li key={u.id}>
                <button
                  onClick={() => setSelectedId(u.id)}
                  disabled={isSelf}
                  className={cn(
                    'w-full text-left px-4 py-3 transition-colors',
                    selectedId === u.id ? 'bg-[#00545F]/5 border-l-2 border-[#00545F]' : 'hover:bg-[#f8fafc]',
                    isSelf && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-[#1F3F44] text-sm truncate">{u.nome}</p>
                    {hasOverrides && (
                      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-amber-400" title="Tem overrides" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium border', ROLE_COLORS[u.role])}>
                      {ROLE_LABELS[u.role]}
                    </span>
                    {isSelf && <span className="text-xs text-[#94a3b8]">(tu)</span>}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Permissions matrix */}
      {selectedUser && userOverride ? (
        <div className="flex-1 min-w-0 space-y-4">

          {/* User header */}
          <div className="bg-white rounded-2xl border border-[#E8E3E3] px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1F3F44] text-white flex items-center justify-center font-bold text-sm">
                {selectedUser.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[#1F3F44]">{selectedUser.nome}</p>
                <p className="text-xs text-[#94a3b8]">{selectedUser.email}</p>
              </div>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold border ml-2', ROLE_COLORS[selectedUser.role])}>
                {ROLE_LABELS[selectedUser.role]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {(userOverride.extra.length > 0 || userOverride.denied.length > 0) && (
                <button onClick={resetUser} className="text-xs text-[#94a3b8] hover:text-[#64748b] px-3 py-1.5 rounded-lg border border-[#E8E3E3] hover:bg-[#f8fafc] transition-colors">
                  Repor padrão
                </button>
              )}
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00545F] text-white text-sm font-semibold hover:bg-[#006B78] transition-colors disabled:opacity-60 shadow-sm"
              >
                {saving
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : saved === selectedId
                    ? <><Check className="w-4 h-4" /> Guardado!</>
                    : <><ShieldCheck className="w-4 h-4" /> Guardar</>
                }
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-4 text-xs text-[#64748b] px-1">
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-lg bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center"><Minus className="w-3 h-3 text-[#94a3b8]" /></span> Herdado da função</span>
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center"><Check className="w-3 h-3 text-emerald-600" /></span> Concedido extra</span>
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center"><X className="w-3 h-3 text-red-500" /></span> Explicitamente negado</span>
          </div>

          {/* Permission groups */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GROUPS.map(group => {
              const anyActive = group.perms.some(p => {
                const state = getPermState(p.key, userOverride.extra, userOverride.denied)
                return state !== 'role' || can(selectedUser.role, p.key)
              })
              return (
                <div key={group.label} className="bg-white rounded-2xl border border-[#E8E3E3] overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-2">
                    <span>{group.emoji}</span>
                    <p className="text-xs font-semibold text-[#475569] uppercase tracking-wide">{group.label}</p>
                    {anyActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00545F]" />}
                  </div>
                  <div className="p-3 space-y-1">
                    {group.perms.map(({ key, label }) => {
                      const roleHas = can(selectedUser.role, key)
                      const state   = getPermState(key, userOverride.extra, userOverride.denied)
                      const effective = state === 'denied' ? false : state === 'granted' ? true : roleHas

                      return (
                        <button
                          key={key}
                          onClick={() => togglePerm(key)}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all border',
                            state === 'granted'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : state === 'denied'
                                ? 'bg-red-50 border-red-200 text-red-600'
                                : effective
                                  ? 'bg-[#f8fafc] border-[#e2e8f0] text-[#1F3F44]'
                                  : 'bg-white border-[#E8E3E3] text-[#94a3b8]'
                          )}
                        >
                          <span className="font-medium">{label}</span>
                          <span className={cn(
                            'w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0',
                            state === 'granted'
                              ? 'bg-emerald-100 border border-emerald-300'
                              : state === 'denied'
                                ? 'bg-red-100 border border-red-300'
                                : 'bg-[#e2e8f0] border border-[#cbd5e1]'
                          )}>
                            {state === 'granted' ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : state === 'denied' ? (
                              <X className="w-3 h-3 text-red-500" />
                            ) : effective ? (
                              <Check className="w-3 h-3 text-[#64748b]" />
                            ) : (
                              <Minus className="w-3 h-3 text-[#94a3b8]" />
                            )}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-xs text-[#94a3b8] text-center pb-4">
            Clica em cada permissão para alterar. As alterações só ficam ativas após "Guardar".
          </p>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-2xl border border-[#E8E3E3] p-14 text-center">
          <ShieldCheck className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
          <p className="font-serif font-semibold text-[#1F3F44]">Seleciona um utilizador</p>
          <p className="text-[#94a3b8] text-sm mt-1">para gerir as suas permissões de acesso</p>
        </div>
      )}
    </div>
  )
}
