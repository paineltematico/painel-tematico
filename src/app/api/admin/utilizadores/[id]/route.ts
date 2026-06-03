import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { hashPassword } from '@/lib/auth'
import { getCurrentUser } from '@/lib/auth-server'
import { can } from '@/lib/permissions'

interface Params { params: Promise<{ id: string }> }

// PATCH /api/admin/utilizadores/[id] — update user
export async function PATCH(request: Request, { params }: Params) {
  const me = await getCurrentUser()
  if (!me || !can(me.role, 'utilizadores.edit')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()

  type AdminUpdate = { nome?: string; role?: string; ativo?: boolean; password_hash?: string }
  const updates: AdminUpdate = {}
  if (body.nome)  updates.nome = body.nome
  if (body.role)  updates.role = body.role
  if (typeof body.ativo === 'boolean') updates.ativo = body.ativo
  if (body.password) updates.password_hash = await hashPassword(body.password)

  // Prevent demoting the only super_admin
  if (body.role && body.role !== 'super_admin') {
    const { count } = await (supabaseAdmin as any)
      .from('admin_users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'super_admin')
      .eq('ativo', true)

    const { data: target } = await (supabaseAdmin as any)
      .from('admin_users').select('role').eq('id', id).single()
    if (target?.role === 'super_admin' && (count ?? 0) <= 1) {
      return NextResponse.json({ error: 'Deve existir pelo menos um Super Admin ativo' }, { status: 400 })
    }
  }

  const { data, error } = await (supabaseAdmin as any)
    .from('admin_users').update(updates).eq('id', id)
    .select('id, email, nome, role, ativo').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ user: data })
}

// DELETE /api/admin/utilizadores/[id] — delete user
export async function DELETE(_: Request, { params }: Params) {
  const me = await getCurrentUser()
  if (!me || !can(me.role, 'utilizadores.delete')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params

  if (id === me.id) {
    return NextResponse.json({ error: 'Não pode eliminar a sua própria conta' }, { status: 400 })
  }

  const { error } = await (supabaseAdmin as any).from('admin_users').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
