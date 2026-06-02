import type { AdminRole } from './auth'

// ── Permission keys ────────────────────────────────────────────────────────────

export type Permission =
  | 'dashboard.view'
  | 'imoveis.view'
  | 'imoveis.create'
  | 'imoveis.edit'
  | 'imoveis.delete'
  | 'leads.view'
  | 'leads.create'
  | 'leads.edit'
  | 'leads.delete'
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
    'leads.view', 'leads.create', 'leads.edit', 'leads.delete',
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
    'leads.view', 'leads.create', 'leads.edit', 'leads.delete',
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
    'dashboard.view',
    'imoveis.view', 'imoveis.edit',
    'leads.view', 'leads.create', 'leads.edit',
    'projetos.view',
    'unidades.view',
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
