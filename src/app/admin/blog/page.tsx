import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Eye, FileText, EyeOff } from 'lucide-react'
import type { Artigo } from '@/types/database'

export const dynamic = 'force-dynamic'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminBlogPage() {
  const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
  const artigos = (data ?? []) as Artigo[]
  const publicados = artigos.filter((a) => a.publicado).length

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Blog / Notas</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{artigos.length} artigos · {publicados} publicados</p>
        </div>
        <Link href="/admin/blog/novo" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Novo Artigo
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E3E3] overflow-hidden">
        {artigos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
            <p className="font-serif font-semibold text-[#1F3F44] mb-1">Sem artigos</p>
            <Link href="/admin/blog/novo" className="mt-3 px-5 py-2.5 rounded-xl bg-[#00545F] text-white text-sm font-semibold hover:bg-[#006B78] transition-colors">
              Criar primeiro artigo
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E3E3] bg-[#F2EEEE]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Artigo</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden md:table-cell">Estado</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">Data</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#64748b] uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3E3]">
              {artigos.map((a) => (
                <tr key={a.id} className="hover:bg-[#F2EEEE]/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-[#F2EEEE] flex-shrink-0">
                        {a.imagem ? <img src={a.imagem} alt="" className="w-full h-full object-cover" /> : (
                          <div className="w-full h-full flex items-center justify-center text-[#94a3b8]">
                            <FileText className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#1F3F44] line-clamp-1">{a.titulo}</p>
                        <p className="text-[#94a3b8] text-xs">{a.categoria}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    {a.publicado ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        <Eye className="w-3 h-3" /> Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F2EEEE] text-[#94a3b8]">
                        <EyeOff className="w-3 h-3" /> Rascunho
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell text-[#64748b] text-xs">
                    {formatDate(a.publicado_em ?? a.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {a.publicado && (
                        <Link href={`/blog/${a.slug}`} target="_blank" className="p-2 rounded-lg text-[#94a3b8] hover:text-[#1F3F44] hover:bg-[#F2EEEE] transition-colors" title="Ver">
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                      <Link href={`/admin/blog/${a.id}`} className="p-2 rounded-lg text-[#94a3b8] hover:text-[#00545F] hover:bg-teal-50 transition-colors" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
