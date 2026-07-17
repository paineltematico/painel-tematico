import {
  LayoutDashboard, Home, Users, Settings, Building2, FileText,
  UserCog, HardHat, UsersRound, Handshake, UserCheck, BarChart2, ClipboardList, Lightbulb,
} from 'lucide-react'
import type { AdminRole } from '@/lib/auth'
import { canUser } from '@/lib/permissions'
import type { Permission } from '@/lib/permissions'

export interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  permission: Permission
  superAdminOnly?: boolean
  /** Rótulo curto para a bottom-nav (quando o normal é longo). */
  short?: string
  /** Mostrar na bottom-nav mobile (as 4 mais usadas). */
  primary?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard',    label: 'Dashboard',    icon: LayoutDashboard, permission: 'dashboard.view', primary: true, short: 'Início' },
  { href: '/admin/imoveis',      label: 'Imóveis',      icon: Home,            permission: 'imoveis.view', primary: true },
  { href: '/admin/leads',        label: 'Leads / CRM',  icon: Users,           permission: 'leads.view', primary: true, short: 'Leads' },
  { href: '/admin/leads/comerciais', label: 'Comerciais', icon: UserCheck,   permission: 'leads.comerciais' },
  { href: '/admin/oportunidades', label: 'Oportunidades', icon: Lightbulb,   permission: 'oportunidades.view', superAdminOnly: true, primary: true, short: 'Oport.' },
  { href: '/admin/estatisticas', label: 'Estatísticas', icon: BarChart2,      permission: 'estatisticas.view' },
  { href: '/admin/avaliacoes',   label: 'Avaliações',   icon: ClipboardList,  permission: 'avaliacoes.view' },
  { href: '/admin/projetos',     label: 'Projetos',     icon: Building2,       permission: 'projetos.view' },
  { href: '/admin/blog',         label: 'Blog',         icon: FileText,        permission: 'blog.view' },
  { href: '/admin/construcao',   label: 'Construção',   icon: HardHat,         permission: 'construcao.view' },
  { href: '/admin/equipa',       label: 'Equipa',       icon: UsersRound,      permission: 'equipa.view' },
  { href: '/admin/parceiros',    label: 'Parceiros',    icon: Handshake,       permission: 'leads.view' },
  { href: '/admin/definicoes',   label: 'Definições',   icon: Settings,        permission: 'definicoes.view' },
  { href: '/admin/utilizadores', label: 'Utilizadores', icon: UserCog,         permission: 'utilizadores.view' },
]

export interface NavUser {
  role: AdminRole
  permissions_extra?: string[]
  permissions_denied?: string[]
}

/** Filtra os itens de navegação visíveis para um utilizador. */
export function visibleNavItems(user: NavUser | null | undefined): NavItem[] {
  const role = user?.role ?? 'comercial'
  return NAV_ITEMS.filter((item) => {
    if (item.superAdminOnly && role !== 'super_admin') return false
    return canUser(
      { role, permissions_extra: user?.permissions_extra, permissions_denied: user?.permissions_denied },
      item.permission
    )
  })
}

/** Escolhe o href activo: o prefixo mais longo que casa com o pathname. */
export function activeHref(items: NavItem[], pathname: string): string | undefined {
  return items
    .map((i) => i.href)
    .filter((h) => pathname === h || pathname.startsWith(h + '/'))
    .sort((a, b) => b.length - a.length)[0]
}
