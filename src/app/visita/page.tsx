import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import VisitaForm from './VisitaForm'

export const metadata: Metadata = {
  title: 'Agendar Visita | Painel Temático',
  description: 'Agende uma visita a um dos nossos imóveis. Escolha o dia e hora que mais lhe convém.',
}

interface Props {
  searchParams: Promise<{ imovel?: string }>
}

async function getImoveis() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from('imoveis')
    .select('id, titulo, tipologia, cidade, tipo')
    .eq('disponivel', true)
    .order('titulo')
  return data ?? []
}

export default async function VisitaPage({ searchParams }: Props) {
  const { imovel: imovelId } = await searchParams
  const imoveis = await getImoveis()
  const imovelPreSelected = imoveis.find(i => i.id === imovelId) ?? null

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f4f7f7] pt-20">

        {/* Hero */}
        <div className="bg-[#1F3F44] py-12 px-6 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">
            Agendar Visita
          </h1>
          <p className="text-white/70 text-sm max-w-md mx-auto">
            Escolha o dia e hora que mais lhe convém.<br />
            Confirmamos o agendamento em breve.
          </p>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto px-4 py-10">
          <VisitaForm imoveis={imoveis} imovelPreSelected={imovelPreSelected} />
        </div>

      </main>
      <Footer />
    </>
  )
}
