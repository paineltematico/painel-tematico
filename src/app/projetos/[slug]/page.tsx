import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PropertyCard from '@/components/PropertyCard'
import ContactForm from '@/components/ContactForm'
import ProjetoHero from './ProjetoHero'
import ProjetoGaleria from './ProjetoGaleria'
import {
  Home, Star, Building2, FileText, Download, Play, ExternalLink,
} from 'lucide-react'
import type { Projeto, Unidade, AtualizacaoObra, Testemunho } from '@/types/database'

interface Props { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic'

/* ── helpers ─────────────────────────────────────────────────────────────── */

function getVideoEmbed(url: string): string | null {
  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`
  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?color=4ecdc4&title=0&byline=0`
  // Already embed
  if (url.includes('/embed/') || url.includes('player.vimeo')) return url
  return null
}

function isPDF(url: string) {
  return url.toLowerCase().includes('.pdf')
}

function plantaLabel(url: string, i: number) {
  const raw = decodeURIComponent(url.split('/').pop() ?? '')
  // Strip the timestamp slug added by upload API
  return raw.replace(/^[a-z0-9-]+-\d+\./, '').replace(/[-_]/g, ' ').replace(/\.\w+$/, '') || `Planta ${i + 1}`
}

/* ── page ─────────────────────────────────────────────────────────────────── */

export default async function ProjetoPage({ params }: Props) {
  const { slug } = await params
  const { data } = await supabase.from('projetos').select('*').eq('slug', slug).single()
  if (!data) notFound()
  const projeto = data as Projeto

  const [
    { data: imoveisData },
    { data: unidadesData },
    { data: atualizacoesData },
    { data: testemunhosData },
  ] = await Promise.all([
    supabase.from('imoveis').select('*').eq('disponivel', true)
      .ilike('localizacao', `%${projeto.localizacao ?? projeto.nome}%`).limit(6),
    supabase.from('unidades').select('*').eq('projeto_id', projeto.id).order('ordem'),
    supabase.from('atualizacoes_obra').select('*').eq('projeto_id', projeto.id)
      .eq('publicado', true).order('data_atualizacao', { ascending: false }).limit(12),
    supabase.from('testemunhos').select('*').eq('projeto_id', projeto.id)
      .eq('publicado', true).order('ordem').limit(6),
  ])

  const imoveis      = imoveisData ?? []
  const unidades     = (unidadesData ?? []) as Unidade[]
  const atualizacoes = (atualizacoesData ?? []) as AtualizacaoObra[]
  const testemunhos  = (testemunhosData ?? []) as Testemunho[]

  const unidadesDisponiveis = unidades.filter(u => u.estado === 'disponivel').length
  const lastUpdate          = atualizacoes[0]

  const fotos   = Array.isArray(projeto.fotos)   ? projeto.fotos   : []
  const plantas = Array.isArray(projeto.plantas) ? projeto.plantas : []
  const videos  = Array.isArray(projeto.videos)  ? projeto.videos  : []
  const videoEmbeds = videos.map(v => ({ url: v, embed: getVideoEmbed(v) })).filter(v => v.embed)

  return (
    <>
      <Navbar />

      {/* ── HERO (parallax — client) ── */}
      <ProjetoHero projeto={projeto} unidadesDisponiveis={unidadesDisponiveis} />

      {/* ── DESCRIPTION + SIDEBAR ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">

            {/* Description */}
            <div className="lg:col-span-2">
              {projeto.descricao && (
                <>
                  <p className="text-[#00545F] text-xs font-semibold uppercase tracking-[0.2em] mb-4">Sobre o projeto</p>
                  <p className="text-[#1F3F44] text-lg leading-relaxed">{projeto.descricao}</p>
                </>
              )}

              {/* Quick links if content below */}
              <div className="flex flex-wrap gap-3 mt-8">
                {fotos.length > 0 && (
                  <a href="#galeria" className="flex items-center gap-1.5 text-sm font-semibold text-[#00545F] hover:text-[#006B78] border border-[#00545F]/20 hover:border-[#00545F]/50 rounded-full px-4 py-2 transition-all">
                    📸 Galeria ({fotos.length})
                  </a>
                )}
                {videoEmbeds.length > 0 && (
                  <a href="#videos" className="flex items-center gap-1.5 text-sm font-semibold text-[#00545F] hover:text-[#006B78] border border-[#00545F]/20 hover:border-[#00545F]/50 rounded-full px-4 py-2 transition-all">
                    <Play className="w-3.5 h-3.5" /> Vídeos ({videoEmbeds.length})
                  </a>
                )}
                {plantas.length > 0 && (
                  <a href="#plantas" className="flex items-center gap-1.5 text-sm font-semibold text-[#00545F] hover:text-[#006B78] border border-[#00545F]/20 hover:border-[#00545F]/50 rounded-full px-4 py-2 transition-all">
                    <Download className="w-3.5 h-3.5" /> Plantas ({plantas.length})
                  </a>
                )}
                {unidades.length > 0 && (
                  <a href="#unidades" className="flex items-center gap-1.5 text-sm font-semibold text-[#00545F] hover:text-[#006B78] border border-[#00545F]/20 hover:border-[#00545F]/50 rounded-full px-4 py-2 transition-all">
                    <Building2 className="w-3.5 h-3.5" /> Frações ({unidades.length})
                  </a>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {lastUpdate && projeto.estado === 'em_curso' && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                  <p className="text-blue-600 text-xs font-semibold uppercase tracking-wide mb-2">Última atualização</p>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 bg-blue-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${lastUpdate.percentagem_conclusao}%` }} />
                    </div>
                    <span className="font-serif font-bold text-blue-900 text-xl flex-shrink-0">{lastUpdate.percentagem_conclusao}%</span>
                  </div>
                  <p className="text-blue-700 text-sm font-medium">{lastUpdate.titulo}</p>
                  {lastUpdate.fase && <p className="text-blue-500 text-xs mt-0.5">Fase: {lastUpdate.fase}</p>}
                </div>
              )}
              <div className="bg-[#1F3F44] rounded-2xl p-6">
                <p className="text-[#4ecdc4] text-xs font-semibold uppercase tracking-wide mb-4">Pedir informações</p>
                <a href="#contacto"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#4ecdc4] text-[#1F3F44] font-bold text-sm hover:bg-white transition-colors">
                  Contactar agora
                </a>
                {plantas.length > 0 && (
                  <a href="#plantas"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors mt-2">
                    <Download className="w-4 h-4" /> Descarregar Plantas
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      {fotos.length > 0 && (
        <div id="galeria">
          <ProjetoGaleria fotos={fotos} />
        </div>
      )}

      {/* ── VIDEOS ── */}
      {videoEmbeds.length > 0 && (
        <section id="videos" className="py-24 bg-[#f7f8f9]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12">
              <div className="flex items-center gap-2 text-[#00545F] text-xs font-semibold uppercase tracking-[0.2em] mb-2">
                <Play className="w-4 h-4" /> Vídeos
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#1F3F44]">
                Conheça o projeto
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {videoEmbeds.map(({ embed }, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden shadow-xl bg-black"
                  style={{ aspectRatio: '16/9' }}>
                  <iframe
                    src={embed!}
                    title={`Vídeo ${i + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FLOOR PLANS ── */}
      {plantas.length > 0 && (
        <section id="plantas" className="py-24 bg-[#1F3F44] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-7xl mx-auto px-6">
            <div className="mb-12">
              <div className="flex items-center gap-2 text-[#4ecdc4] text-xs font-semibold uppercase tracking-[0.2em] mb-2">
                <FileText className="w-4 h-4" /> Plantas
              </div>
              <h2 className="font-serif text-3xl font-bold text-white">
                Descarregue as plantas
              </h2>
              <p className="text-white/50 mt-2 text-sm">Clique para visualizar ou descarregar</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {plantas.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" download
                  className="group flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#4ecdc4]/50 rounded-2xl overflow-hidden transition-all duration-300">
                  {/* Preview */}
                  <div className="aspect-[4/3] bg-white/5 relative overflow-hidden">
                    {isPDF(url) ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <FileText className="w-12 h-12 text-[#4ecdc4]/60" />
                        <span className="text-white/40 text-xs uppercase tracking-wider">PDF</span>
                      </div>
                    ) : (
                      <img src={url} alt={plantaLabel(url, i)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                  </div>
                  {/* Footer */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-white/70 text-sm font-medium truncate capitalize">
                      {plantaLabel(url, i)}
                    </span>
                    <Download className="w-4 h-4 text-[#4ecdc4] flex-shrink-0 ml-2 group-hover:translate-y-0.5 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── UNITS MATRIX ── */}
      {unidades.length > 0 && (
        <section id="unidades" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-10">
            <div className="mb-10">
              <p className="text-[#00545F] text-xs font-semibold uppercase tracking-[0.2em] mb-2">Disponibilidade</p>
              <h2 className="font-serif text-3xl font-bold text-[#1F3F44]">Frações disponíveis</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {unidades.map((u) => {
                const cfg = {
                  disponivel: { cls: 'border-emerald-200 bg-white', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Disponível' },
                  reservado:  { cls: 'border-amber-200 bg-amber-50/30', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Reservado' },
                  vendido:    { cls: 'border-slate-200 bg-slate-50', badge: 'bg-slate-100 text-slate-500 border-slate-200', label: 'Vendido' },
                }[u.estado]
                return (
                  <div key={u.id} className={`rounded-2xl border-2 p-5 hover:shadow-md transition-shadow ${cfg.cls}`}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-serif font-bold text-[#1F3F44] text-xl">{u.referencia}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>{cfg.label}</span>
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
                    {u.planta && (
                      <a href={u.planta} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-[#00545F] hover:underline mt-2">
                        <ExternalLink className="w-3 h-3" /> Ver planta
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CONSTRUCTION TIMELINE ── */}
      {atualizacoes.length > 0 && projeto.estado === 'em_curso' && (
        <section className="py-20 bg-[#f7f8f9]">
          <div className="max-w-4xl mx-auto px-6">
            <div className="mb-10">
              <p className="text-[#00545F] text-xs font-semibold uppercase tracking-[0.2em] mb-2">Progresso</p>
              <h2 className="font-serif text-3xl font-bold text-[#1F3F44]">Evolução da Obra</h2>
            </div>
            {/* Progress bar */}
            {lastUpdate && (
              <div className="mb-10 bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-[#1F3F44]">Conclusão geral</span>
                  <span className="font-serif font-bold text-2xl text-[#00545F]">{lastUpdate.percentagem_conclusao}%</span>
                </div>
                <div className="h-3 bg-[#e2e8f0] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#00545F] to-[#4ecdc4] rounded-full transition-all"
                    style={{ width: `${lastUpdate.percentagem_conclusao}%` }} />
                </div>
                {lastUpdate.fase && <p className="text-xs text-[#64748b] mt-2">Fase: <strong>{lastUpdate.fase}</strong></p>}
              </div>
            )}
            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-[#e2e8f0]" />
              <div className="space-y-8">
                {atualizacoes.map((a, i) => (
                  <div key={a.id} className="flex gap-6">
                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-serif font-bold text-sm ${i === 0 ? 'bg-[#00545F] text-white' : 'bg-white text-[#64748b] border-2 border-[#e2e8f0]'}`}>
                      {a.percentagem_conclusao}%
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <h3 className="font-serif font-semibold text-[#1F3F44]">{a.titulo}</h3>
                        <span className="text-xs text-[#94a3b8] whitespace-nowrap flex-shrink-0">
                          {new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'long' }).format(new Date(a.data_atualizacao))}
                        </span>
                      </div>
                      {a.fase && <p className="text-xs text-[#00545F] font-semibold mb-1">{a.fase}</p>}
                      {a.descricao && <p className="text-[#64748b] text-sm leading-relaxed">{a.descricao}</p>}
                      {a.fotos && a.fotos.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {a.fotos.slice(0, 4).map((f, fi) => (
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
        <section className="py-20 bg-[#F2EEEE]">
          <div className="max-w-7xl mx-auto px-6 sm:px-10">
            <div className="text-center mb-10">
              <p className="text-[#00545F] text-xs font-semibold uppercase tracking-[0.2em] mb-2">Testemunhos</p>
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
                    {t.foto
                      ? <img src={t.foto} alt={t.nome} className="w-10 h-10 rounded-full object-cover" />
                      : <div className="w-10 h-10 rounded-full bg-[#1F3F44] flex items-center justify-center text-white font-bold text-sm">{t.nome.charAt(0)}</div>}
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
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-10">
            <h2 className="font-serif text-2xl font-bold text-[#1F3F44] mb-8">Imóveis neste projeto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {imoveis.map((imovel) => (
                <PropertyCard key={imovel.id} imovel={imovel} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CONTACT CTA ── */}
      <section id="contacto" className="py-24 bg-[#1F3F44] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, #4ecdc4 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="relative max-w-4xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">Interessado neste projeto?</h2>
            <p className="text-white/55">Deixe os seus contactos e um da nossa equipa entrará em contacto consigo.</p>
          </div>
          <ContactForm projetoId={projeto.id} projetoNome={projeto.nome} variant="inline" />
        </div>
      </section>

      <Footer />
    </>
  )
}
