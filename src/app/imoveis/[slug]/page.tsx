import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import ImovelLuxury from './ImovelLuxury'
import type { Imovel } from '@/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

async function getImovel(slug: string): Promise<Imovel | null> {
  const { data } = await supabase
    .from('imoveis')
    .select('*')
    .eq('slug', slug)
    .eq('disponivel', true)
    .single()
  return data as Imovel | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const imovel = await getImovel(slug)
  if (!imovel) return { title: 'Imóvel não encontrado' }
  return {
    title: `${imovel.titulo} | Painel Temático`,
    description: imovel.descricao ?? undefined,
    openGraph: {
      images: imovel.fotos?.[0] ? [{ url: imovel.fotos[0] }] : [],
    },
  }
}

export default async function ImovelPage({ params }: Props) {
  const { slug } = await params
  const imovel = await getImovel(slug)
  if (!imovel) notFound()

  return <ImovelLuxury imovel={imovel} />
}
