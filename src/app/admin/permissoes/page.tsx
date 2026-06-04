import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import PermissoesEditor from './PermissoesEditor'
import type { AdminRole } from '@/lib/auth'

export const metadata = { title: 'Permissões | Admin' }

interface DBUser {
  id: string
  nome: string
  email: string
  role: AdminRole
  ativo: boolean
  permissions_extra:  string[] | null
  permissions_denied: string[] | null
}

async function getUsers(): Promise<DBUser[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from('admin_users')
    .select('id, nome, email, role, ativo, permissions_extra, permissions_denied')
    .order('role')
  return (data ?? []) as DBUser[]
}

export default async function PermissoesPage() {
  const me = await getCurrentUser()
  if (!me || me.role !== 'super_admin') redirect('/admin/dashboard')

  const users = await getUsers()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-purple-700" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Permissões</h1>
          <p className="text-[#64748b] text-sm">Controla o acesso de cada utilizador ao back office</p>
        </div>
      </div>

      <PermissoesEditor users={users} currentUserId={me.id} />
    </div>
  )
}
