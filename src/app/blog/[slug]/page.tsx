import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ArtigoCard from '@/components/ArtigoCard'
import { ArrowLeft, Clock } from 'lucide-react'
import type { Artigo } from '@/types/database'

interface Props { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
}

function readingTime(text: string | null) {
  if (!text) return '1 min'
  const words = text.trim().split(/\s+/).length
  return `${Math.max(1, Math.ceil(words / 200))} min`
}

export default async function ArtigoPage({ params }: Props) {
  const { slug } = await params

  const { data: artigo } = await supabase.from('blog_posts').select('*').eq('slug', slug).single()
  if (!artigo || !artigo.publicado) notFound()

  // Related articles
  const { data: relacionados } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('publicado', true)
    .neq('slug', slug)
    .limit(4)

  const a = artigo as Artigo

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white">
        {/* Cover image */}
        {a.imagem && (
          <div className="relative h-[50vh] min-h-[320px] overflow-hidden bg-[#1F3F44]">
            <img src={a.imagem} alt={a.titulo} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {/* Article header */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-[#1F3F44] text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Todas as notas
          </Link>
          <span className="text-xs font-semibold text-[#00545F] uppercase tracking-widest">{a.categoria}</span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F3F44] leading-tight mt-3 mb-4">
            {a.titulo}
          </h1>
          <div className="flex items-center gap-4 text-[#94a3b8] text-sm">
            <span>{formatDate(a.publicado_em ?? a.created_at)}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {readingTime(a.conteudo)} leitura
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-[#E8E3E3] my-8" />
        </div>

        {/* Body */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {a.resumo && (
            <p className="text-[#1F3F44] text-xl font-light leading-relaxed mb-8 border-l-4 border-[#00545F] pl-5">
              {a.resumo}
            </p>
          )}
          {a.conteudo && (
            <div className="prose prose-lg prose-slate max-w-none
              prose-headings:font-serif prose-headings:text-[#1F3F44]
              prose-a:text-[#00545F] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-[#1F3F44]">
              {a.conteudo.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-[#475569] leading-relaxed mb-5">{paragraph}</p>
              ))}
            </div>
          )}
        </article>

        {/* Related */}
        {relacionados && relacionados.length > 0 && (
          <section className="border-t border-[#E8E3E3] bg-[#F2EEEE] py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif text-2xl font-bold text-[#1F3F44] mb-8">Mais notas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {(relacionados as Artigo[]).map((r) => (
                  <ArtigoCard key={r.id} artigo={r} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  )
}
