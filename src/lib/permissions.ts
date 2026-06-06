import type { AdminRole } from './auth'

// ── Permission keys ────────────────────────────────────────────────────────────

export type Permission =
  | 'dashboard.view'
  | 'imoveis.view'
  | 'imoveis.create'
  | 'imoveis.edit'
  | 'imoveis.delete'
  | 'leads.view'
  | 'leads.view_all'
  | 'leads.create'
  | 'leads.edit'
  | 'leads.delete'
  | 'leads.archive'
  | 'leads.comerciais'
  | 'parceiros.archive'
  | 'parceiros.delete'
  | 'estatisticas.view'
  | 'avaliacoes.view'
  | 'projetos.view'
  | 'projetos.create'
  | 'projetos.edit'
  | 'projetos.delete'
  | 'unidades.view'
  | 'unidades.edit'
  | 'obra.view'
  | 'obra.edit'
  | 'blog.view'
  | 'blog.create'
  | 'blog.edit'
  | 'blog.delete'
  | 'construcao.view'
  | 'construcao.edit'
  | 'equipa.view'
  | 'equipa.edit'
  | 'testemunhos.view'
  | 'testemunhos.edit'
  | 'definicoes.view'
  | 'definicoes.edit'
  | 'utilizadores.view'
  | 'utilizadores.create'
  | 'utilizadores.edit'
  | 'utilizadores.delete'

// ── Permission map per role ───────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: [
    'dashboard.view',
    'imoveis.view', 'imoveis.create', 'imoveis.edit', 'imoveis.delete',
    'leads.view', 'leads.view_all', 'leads.create', 'leads.edit', 'leads.delete', 'leads.archive', 'leads.comerciais',
    'parceiros.archive', 'parceiros.delete', 'estatisticas.view', 'avaliacoes.view',
    'projetos.view', 'projetos.create', 'projetos.edit', 'projetos.delete',
    'unidades.view', 'unidades.edit',
    'obra.view', 'obra.edit',
    'blog.view', 'blog.create', 'blog.edit', 'blog.delete',
    'construcao.view', 'construcao.edit',
    'equipa.view', 'equipa.edit',
    'testemunhos.view', 'testemunhos.edit',
    'definicoes.view', 'definicoes.edit',
    'utilizadores.view', 'utilizadores.create', 'utilizadores.edit', 'utilizadores.delete',
  ],
  diretor: [
    'dashboard.view',
    'imoveis.view', 'imoveis.create', 'imoveis.edit', 'imoveis.delete',
    'leads.view', 'leads.view_all', 'leads.create', 'leads.edit', 'leads.delete', 'leads.archive', 'leads.comerciais',
    'parceiros.archive', 'parceiros.delete', 'estatisticas.view', 'avaliacoes.view',
    'projetos.view', 'projetos.create', 'projetos.edit', 'projetos.delete',
    'unidades.view', 'unidades.edit',
    'obra.view', 'obra.edit',
    'blog.view', 'blog.create', 'blog.edit', 'blog.delete',
    'construcao.view', 'construcao.edit',
    'equipa.view', 'equipa.edit',
    'testemunhos.view', 'testemunhos.edit',
    'definicoes.view', 'definicoes.edit',
  ],
  comercial: [
    // Apenas Imóveis, Leads e Parceiros (Parceiros usa 'leads.view').
    // Pode angariar (criar) imóveis e gerir os seus leads.
    'dashboard.view', 'estatisticas.view',
    'imoveis.view', 'imoveis.create', 'imoveis.edit',
    'leads.view', 'leads.create', 'leads.edit', 'leads.archive',
    'parceiros.archive',
  ],
  marketing: [
    'dashboard.view',
    'imoveis.view',
    'projetos.view',
    'blog.view', 'blog.create', 'blog.edit',
    'construcao.view', 'construcao.edit',
    'equipa.view', 'equipa.edit',
    'testemunhos.view', 'testemunhos.edit',
  ],
  gestor_projeto: [
    'dashboard.view',
    'projetos.view', 'projetos.edit',
    'unidades.view', 'unidades.edit',
    'obra.view', 'obra.edit',
    'construcao.view', 'construcao.edit',
    'testemunhos.view', 'testemunhos.edit',
  ],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function can(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/** Checks permission for a specific user, respecting per-user overrides */
export function canUser(
  user: { role: AdminRole; permissions_extra?: string[]; permissions_denied?: string[] },
  permission: Permission
): boolean {
  if (user.permissions_denied?.includes(permission)) return false
  if (user.permissions_extra?.includes(permission))  return true
  return can(user.role, permission)
}

export { ROLE_PERMISSIONS }

export function canAll(role: AdminRole, permissions: Permission[]): boolean {
  return permissions.every((p) => can(role, p))
}

export function canAny(role: AdminRole, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p))
}

// Nav items each role can see
export const NAV_PERMISSIONS: Record<string, Permission> = {
  '/admin/dashboard':   'dashboard.view',
  '/admin/imoveis':     'imoveis.view',
  '/admin/leads':       'leads.view',
  '/admin/projetos':    'projetos.view',
  '/admin/blog':        'blog.view',
  '/admin/construcao':  'construcao.view',
  '/admin/equipa':      'equipa.view',
  '/admin/definicoes':  'definicoes.view',
  '/admin/utilizadores':'utilizadores.view',
}
