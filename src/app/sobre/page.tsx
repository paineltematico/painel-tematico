import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { getSettings } from '@/lib/settings'
import type { MembroEquipa } from '@/types/database'
import SobreClient from './SobreClient'

async function getEquipa(): Promise<MembroEquipa[]> {
  const { data } = await supabase
    .from('equipa')
    .select('*')
    .eq('ativo', true)
    .order('ordem')
  return (data ?? []) as MembroEquipa[]
}

export const metadata = {
  title: 'Sobre Nós | Painel Temático',
  description: 'Conheça a Painel Temático — empresa de construção e promoção imobiliária com foco em qualidade, confiança e transparência. Baseada em Braga desde 2015.',
}

export default async function SobreNosPage() {
  const [equipa, settings] = await Promise.all([getEquipa(), getSettings()])

  return (
    <>
      <Navbar />
      <SobreClient
        equipa={equipa}
        sobreTexto={settings.sobre_texto ?? ''}
        amiNumero={settings.ami_numero ?? ''}
      />
      <Footer />
    </>
  )
}
