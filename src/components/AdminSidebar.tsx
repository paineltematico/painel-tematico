'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Home, Users, Settings, Building2, FileText,
  LogOut, Plus, ExternalLink, UserCog, HardHat, UsersRound, Handshake, ShieldCheck, X, UserCheck, BarChart2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdminRole } from '@/lib/auth'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/auth'
import { canUser } from '@/lib/permissions'
import type { Permission } from '@/lib/permissions'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  permission: Permission
  superAdminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard',    label: 'Dashboard',    icon: LayoutDashboard, permission: 'dashboard.view' },
  { href: '/admin/imoveis',      label: 'Imóveis',      icon: Home,            permission: 'imoveis.view' },
  { href: '/admin/leads',        label: 'Leads / CRM',  icon: Users,           permission: 'leads.view' },
  { href: '/admin/leads/comerciais', label: 'Comerciais', icon: UserCheck,   permission: 'leads.comerciais' },
  { href: '/admin/estatisticas', label: 'Estatísticas', icon: BarChart2,      permission: 'estatisticas.view' },
  { href: '/admin/projetos',     label: 'Projetos',     icon: Building2,       permission: 'projetos.view' },
  { href: '/admin/blog',         label: 'Blog',         icon: FileText,        permission: 'blog.view' },
  { href: '/admin/construcao',   label: 'Construção',   icon: HardHat,         permission: 'construcao.view' },
  { href: '/admin/equipa',       label: 'Equipa',       icon: UsersRound,      permission: 'equipa.view' },
  { href: '/admin/parceiros',    label: 'Parceiros',    icon: Handshake,       permission: 'leads.view' },
  { href: '/admin/definicoes',   label: 'Definições',   icon: Settings,        permission: 'definicoes.view' },
  { href: '/admin/utilizadores', label: 'Utilizadores', icon: UserCog,         permission: 'utilizadores.view' },
]

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

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.superAdminOnly && role !== 'super_admin') return false
    return canUser(
      { role: role as AdminRole, permissions_extra: user?.permissions_extra, permissions_denied: user?.permissions_denied },
      item.permission
    )
  })

  // Realce: escolhe o item cujo href é o prefixo mais longo do caminho atual
  const activeHref = visibleItems
    .map((i) => i.href)
    .filter((h) => pathname === h || pathname.startsWith(h + '/'))
    .sort((a, b) => b.length - a.length)[0]

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
              href === activeHref
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

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
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
