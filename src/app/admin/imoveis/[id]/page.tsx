import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ImovelForm from '@/components/ImovelForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarImovelPage({ params }: Props) {
  const { id } = await params
  const { data: imovel } = await supabase
    .from('imoveis')
    .select('*')
    .eq('id', id)
    .single()

  if (!imovel) notFound()

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#94a3b8] mb-6">
        <Link href="/admin/imoveis" className="hover:text-[#1F3F44] transition-colors">Imóveis</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#1F3F44] font-medium truncate max-w-xs">{imovel.titulo}</span>
      </nav>

      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Editar Imóvel</h1>
        <p className="text-[#64748b] text-sm mt-0.5">{imovel.titulo}</p>
      </div>

      <ImovelForm imovel={imovel} />
    </div>
  )
}
