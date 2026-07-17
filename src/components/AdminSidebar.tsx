'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LogOut, Plus, ExternalLink, ShieldCheck, X, Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdminRole } from '@/lib/auth'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/auth'
import { canUser } from '@/lib/permissions'
import { visibleNavItems, activeHref } from '@/lib/admin-nav'

const LANGS = [
  { code: 'pt', flag: '🇵🇹', label: 'PT' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
]

function SidebarLang() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('pt')

  const handleSelect = (code: string) => {
    setCurrent(code)
    setOpen(false)
    if (typeof window === 'undefined') return
    if (code === 'pt') { window.location.href = window.location.href; return }
    const base = window.location.href.includes('translate.google.com')
      ? decodeURIComponent(window.location.href.split('&u=')[1] ?? window.location.href)
      : window.location.href
    window.location.href = `https://translate.google.com/translate?sl=pt&tl=${code}&u=${encodeURIComponent(base)}`
  }

  const sel = LANGS.find(l => l.code === current) ?? LANGS[0]

  return (
    <div className="relative">
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#0d1a1c] border border-white/10 rounded-xl overflow-hidden shadow-xl">
          {LANGS.map(l => (
            <button key={l.code} onClick={() => handleSelect(l.code)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors hover:bg-white/8 ${l.code === current ? 'text-[#4ecdc4] bg-white/5' : 'text-slate-400'}`}>
              <span>{l.flag}</span><span className="font-medium">{l.label}</span>
            </button>
          ))}
        </div>
      )}
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/10 transition-all">
        <Globe className="w-4 h-4 flex-shrink-0" />
        <span>{sel.flag} {sel.label}</span>
      </button>
    </div>
  )
}

interface Props {
  user?: {
    nome: string
    email: string
    role: AdminRole
    permissions_extra?: string[]
    permissions_denied?: string[]
  } | null
  onClose?: () => void
}

export default function AdminSidebar({ user, onClose }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const role     = user?.role ?? 'comercial'

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const visibleItems = visibleNavItems(user ? { role, permissions_extra: user.permissions_extra, permissions_denied: user.permissions_denied } : null)

  // Realce: escolhe o item cujo href é o prefixo mais longo do caminho atual
  const active = activeHref(visibleItems, pathname)

  return (
    <aside className="w-72 lg:w-64 flex-shrink-0 bg-[#1F3F44] min-h-screen flex flex-col">

      {/* Logo + user info */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-start justify-between mb-4">
          <Link href="/admin/dashboard" onClick={onClose} className="inline-block">
            <Image
              src="/logos/logo-white.png"
              alt="Painel Temático"
              width={160}
              height={48}
              className="h-8 w-auto object-contain"
            />
          </Link>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors lg:hidden">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {user && (
          <div className="mt-3">
            <p className="text-white text-sm font-semibold truncate">{user.nome}</p>
            <p className="text-slate-400 text-xs truncate mb-2">{user.email}</p>
            <div className="flex items-center gap-2">
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
                ROLE_COLORS[user.role]
              )}>
                {ROLE_LABELS[user.role]}
              </span>
              {user.role === 'super_admin' && (
                <Link href="/admin/permissoes" title="Gerir permissões"
                  className="text-purple-300 hover:text-white transition-colors">
                  <ShieldCheck className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        )}
        {!user && <p className="text-slate-400 text-xs mt-1">Administração</p>}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-0.5">
        {visibleItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              href === active
                ? 'bg-[#00545F] text-white'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}

        <div className="pt-3 mt-2 border-t border-white/10">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
            Ver site público
          </Link>
        </div>
      </nav>

      {/* Quick actions */}
      {canUser({ role: role as AdminRole, permissions_extra: user?.permissions_extra, permissions_denied: user?.permissions_denied }, 'imoveis.create') && (
        <div className="px-4 pb-2 space-y-2">
          <Link
            href="/admin/imoveis/novo"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-[#00545F]/30 border border-[#00545F]/50 text-[#6BBFC9] text-xs font-semibold hover:bg-[#00545F]/50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Novo imóvel
          </Link>
        </div>
      )}

      {/* Language + Logout */}
      <div className="p-4 border-t border-white/10 space-y-1">
        <SidebarLang />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/10 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Terminar sessão
        </button>
      </div>
    </aside>
  )
}
