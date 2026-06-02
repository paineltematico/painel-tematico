import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ArtigoCard from '@/components/ArtigoCard'
import type { Artigo } from '@/types/database'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Notas — Mercado Imobiliário' }

async function getArtigos(): Promise<Artigo[]> {
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('publicado', true)
    .order('publicado_em', { ascending: false })
  return (data ?? []) as Artigo[]
}

export default async function BlogPage() {
  const artigos = await getArtigos()

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header — estilo Zome Notes */}
          <div className="mb-14">
            <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl font-bold text-[#1F3F44] leading-none tracking-tight">
              Notas
            </h1>
            <p className="text-[#64748b] text-lg mt-4 max-w-lg">
              Perspetivas sobre o mercado imobiliário, dicas de investimento e tendências do setor.
            </p>
          </div>

          {artigos.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-[#94a3b8] text-lg">Em breve — os primeiros artigos estão a caminho.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {artigos.map((artigo) => (
                <ArtigoCard key={artigo.id} artigo={artigo} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
