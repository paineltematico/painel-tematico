import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import ProjetoForm from '@/components/ProjetoForm'
import { Home, HardHat, ExternalLink } from 'lucide-react'
import type { Projeto } from '@/types/database'

interface Props { params: Promise<{ id: string }> }

export default async function EditarProjetoPage({ params }: Props) {
  const { id } = await params
  const { data } = await supabaseAdmin.from('projetos').select('*').eq('id', id).single()
  if (!data) notFound()

  const projeto = data as Projeto
  const subPages = [
    { href: `/admin/projetos/${id}/unidades`,     icon: Home,     label: 'Frações',          desc: 'Gerir disponibilidade' },
    { href: `/admin/projetos/${id}/atualizacoes`, icon: HardHat,  label: 'Evolução da Obra', desc: 'Atualizações de progresso' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Editar: {projeto.nome}</h1>
        <div className="flex items-center gap-2 mt-3">
          <Link href={`/projetos/${projeto.slug}`} target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-[#00545F] hover:underline">
            <ExternalLink className="w-3 h-3" /> Ver no site
          </Link>
        </div>
      </div>

      {/* Sub-page navigation */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {subPages.map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href}
            className="flex items-center gap-3 bg-white rounded-2xl border border-[#e2e8f0] p-4 hover:border-[#00545F]/30 hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-[#00545F]" />
            </div>
            <div>
              <p className="font-semibold text-[#1F3F44] text-sm group-hover:text-[#00545F]">{label}</p>
              <p className="text-xs text-[#94a3b8]">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <ProjetoForm projeto={projeto} />
    </div>
  )
}
