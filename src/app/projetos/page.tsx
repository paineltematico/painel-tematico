import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProjetoCard from '@/components/ProjetoCard'
import type { Projeto } from '@/types/database'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Projetos em Curso' }

async function getProjetos(): Promise<Projeto[]> {
  const { data } = await supabase
    .from('projetos')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })
  return (data ?? []) as Projeto[]
}

export default async function ProjetosPage() {
  const projetos = await getProjetos()

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#1F3F44]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-[#6BBFC9] text-sm font-semibold uppercase tracking-widest">Empreendimentos</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
            Projetos em Curso
          </h1>
          <p className="text-slate-400 text-lg max-w-xl">
            Conheça os empreendimentos residenciais que a Painel Temático tem em desenvolvimento na região de Braga.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-20 bg-[#F2EEEE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {projetos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#94a3b8] text-lg">Projetos em breve.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {projetos.map((p) => (
                <ProjetoCard key={p.id} projeto={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}
