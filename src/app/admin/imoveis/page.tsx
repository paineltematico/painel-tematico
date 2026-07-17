import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Eye, Home, UserCircle2 } from 'lucide-react'
import DeleteImovelButton from '@/components/DeleteImovelButton'

export const dynamic = 'force-dynamic'

async function getAllImoveis() {
  const { data } = await supabaseAdmin
    .from('imoveis')
    .select('id, titulo, slug, tipo, tipologia, preco, cidade, disponivel, destaque, fotos, created_at, angariador_id')
    .order('created_at', { ascending: false })
  return data ?? []
}

async function getUserMap() {
  const { data } = await supabaseAdmin.from('admin_users').select('id, nome')
  return new Map((data ?? []).map((u) => [u.id, u.nome as string]))
}

export default async function AdminImoveisPage() {
  const [imoveis, userMap] = await Promise.all([getAllImoveis(), getUserMap()])

  const stats = {
    total: imoveis.length,
    disponiveis: imoveis.filter((i) => i.disponivel).length,
    venda: imoveis.filter((i) => i.tipo === 'Venda').length,
    destaques: imoveis.filter((i) => i.destaque).length,
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1F3F44]">Imóveis</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{stats.total} imóveis no total</p>
        </div>
        <Link
          href="/admin/imoveis/novo"
          className="flex items-center gap-2 px-4 sm:px-5 min-h-11 py-2.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Novo Imóvel</span><span className="sm:hidden">Novo</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: 'Total', value: stats.total, color: 'text-[#1F3F44]' },
          { label: 'Disponíveis', value: stats.disponiveis, color: 'text-emerald-600' },
          { label: 'Para Venda', value: stats.venda, color: 'text-blue-600' },
          { label: 'Destaques', value: stats.destaques, color: 'text-[#00545F]' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#e2e8f0] p-4 sm:p-5">
            <p className={`font-serif font-bold text-2xl sm:text-3xl ${s.color}`}>{s.value}</p>
            <p className="text-[#64748b] text-xs sm:text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Lista */}
      {imoveis.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] flex flex-col items-center justify-center py-20 text-center">
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
        <div className="space-y-2">
          {imoveis.map((imovel) => (
            <div key={imovel.id} className="bg-white rounded-2xl border border-[#e2e8f0] p-3 sm:p-4 hover:shadow-md hover:border-[#00545F]/30 transition-all">
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="w-16 h-16 sm:w-14 sm:h-12 rounded-lg overflow-hidden bg-[#1e293b] flex-shrink-0">
                  {imovel.fotos && imovel.fotos[0] ? (
                    <img src={imovel.fotos[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white/30 text-xs font-bold">PT</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/admin/imoveis/${imovel.id}`} className="min-w-0 group">
                      <p className="font-medium text-[#1F3F44] group-hover:text-[#00545F] transition-colors line-clamp-1">{imovel.titulo}</p>
                      <p className="text-[#94a3b8] text-xs mt-0.5">{imovel.cidade ?? '—'} · {imovel.tipologia ?? '—'}</p>
                    </Link>
                    {/* Ações */}
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <Link href={`/imoveis/${imovel.slug}`} target="_blank" className="p-2 rounded-lg text-[#94a3b8] hover:text-[#1F3F44] hover:bg-[#f1f5f9] transition-colors" title="Ver no site">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/imoveis/${imovel.id}`} className="p-2 rounded-lg text-[#94a3b8] hover:text-[#00545F] hover:bg-teal-50 transition-colors" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteImovelButton id={imovel.id} titulo={imovel.titulo} />
                    </div>
                  </div>

                  {/* Badges: sempre visíveis, também em mobile */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${imovel.tipo === 'Venda' ? 'bg-blue-50 text-blue-700' : 'bg-teal-50 text-[#00545F]'}`}>
                      {imovel.tipo}
                    </span>
                    {imovel.preco && (
                      <span className="text-xs font-semibold text-[#1F3F44]">{formatPrice(imovel.preco, imovel.tipo)}</span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-[#64748b]">
                      <span className={`w-2 h-2 rounded-full ${imovel.disponivel ? 'bg-emerald-400' : 'bg-[#94a3b8]'}`} />
                      {imovel.disponivel ? 'Disponível' : 'Indisponível'}
                    </span>
                    {imovel.destaque && <span className="text-xs text-[#00545F] font-semibold">★ Destaque</span>}
                    {imovel.angariador_id && userMap.get(imovel.angariador_id) && (
                      <span className="inline-flex items-center gap-1 text-xs text-[#475569]">
                        <UserCircle2 className="w-3 h-3 text-[#00545F]" />{userMap.get(imovel.angariador_id)}
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
