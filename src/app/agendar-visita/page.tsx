import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import AgendarVisitaForm from './AgendarVisitaForm'

export const metadata: Metadata = {
  title: 'Agendar Visita | Painel Temático',
  description: 'Portal de agendamento de visitas para mediadores imobiliários parceiros.',
  robots: { index: false, follow: false }, // Não indexar nos motores de busca
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

export default async function AgendarVisitaPage() {
  const imoveis = await getImoveis()

  return (
    <div className="min-h-screen bg-[#f4f7f7]">

      {/* Header */}
      <header className="bg-[#1F3F44] py-10 px-6 text-center">
        <img src="/logos/logo-white.png" alt="Painel Temático" className="h-10 mx-auto mb-6 object-contain" />
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">
          Agendar Visita
        </h1>
        <p className="text-white/70 text-sm max-w-md mx-auto">
          Portal exclusivo para mediadores imobiliários parceiros.<br />
          Preencha o formulário para agendar uma visita com o seu cliente.
        </p>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 py-10">
        <AgendarVisitaForm imoveis={imoveis} />
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-[#94a3b8]">
        Painel Temático · AMI 25031 · IMPIC 69636
      </footer>
    </div>
  )
}
