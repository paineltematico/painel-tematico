import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ArtigoForm from '@/components/ArtigoForm'
import type { Artigo } from '@/types/database'

interface Props { params: Promise<{ id: string }> }

export default async function EditarArtigoPage({ params }: Props) {
  const { id } = await params
  const { data } = await supabase.from('blog_posts').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Editar artigo</h1>
      </div>
      <ArtigoForm artigo={data as Artigo} />
    </div>
  )
}
