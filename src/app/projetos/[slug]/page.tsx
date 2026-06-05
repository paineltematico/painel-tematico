import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import ProjetoLuxury from './ProjetoLuxury'
import type { Projeto, Unidade, AtualizacaoObra, Testemunho } from '@/types/database'

interface Props { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabase.from('projetos').select('nome,subtitulo,imagem').eq('slug', slug).single()
  if (!data) return { title: 'Projeto não encontrado' }
  return {
    title: `${data.nome} | Painel Temático`,
    description: data.subtitulo ?? undefined,
    openGraph: { images: data.imagem ? [{ url: data.imagem }] : [] },
  }
}

export default async function ProjetoPage({ params }: Props) {
  const { slug } = await params
  const { data } = await supabase.from('projetos').select('*').eq('slug', slug).single()
  if (!data) notFound()
  const projeto = data as Projeto

  const [
    { data: unidadesData },
    { data: atualizacoesData },
    { data: testemunhosData },
  ] = await Promise.all([
    supabase.from('unidades').select('*').eq('projeto_id', projeto.id).order('ordem'),
    supabase.from('atualizacoes_obra').select('*').eq('projeto_id', projeto.id).eq('publicado', true).order('data_atualizacao', { ascending: false }).limit(12),
    supabase.from('testemunhos').select('*').eq('projeto_id', projeto.id).eq('publicado', true).order('ordem').limit(6),
  ])

  return (
    <ProjetoLuxury
      projeto={projeto}
      unidades={(unidadesData ?? []) as Unidade[]}
      atualizacoes={(atualizacoesData ?? []) as AtualizacaoObra[]}
      testemunhos={(testemunhosData ?? []) as Testemunho[]}
    />
  )
}
