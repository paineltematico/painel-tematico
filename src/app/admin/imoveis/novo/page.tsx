import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import ImovelForm from '@/components/ImovelForm'

export default function NovoImovelPage() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#94a3b8] mb-6">
        <Link href="/admin/imoveis" className="hover:text-[#1F3F44] transition-colors">Imóveis</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#1F3F44] font-medium">Novo Imóvel</span>
      </nav>

      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Novo Imóvel</h1>
        <p className="text-[#64748b] text-sm mt-0.5">Preencha os dados e publique o imóvel no site.</p>
      </div>

      <ImovelForm />
    </div>
  )
}
