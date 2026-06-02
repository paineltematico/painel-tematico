import crypto from 'crypto'

// ── Types ────────────────────────────────────────────────────────────────────

export type AdminRole = 'super_admin' | 'diretor' | 'comercial' | 'marketing' | 'gestor_projeto'

export interface AdminUser {
  id: string
  email: string
  nome: string
  role: AdminRole
}

export interface SessionPayload extends AdminUser {
  exp: number // Unix timestamp
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const COOKIE_NAME = 'admin_token'
const TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60 // 7 days
const JWT_SECRET = process.env.ADMIN_JWT_SECRET ?? 'default-insecure-secret-change-in-prod'

// ── Password hashing (Node.js crypto — not available in Edge) ────────────────

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex')
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err)
      else resolve(`${salt}:${key.toString('hex')}`)
    })
  })
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, storedKey] = hash.split(':')
    if (!salt || !storedKey) { resolve(false); return }
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err)
      else resolve(storedKey === key.toString('hex'))
    })
  })
}

// ── Token creation/verification (Node.js only) ────────────────────────────────

function hmac(data: string): string {
  return crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url')
}

export function createToken(user: AdminUser): string {
  const payload: SessionPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS,
  }
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = hmac(data)
  return `${data}.${sig}`
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const dotIdx = token.lastIndexOf('.')
    if (dotIdx === -1) return null
    const data = token.slice(0, dotIdx)
    const sig = token.slice(dotIdx + 1)
    if (hmac(data) !== sig) return null
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as SessionPayload
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

// ── Role display helpers ──────────────────────────────────────────────────────

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin:    'Super Admin',
  diretor:        'Diretor',
  comercial:      'Comercial',
  marketing:      'Marketing',
  gestor_projeto: 'Gestor de Projeto',
}

export const ROLE_COLORS: Record<AdminRole, string> = {
  super_admin:    'bg-purple-100 text-purple-700 border-purple-200',
  diretor:        'bg-blue-100 text-blue-700 border-blue-200',
  comercial:      'bg-emerald-100 text-emerald-700 border-emerald-200',
  marketing:      'bg-orange-100 text-orange-700 border-orange-200',
  gestor_projeto: 'bg-teal-100 text-teal-700 border-teal-200',
}
