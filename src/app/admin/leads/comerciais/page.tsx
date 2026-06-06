import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'
import ComerciaisManager from '@/components/crm/ComerciaisManager'

export const dynamic = 'force-dynamic'

export default async function ComerciaisPage() {
  const me = await getCurrentUser()
  if (!me) redirect('/admin/login')
  if (!canUser(me, 'leads.comerciais')) redirect('/admin/leads')

  const [{ data: leads }, { data: users }] = await Promise.all([
    supabaseAdmin
      .from('contactos_imoveis')
      .select('*')
      .eq('arquivado', false)
      .order('updated_at', { ascending: false }),
    supabaseAdmin
      .from('admin_users')
      .select('id, nome, email, role')
      .order('nome', { ascending: true }),
  ])

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#94a3b8] mb-6">
        <Link href="/admin/leads" className="hover:text-[#1F3F44] transition-colors">Leads</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#1F3F44] font-medium">Comerciais</span>
      </nav>

      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Gestão de Comerciais</h1>
        <p className="text-[#64748b] text-sm mt-0.5">
          Leads agrupados por responsável. Transfere leads entre comerciais conforme necessário.
        </p>
      </div>

      <ComerciaisManager
        leads={leads ?? []}
        users={users ?? []}
        meId={me.id}
      />
    </div>
  )
}
