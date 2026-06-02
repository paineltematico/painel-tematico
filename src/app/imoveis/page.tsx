import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import PropertyCard from '@/components/PropertyCard'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ImovelFilters from '@/components/ImovelFilters'
import type { Imovel } from '@/types/database'

interface SearchParams {
  q?: string
  tipo?: string
  tipologia?: string
  min?: string
  max?: string
}

async function getImoveis(filters: SearchParams): Promise<Imovel[]> {
  let query = supabase
    .from('imoveis')
    .select('*')
    .eq('disponivel', true)
    .order('destaque', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters.tipo) query = query.eq('tipo', filters.tipo as 'Venda' | 'Arrendamento')
  if (filters.tipologia) query = query.eq('tipologia', filters.tipologia as 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T4+')
  if (filters.min) query = query.gte('preco', Number(filters.min))
  if (filters.max) query = query.lte('preco', Number(filters.max))

  if (filters.q) {
    const term = `%${filters.q}%`
    query = query.or(
      `titulo.ilike.${term},cidade.ilike.${term},distrito.ilike.${term},localizacao.ilike.${term},tipologia.ilike.${term}`
    )
  }

  const { data } = await query
  return data ?? []
}

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const filters = await searchParams
  const imoveis = await getImoveis(filters)

  const activeFilters = Object.values(filters).filter(Boolean).length

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f8fafc] pt-20">

        {/* Header */}
        <div className="bg-white border-b border-[#e2e8f0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="font-serif text-3xl font-bold text-[#1F3F44] mb-1">
              {filters.tipo === 'Venda'
                ? 'Imóveis para Venda'
                : filters.tipo === 'Arrendamento'
                ? 'Imóveis para Arrendamento'
                : 'Todos os Imóveis'}
            </h1>
            <p className="text-[#64748b] text-sm">
              {imoveis.length} imóve{imoveis.length !== 1 ? 'is' : 'l'} encontrado{imoveis.length !== 1 ? 's' : ''}
              {activeFilters > 0 && ' com os filtros aplicados'}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar Filters */}
            <aside className="lg:w-72 flex-shrink-0">
              <Suspense fallback={null}>
                <ImovelFilters currentFilters={filters} />
              </Suspense>
            </aside>

            {/* Grid */}
            <div className="flex-1">
              {imoveis.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#e2e8f0] flex items-center justify-center mb-4">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#1F3F44] mb-2">
                    Nenhum imóvel encontrado
                  </h3>
                  <p className="text-[#64748b] text-sm max-w-xs">
                    Tente ajustar os filtros ou pesquisar por outros termos.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {imoveis.map((imovel) => (
                    <PropertyCard key={imovel.id} imovel={imovel} featured={imovel.destaque} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
