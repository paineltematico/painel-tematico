import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Plus, Pencil, Eye, FileText, EyeOff } from 'lucide-react'
import type { Artigo } from '@/types/database'

export const dynamic = 'force-dynamic'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminBlogPage() {
  const { data } = await supabaseAdmin.from('blog_posts').select('*').order('created_at', { ascending: false })
  const artigos = (data ?? []) as Artigo[]
  const publicados = artigos.filter((a) => a.publicado).length

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1F3F44]">Blog / Notas</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{artigos.length} artigos · {publicados} publicados</p>
        </div>
        <Link href="/admin/blog/novo" className="flex items-center gap-2 px-4 sm:px-5 min-h-11 py-2.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors shadow-sm flex-shrink-0">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Novo Artigo</span><span className="sm:hidden">Novo</span>
        </Link>
      </div>

      {artigos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8E3E3] flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
          <p className="font-serif font-semibold text-[#1F3F44] mb-1">Sem artigos</p>
          <Link href="/admin/blog/novo" className="mt-3 px-5 py-2.5 rounded-xl bg-[#00545F] text-white text-sm font-semibold hover:bg-[#006B78] transition-colors">
            Criar primeiro artigo
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {artigos.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-[#E8E3E3] p-3 sm:p-4 hover:shadow-md hover:border-[#00545F]/30 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 sm:w-14 sm:h-12 rounded-lg overflow-hidden bg-[#F2EEEE] flex-shrink-0">
                  {a.imagem ? <img src={a.imagem} alt="" className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center text-[#94a3b8]">
                      <FileText className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/admin/blog/${a.id}`} className="min-w-0 group">
                      <p className="font-medium text-[#1F3F44] group-hover:text-[#00545F] transition-colors line-clamp-1">{a.titulo}</p>
                      <p className="text-[#94a3b8] text-xs mt-0.5">{a.categoria} · {formatDate(a.publicado_em ?? a.created_at)}</p>
                    </Link>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {a.publicado && (
                        <Link href={`/blog/${a.slug}`} target="_blank" className="p-2 rounded-lg text-[#94a3b8] hover:text-[#1F3F44] hover:bg-[#F2EEEE] transition-colors" title="Ver">
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                      <Link href={`/admin/blog/${a.id}`} className="p-2 rounded-lg text-[#94a3b8] hover:text-[#00545F] hover:bg-teal-50 transition-colors" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="mt-2">
                    {a.publicado ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        <Eye className="w-3 h-3" /> Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F2EEEE] text-[#94a3b8]">
                        <EyeOff className="w-3 h-3" /> Rascunho
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
