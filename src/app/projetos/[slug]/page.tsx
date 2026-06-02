import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PropertyCard from '@/components/PropertyCard'
import ContactForm from '@/components/ContactForm'
import {
  MapPin, CheckCircle, ArrowLeft, Clock, Home,
  Star, ChevronDown, Building2,
} from 'lucide-react'
import type { Projeto, Unidade, AtualizacaoObra, Testemunho } from '@/types/database'

interface Props { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'

async function getProjeto(slug: string): Promise<Projeto | null> {
  const { data } = await supabase.from('projetos').select('*').eq('slug', slug).single()
  return data as Projeto | null
}

export default async function ProjetoPage({ params }: Props) {
  const { slug } = await params
  const projeto = await getProjeto(slug)
  if (!projeto) notFound()

  const [
    { data: imoveisData },
    { data: unidadesData },
    { data: atualizacoesData },
    { data: testemunhosData },
  ] = await Promise.all([
    supabase.from('imoveis').select('*').eq('disponivel', true).ilike('localizacao', `%${projeto.localizacao ?? projeto.nome}%`).limit(6),
    supabase.from('unidades').select('*').eq('projeto_id', projeto.id).order('ordem'),
    supabase.from('atualizacoes_obra').select('*').eq('projeto_id', projeto.id).eq('publicado', true).order('data_atualizacao', { ascending: false }).limit(10),
    supabase.from('testemunhos').select('*').eq('projeto_id', projeto.id).eq('publicado', true).order('ordem').limit(6),
  ])

  const imoveis = imoveisData ?? []
  const unidades = (unidadesData ?? []) as Unidade[]
  const atualizacoes = (atualizacoesData ?? []) as AtualizacaoObra[]
  const testemunhos = (testemunhosData ?? []) as Testemunho[]

  const estadoBadge = {
    em_curso:   { label: 'Em Construção', cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    concluido:  { label: 'Concluído',     cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    brevemente: { label: 'Brevemente',    cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  }[projeto.estado]

  const unidadesDisponiveis = unidades.filter(u => u.estado === 'disponivel').length
  const lastUpdate = atualizacoes[0]

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-[70vh] flex items-end bg-[#1F3F44] overflow-hidden">
        {projeto.imagem && (
          <img src={projeto.imagem} alt={projeto.nome} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-36">
          <Link href="/projetos" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Todos os projetos
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs font-semibold text-[#6BBFC9] uppercase tracking-widest">Empreendimento</span>
            <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${estadoBadge.cls}`}>
              {projeto.estado === 'concluido' && <CheckCircle className="w-3 h-3" />}
              {projeto.estado === 'em_curso' && <Building2 className="w-3 h-3" />}
              {projeto.estado === 'brevemente' && <Clock className="w-3 h-3" />}
              {estadoBadge.label}
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">{projeto.nome}</h1>
          {projeto.subtitulo && <p className="text-white/75 text-xl font-light max-w-2xl">{projeto.subtitulo}</p>}
          {projeto.localizacao && (
            <div className="flex items-center gap-2 text-white/60 text-sm mt-4">
              <MapPin className="w-4 h-4" />
              {projeto.cidade ? `${projeto.cidade} · ` : ''}{projeto.localizacao}
            </div>
          )}
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-[#00545F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/20">
            {[
              { label: 'Tipologia', value: projeto.unidades_total ? `${projeto.unidades_total} unidades` : '—' },
              { label: 'Disponíveis', value: unidades.length > 0 ? String(unidadesDisponiveis) : projeto.unidades_disponiveis !== null ? String(projeto.unidades_disponiveis) : '—' },
              { label: 'Localização', value: projeto.cidade ?? '—' },
              { label: 'Estado', value: estadoBadge.label },
            ].map(s => (
              <div key={s.label} className="text-center px-4 py-2">
                <p className="text-white font-serif font-bold text-2xl">{s.value}</p>
                <p className="text-white/70 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESCRIPTION ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <p className="text-[#1F3F44] text-lg leading-relaxed">{projeto.descricao}</p>
            </div>
            <div className="space-y-4">
              {lastUpdate && projeto.estado === 'em_curso' && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                  <p className="text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">Última atualização</p>
                  <p className="font-serif font-bold text-blue-900 text-xl">{lastUpdate.percentagem_conclusao}% concluído</p>
                  <p className="text-blue-700 text-sm mt-1">{lastUpdate.titulo}</p>
                  <p className="text-blue-500 text-xs mt-1">{new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(lastUpdate.data_atualizacao))}</p>
                </div>
              )}
              <div className="bg-[#F2EEEE] rounded-2xl p-5">
                <p className="text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-3">Pedir informações</p>
                <a
                  href="#contacto"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors"
                >
                  Contactar agora
                </a>
                <a
                  href="#contacto"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[#E8E3E3] text-[#1F3F44] font-semibold text-sm hover:bg-white transition-colors mt-2"
                >
                  Pedir brochura
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── UNITS AVAILABILITY MATRIX ── */}
      {unidades.length > 0 && (
        <section className="py-16 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <p className="text-[#00545F] text-sm font-semibold uppercase tracking-widest mb-2">Disponibilidade</p>
              <h2 className="font-serif text-3xl font-bold text-[#1F3F44]">Frações disponíveis</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {unidades.map((u) => {
                const estadoConfig = {
                  disponivel: { cls: 'border-emerald-200 bg-white', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Disponível' },
                  reservado:  { cls: 'border-amber-200 bg-amber-50/30', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Reservado' },
                  vendido:    { cls: 'border-slate-200 bg-slate-50', badge: 'bg-slate-100 text-slate-500 border-slate-200', label: 'Vendido' },
                }[u.estado]
                return (
                  <div key={u.id} className={`rounded-2xl border-2 p-5 transition-shadow hover:shadow-md ${estadoConfig.cls}`}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-serif font-bold text-[#1F3F44] text-xl">{u.referencia}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${estadoConfig.badge}`}>{estadoConfig.label}</span>
                    </div>
                    {u.tipologia && <p className="text-[#00545F] text-sm font-semibold mb-1">{u.tipologia}</p>}
                    <div className="flex gap-4 text-sm text-[#64748b]">
                      {u.area_m2 && <span className="flex items-center gap-1"><Home className="w-3 h-3" />{u.area_m2}m²</span>}
                      {u.piso !== null && <span>Piso {u.piso}</span>}
                    </div>
                    {u.preco && u.estado === 'disponivel' && (
                      <p className="font-serif font-bold text-[#1F3F44] text-lg mt-2">
                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(u.preco)}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CONSTRUCTION UPDATES TIMELINE ── */}
      {atualizacoes.length > 0 && projeto.estado === 'em_curso' && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-[#00545F] text-sm font-semibold uppercase tracking-widest mb-2">Progresso</p>
              <h2 className="font-serif text-3xl font-bold text-[#1F3F44]">Evolução da Obra</h2>
            </div>

            {/* Progress bar */}
            {atualizacoes[0] && (
              <div className="mb-10 bg-[#f8fafc] rounded-2xl p-6 border border-[#e2e8f0]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-[#1F3F44]">Conclusão geral</span>
                  <span className="font-serif font-bold text-2xl text-[#00545F]">{atualizacoes[0].percentagem_conclusao}%</span>
                </div>
                <div className="h-3 bg-[#e2e8f0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00545F] to-[#006B78] rounded-full transition-all duration-700"
                    style={{ width: `${atualizacoes[0].percentagem_conclusao}%` }}
                  />
                </div>
                {atualizacoes[0].fase && <p className="text-xs text-[#64748b] mt-2">Fase atual: <strong>{atualizacoes[0].fase}</strong></p>}
              </div>
            )}

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-[#e2e8f0]" />
              <div className="space-y-8">
                {atualizacoes.map((atualiz, i) => (
                  <div key={atualiz.id} className="flex gap-6">
                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-serif font-bold text-sm ${i === 0 ? 'bg-[#00545F] text-white' : 'bg-white text-[#64748b] border-2 border-[#e2e8f0]'}`}>
                      {atualiz.percentagem_conclusao}%
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-serif font-semibold text-[#1F3F44]">{atualiz.titulo}</h3>
                        <span className="text-xs text-[#94a3b8] whitespace-nowrap flex-shrink-0">
                          {new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'long' }).format(new Date(atualiz.data_atualizacao))}
                        </span>
                      </div>
                      {atualiz.fase && <p className="text-xs text-[#00545F] font-semibold mb-1">{atualiz.fase}</p>}
                      {atualiz.descricao && <p className="text-[#64748b] text-sm leading-relaxed">{atualiz.descricao}</p>}
                      {atualiz.fotos && atualiz.fotos.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {atualiz.fotos.slice(0, 4).map((f, fi) => (
                            <img key={fi} src={f} alt="" className="w-20 h-16 object-cover rounded-lg border border-[#e2e8f0]" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      {testemunhos.length > 0 && (
        <section className="py-16 bg-[#F2EEEE]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-[#00545F] text-sm font-semibold uppercase tracking-widest mb-2">Testemunhos</p>
              <h2 className="font-serif text-3xl font-bold text-[#1F3F44]">O que dizem os nossos clientes</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testemunhos.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl p-7 border border-[#E8E3E3] shadow-sm">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-[#e2e8f0]'}`} />
                    ))}
                  </div>
                  <blockquote className="text-[#475569] text-sm leading-relaxed mb-5 italic">"{t.texto}"</blockquote>
                  <div className="flex items-center gap-3">
                    {t.foto ? (
                      <img src={t.foto} alt={t.nome} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#1F3F44] flex items-center justify-center text-white font-bold text-sm">
                        {t.nome.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-[#1F3F44] text-sm">{t.nome}</p>
                      {t.cargo && <p className="text-xs text-[#94a3b8]">{t.cargo}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── RELATED PROPERTIES ── */}
      {imoveis.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl font-bold text-[#1F3F44] mb-8">Imóveis neste projeto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {imoveis.map((imovel) => (
                <PropertyCard key={imovel.id} imovel={imovel} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CONTACT / CTA ── */}
      <section id="contacto" className="py-20 bg-[#1F3F44]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold text-white mb-3">Interessado neste projeto?</h2>
            <p className="text-slate-300">Deixe os seus contactos e um da nossa equipa entrará em contacto consigo.</p>
          </div>
          <ContactForm projetoId={projeto.id} projetoNome={projeto.nome} variant="inline" />
        </div>
      </section>

      <Footer />
    </>
  )
}
