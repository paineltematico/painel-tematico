import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Plus, Pencil, Eye, Building2 } from 'lucide-react'
import type { Projeto } from '@/types/database'

export const dynamic = 'force-dynamic'

const ESTADO_BADGE: Record<string, string> = {
  em_curso:   'bg-teal-50 text-teal-700',
  concluido:  'bg-emerald-50 text-emerald-700',
  brevemente: 'bg-amber-50 text-amber-700',
}
const ESTADO_LABEL: Record<string, string> = {
  em_curso: 'Em Curso', concluido: 'Concluído', brevemente: 'Brevemente',
}

export default async function AdminProjetosPage() {
  const { data } = await supabaseAdmin.from('projetos').select('*').order('ordem', { ascending: true })
  const projetos = (data ?? []) as Projeto[]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1F3F44]">Projetos</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{projetos.length} empreendimentos</p>
        </div>
        <Link href="/admin/projetos/novo" className="flex items-center gap-2 px-4 sm:px-5 min-h-11 py-2.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors shadow-sm flex-shrink-0">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Novo Projeto</span><span className="sm:hidden">Novo</span>
        </Link>
      </div>

      {projetos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8E3E3] flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
          <p className="font-serif font-semibold text-[#1F3F44] mb-1">Sem projetos</p>
          <Link href="/admin/projetos/novo" className="mt-3 px-5 py-2.5 rounded-xl bg-[#00545F] text-white text-sm font-semibold hover:bg-[#006B78] transition-colors">
            Adicionar projeto
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {projetos.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-[#E8E3E3] p-3 sm:p-4 hover:shadow-md hover:border-[#00545F]/30 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 sm:w-14 sm:h-12 rounded-lg overflow-hidden bg-[#1F3F44] flex-shrink-0">
                  {p.imagem ? <img src={p.imagem} alt="" className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-bold">PT</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/admin/projetos/${p.id}`} className="min-w-0 group">
                      <p className="font-medium text-[#1F3F44] group-hover:text-[#00545F] transition-colors line-clamp-1">{p.nome}</p>
                      <p className="text-[#94a3b8] text-xs mt-0.5">{p.cidade} · Ordem {p.ordem}</p>
                    </Link>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <Link href={`/projetos/${p.slug}`} target="_blank" className="p-2 rounded-lg text-[#94a3b8] hover:text-[#1F3F44] hover:bg-[#F2EEEE] transition-colors" title="Ver">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/projetos/${p.id}`} className="p-2 rounded-lg text-[#94a3b8] hover:text-[#00545F] hover:bg-teal-50 transition-colors" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${ESTADO_BADGE[p.estado]}`}>
                      {ESTADO_LABEL[p.estado]}
                    </span>
                    {p.unidades_disponiveis !== null && (
                      <span className="text-xs text-[#64748b]">{p.unidades_disponiveis} disponíveis</span>
                    )}
                    {!p.ativo && <span className="text-xs text-[#94a3b8]">Oculto</span>}
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
