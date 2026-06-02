import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Eye, Home } from 'lucide-react'
import DeleteImovelButton from '@/components/DeleteImovelButton'

export const dynamic = 'force-dynamic'

async function getAllImoveis() {
  const { data } = await supabase
    .from('imoveis')
    .select('id, titulo, slug, tipo, tipologia, preco, cidade, disponivel, destaque, fotos, created_at')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function AdminImoveisPage() {
  const imoveis = await getAllImoveis()

  const stats = {
    total: imoveis.length,
    disponiveis: imoveis.filter((i) => i.disponivel).length,
    venda: imoveis.filter((i) => i.tipo === 'Venda').length,
    destaques: imoveis.filter((i) => i.destaque).length,
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Imóveis</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{stats.total} imóveis no total</p>
        </div>
        <Link
          href="/admin/imoveis/novo"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Novo Imóvel
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, color: 'text-[#1F3F44]' },
          { label: 'Disponíveis', value: stats.disponiveis, color: 'text-emerald-600' },
          { label: 'Para Venda', value: stats.venda, color: 'text-blue-600' },
          { label: 'Destaques', value: stats.destaques, color: 'text-[#00545F]' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <p className={`font-serif font-bold text-3xl ${s.color}`}>{s.value}</p>
            <p className="text-[#64748b] text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
        {imoveis.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center mb-4">
              <Home className="w-6 h-6 text-[#94a3b8]" />
            </div>
            <p className="font-serif font-semibold text-[#1F3F44] mb-1">Sem imóveis</p>
            <p className="text-[#94a3b8] text-sm mb-5">Adicione o primeiro imóvel para começar.</p>
            <Link href="/admin/imoveis/novo" className="px-5 py-2.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors">
              Adicionar imóvel
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Imóvel</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden md:table-cell">Tipo</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">Preço</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">Estado</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#64748b] uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {imoveis.map((imovel) => (
                <tr key={imovel.id} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {/* Thumbnail */}
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-[#1e293b] flex-shrink-0">
                        {imovel.fotos && imovel.fotos[0] ? (
                          <img src={imovel.fotos[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-white/30 text-xs font-bold">PT</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#1F3F44] line-clamp-1">{imovel.titulo}</p>
                        <p className="text-[#94a3b8] text-xs">{imovel.cidade ?? '—'} · {imovel.tipologia ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${imovel.tipo === 'Venda' ? 'bg-blue-50 text-blue-700' : 'bg-teal-50 text-[#00545F]'}`}>
                      {imovel.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell text-[#1F3F44] font-medium">
                    {imovel.preco ? formatPrice(imovel.preco, imovel.tipo) : <span className="text-[#94a3b8]">—</span>}
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${imovel.disponivel ? 'bg-emerald-400' : 'bg-[#94a3b8]'}`} />
                      <span className="text-xs text-[#64748b]">{imovel.disponivel ? 'Disponível' : 'Indisponível'}</span>
                      {imovel.destaque && (
                        <span className="ml-2 text-xs text-[#00545F] font-semibold">★ Destaque</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/imoveis/${imovel.slug}`}
                        target="_blank"
                        className="p-2 rounded-lg text-[#94a3b8] hover:text-[#1F3F44] hover:bg-[#f1f5f9] transition-colors"
                        title="Ver no site"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/imoveis/${imovel.id}`}
                        className="p-2 rounded-lg text-[#94a3b8] hover:text-[#00545F] hover:bg-teal-50 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteImovelButton id={imovel.id} titulo={imovel.titulo} />
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
