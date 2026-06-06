import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, UserCircle2, AlertTriangle } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-admin'
import ImovelForm from '@/components/ImovelForm'
import AngariracaoPerdidaButton from '@/components/admin/AngariracaoPerdidaButton'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarImovelPage({ params }: Props) {
  const { id } = await params
  const { data: imovel } = await supabaseAdmin
    .from('imoveis')
    .select('*')
    .eq('id', id)
    .single()

  if (!imovel) notFound()

  let angariador: string | null = null
  if (imovel.angariador_id) {
    const { data } = await supabaseAdmin
      .from('admin_users')
      .select('nome')
      .eq('id', imovel.angariador_id)
      .single()
    angariador = data?.nome ?? null
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#94a3b8] mb-6">
        <Link href="/admin/imoveis" className="hover:text-[#1F3F44] transition-colors">Imóveis</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#1F3F44] font-medium truncate max-w-xs">{imovel.titulo}</span>
      </nav>

      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Editar Imóvel</h1>
        <p className="text-[#64748b] text-sm mt-0.5">{imovel.titulo}</p>
      </div>

      {/* Banner angariação perdida */}
      {imovel.angariacao_perdida && (
        <div className="flex items-start gap-3 mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800">Angariação perdida</p>
            {imovel.angariacao_perdida_motivo && <p className="text-xs text-red-600 mt-0.5">{imovel.angariacao_perdida_motivo}</p>}
          </div>
        </div>
      )}

      {/* Angariação */}
      {angariador && (
        <div className="flex items-center justify-between gap-3 mb-6 px-4 py-3 rounded-xl bg-[#00545F]/5 border border-[#00545F]/20">
          <div className="flex items-center gap-2">
            <UserCircle2 className="w-4 h-4 text-[#00545F] flex-shrink-0" />
            <p className="text-sm text-[#1F3F44]">
              Angariação de <strong>{angariador}</strong>
            </p>
          </div>
          <AngariracaoPerdidaButton
            imovelId={imovel.id}
            perdida={imovel.angariacao_perdida ?? false}
            motivo={imovel.angariacao_perdida_motivo}
          />
        </div>
      )}

      <ImovelForm imovel={imovel} />
    </div>
  )
}
