import Link from 'next/link'
import { supabase } from '@/lib/supabase'
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
  const { data } = await supabase.from('projetos').select('*').order('ordem', { ascending: true })
  const projetos = (data ?? []) as Projeto[]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Projetos</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{projetos.length} empreendimentos</p>
        </div>
        <Link href="/admin/projetos/novo" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Novo Projeto
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E3E3] overflow-hidden">
        {projetos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
            <p className="font-serif font-semibold text-[#1F3F44] mb-1">Sem projetos</p>
            <Link href="/admin/projetos/novo" className="mt-3 px-5 py-2.5 rounded-xl bg-[#00545F] text-white text-sm font-semibold hover:bg-[#006B78] transition-colors">
              Adicionar projeto
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E3E3] bg-[#F2EEEE]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Projeto</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden md:table-cell">Estado</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">Unidades</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#64748b] uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3E3]">
              {projetos.map((p) => (
                <tr key={p.id} className="hover:bg-[#F2EEEE]/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-[#1F3F44] flex-shrink-0">
                        {p.imagem ? <img src={p.imagem} alt="" className="w-full h-full object-cover" /> : (
                          <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-bold">PT</div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#1F3F44]">{p.nome}</p>
                        <p className="text-[#94a3b8] text-xs">{p.cidade} · Ordem {p.ordem}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${ESTADO_BADGE[p.estado]}`}>
                      {ESTADO_LABEL[p.estado]}
                    </span>
                    {!p.ativo && <span className="ml-2 text-xs text-[#94a3b8]">Oculto</span>}
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell text-[#1F3F44]">
                    {p.unidades_disponiveis !== null ? `${p.unidades_disponiveis} disponíveis` : '—'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/projetos/${p.slug}`} target="_blank" className="p-2 rounded-lg text-[#94a3b8] hover:text-[#1F3F44] hover:bg-[#F2EEEE] transition-colors" title="Ver">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/projetos/${p.id}`} className="p-2 rounded-lg text-[#94a3b8] hover:text-[#00545F] hover:bg-teal-50 transition-colors" title="Editar">
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
