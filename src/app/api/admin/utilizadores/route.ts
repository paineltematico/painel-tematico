import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/auth'
import { getCurrentUser } from '@/lib/auth-server'
import { can } from '@/lib/permissions'
import type { AdminRole } from '@/lib/auth'

// GET /api/admin/utilizadores — list all users
export async function GET() {
  const me = await getCurrentUser()
  if (!me || !can(me.role, 'utilizadores.view')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, nome, role, ativo, ultimo_login, created_at')
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data })
}

// POST /api/admin/utilizadores — create new user
export async function POST(request: Request) {
  const me = await getCurrentUser()
  if (!me || !can(me.role, 'utilizadores.create')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { nome, email, password, role } = await request.json()

  if (!nome || !email || !password || !role) {
    return NextResponse.json({ error: 'Campos obrigatórios em falta' }, { status: 400 })
  }

  // Only super_admin can create other super_admins
  if (role === 'super_admin' && me.role !== 'super_admin') {
    return NextResponse.json({ error: 'Sem permissão para criar Super Admin' }, { status: 403 })
  }

  const password_hash = await hashPassword(password)

  const { data, error } = await supabase.from('admin_users').insert({
    nome,
    email: email.toLowerCase().trim(),
    password_hash,
    role: role as AdminRole,
    ativo: true,
  }).select('id, email, nome, role, ativo, created_at').single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Este email já está registado' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ user: data }, { status: 201 })
}
