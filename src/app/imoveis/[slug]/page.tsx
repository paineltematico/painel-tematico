import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'
import ImovelShowcase from './ImovelShowcase'
import Footer from '@/components/Footer'
import type { Imovel } from '@/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

async function getImovel(slug: string): Promise<Imovel | null> {
  const { data } = await supabaseAdmin
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

  let angariador: { nome: string; role: string } | null = null

  if (imovel.angariador_id) {
    const { data } = await supabaseAdmin
      .from('admin_users')
      .select('nome, role')
      .eq('id', imovel.angariador_id)
      .single()
    if (data) {
      angariador = { nome: data.nome as string, role: data.role as string }
    }
  }

  return (
    <>
      <ImovelShowcase imovel={imovel} angariador={angariador} />
      <Footer />
    </>
  )
}
