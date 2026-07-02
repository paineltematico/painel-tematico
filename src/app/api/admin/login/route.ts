import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyPassword, createToken, hashPassword, COOKIE_NAME } from '@/lib/auth'
import type { AdminRole } from '@/lib/auth'
import { rateLimit, clientIp } from '@/lib/rate-limit'

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
}

export async function POST(request: Request) {
  if (!rateLimit(`login:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Demasiadas tentativas. Tente novamente dentro de alguns minutos.' }, { status: 429 })
  }

  const body = await request.json()
  const { email, password } = body as { email?: string; password?: string }

  if (!password) {
    return NextResponse.json({ error: 'Palavra-passe obrigatória' }, { status: 400 })
  }

  // ── Path A: email + password against admin_users table ───────────────────
  if (email) {
        const { data: user, error: dbError } = await (supabaseAdmin as any)
      .from('admin_users')
      .select('id, email, nome, role, password_hash, ativo')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (dbError || !user) {
      return NextResponse.json({ error: 'Email ou palavra-passe incorretos' }, { status: 401 })
    }
    if (!user.ativo) {
      return NextResponse.json({ error: 'Conta desativada. Contacte o administrador.' }, { status: 403 })
    }

    const valid = await verifyPassword(password, user.password_hash as string)
    if (!valid) {
      return NextResponse.json({ error: 'Email ou palavra-passe incorretos' }, { status: 401 })
    }

    await (supabaseAdmin as any).from('admin_users').update({ ultimo_login: new Date().toISOString() }).eq('id', user.id)

    const token = createToken({
      id: user.id as string,
      email: user.email as string,
      nome: user.nome as string,
      role: user.role as AdminRole,
    })
    const response = NextResponse.json({ ok: true, role: user.role, nome: user.nome })
    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTS)
    return response
  }

  // ── Path B: legacy shared password (bootstrap / backward compat) ─────────
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Palavra-passe incorreta' }, { status: 401 })
  }

  const { count } = await supabase.from('admin_users').select('*', { count: 'exact', head: true })

  const bootstrapToken = createToken({
    id: 'bootstrap',
    email: 'admin@paineltematico.pt',
    nome: 'Super Admin',
    role: 'super_admin',
  })

  const response = NextResponse.json({
    ok: true,
    role: 'super_admin',
    nome: 'Super Admin',
    noUsers: (count ?? 0) === 0,
  })
  response.cookies.set(COOKIE_NAME, bootstrapToken, COOKIE_OPTS)
  response.cookies.set('admin_session', 'authenticated', COOKIE_OPTS)
  return response
}

// ── PUT: create first super_admin (one-time setup) ────────────────────────────
export async function PUT(request: Request) {
  const { nome, email, password } = await request.json()

  if (!nome || !email || !password) {
    return NextResponse.json({ error: 'Campos obrigatórios em falta' }, { status: 400 })
  }

  const { count } = await (supabaseAdmin as any).from('admin_users').select('*', { count: 'exact', head: true })
  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: 'Utilize o painel de utilizadores para adicionar membros.' }, { status: 409 })
  }

  const password_hash = await hashPassword(password)
  const { data, error } = await (supabaseAdmin as any).from('admin_users').insert({
    nome,
    email: email.toLowerCase().trim(),
    password_hash,
    role: 'super_admin',
    ativo: true,
  }).select('id, email, nome, role').single()

  if (error || !data) {
    return NextResponse.json({ error: 'Erro ao criar utilizador' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, user: data })
}
