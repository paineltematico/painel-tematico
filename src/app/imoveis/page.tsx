import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ListingCard from '@/components/imoveis/ListingCard'
import FilterBar from '@/components/imoveis/FilterBar'
import Reveal from '@/components/motion/Reveal'
import TextReveal from '@/components/motion/TextReveal'
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
  const titulo =
    filters.tipo === 'Venda'
      ? 'Imóveis para venda'
      : filters.tipo === 'Arrendamento'
      ? 'Imóveis para arrendamento'
      : 'Todos os imóveis'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF9F7] pt-20">
        {/* ── Cabeçalho editorial ── */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-8 sm:pb-12">
          <Reveal from="up">
            <p className="text-[#00545F] text-xs font-semibold uppercase tracking-[0.25em] mb-3">
              Painel Temático · Braga
            </p>
          </Reveal>
          <TextReveal
            as="h1"
            text={titulo}
            className="font-serif font-bold text-[#1F3F44] tracking-tight"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', lineHeight: 1.02 }}
          />
          <Reveal from="up">
            <p className="text-[#6b7572] text-sm mt-4">
              {imoveis.length} imóve{imoveis.length !== 1 ? 'is' : 'l'}
              {activeFilters > 0 ? ' com os filtros aplicados' : ' disponíveis'} — fotografias reais,
              informação verificada pela nossa equipa.
            </p>
          </Reveal>
        </header>

        {/* ── Filtros (barra pegajosa) ── */}
        <Suspense fallback={null}>
          <FilterBar currentFilters={filters} />
        </Suspense>

        {/* ── Grelha ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {imoveis.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white ring-1 ring-[#ECE7DE] flex items-center justify-center mb-5">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#1F3F44] mb-2">
                Nenhum imóvel encontrado
              </h3>
              <p className="text-[#8a8377] text-sm max-w-xs">
                Experimente ajustar os filtros ou pesquisar por outros termos.
              </p>
            </div>
          ) : (
            <Reveal stagger className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {imoveis.map((imovel) => (
                <ListingCard key={imovel.id} imovel={imovel} />
              ))}
            </Reveal>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
