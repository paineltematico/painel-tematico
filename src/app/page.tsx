import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Search, Building2, MapPin, TrendingUp, Shield, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getSettings } from '@/lib/settings'
import PropertyCard from '@/components/PropertyCard'
import ProjetoCard from '@/components/ProjetoCard'
import ArtigoCard from '@/components/ArtigoCard'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { EditableText } from '@/components/EditableText'
import type { Projeto, Artigo } from '@/types/database'

async function getFeaturedImoveis() {
  const { data } = await supabase
    .from('imoveis')
    .select('*')
    .eq('destaque', true)
    .eq('disponivel', true)
    .order('created_at', { ascending: false })
    .limit(6)
  return data ?? []
}

async function getStats() {
  const { count: total } = await supabase
    .from('imoveis')
    .select('*', { count: 'exact', head: true })
    .eq('disponivel', true)

  const { count: venda } = await supabase
    .from('imoveis')
    .select('*', { count: 'exact', head: true })
    .eq('tipo', 'Venda')
    .eq('disponivel', true)

  const { count: arrend } = await supabase
    .from('imoveis')
    .select('*', { count: 'exact', head: true })
    .eq('tipo', 'Arrendamento')
    .eq('disponivel', true)

  return { total: total ?? 0, venda: venda ?? 0, arrend: arrend ?? 0 }
}

export default async function HomePage() {
  const [featured, stats, settings] = await Promise.all([getFeaturedImoveis(), getStats(), getSettings()])

  const [{ data: projetosData }, { data: artigosData }] = await Promise.all([
    supabase.from('projetos').select('*').eq('ativo', true).order('ordem').limit(4),
    supabase.from('blog_posts').select('*').eq('publicado', true).order('publicado_em', { ascending: false }).limit(4),
  ])
  const projetos = (projetosData ?? []) as Projeto[]
  const artigos = (artigosData ?? []) as Artigo[]

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative h-screen min-h-[640px] flex flex-col items-center justify-center overflow-hidden bg-[#1F3F44]">

        {/* Video background */}
        {settings.hero_video_url ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster="/videos/hero-poster.jpg"
          >
            <source src={settings.hero_video_url} type="video/mp4" />
          </video>
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster="/videos/hero-poster.jpg"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
        )}

        {/* Gradient overlay — darker at top (behind navbar) and bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
        {/* Brand-tinted vignette */}
        <div className="absolute inset-0 bg-[#1F3F44]/30" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">

          {/* Logo mark */}
          <div className="mb-10 flex justify-center">
            <Image
              src="/logos/logo-white.png"
              alt="Painel Temático"
              width={220}
              height={66}
              className="h-14 w-auto object-contain drop-shadow-lg"
              priority
            />
          </div>

          {/* Slogan */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-5 drop-shadow-sm">
            <EditableText settingKey="hero_linha1" value={settings.hero_linha1} />
          </h1>
          <p className="text-white/80 text-lg sm:text-xl font-light tracking-widest uppercase mb-12">
            <EditableText settingKey="hero_linha2" value={settings.hero_linha2} />
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/imoveis"
              className="px-8 py-4 rounded-xl bg-white text-[#1F3F44] font-semibold text-sm tracking-wide hover:bg-[#F2EEEE] transition-colors shadow-xl"
            >
              Ver Imóveis
            </Link>
            <Link
              href="/visita"
              className="px-8 py-4 rounded-xl bg-[#00545F] text-white font-semibold text-sm tracking-wide hover:bg-[#006B78] transition-colors shadow-xl border border-[#00545F]/50"
            >
              Agendar Visita
            </Link>
            <Link
              href="/contacto"
              className="px-8 py-4 rounded-xl border border-white/40 text-white font-semibold text-sm tracking-wide hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Fale Connosco
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50">
          <span className="text-xs tracking-widest uppercase">Explorar</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </div>
      </section>

      {/* ── SEARCH BAR ── */}
      <section className="bg-white shadow-lg border-b border-[#E8E3E3] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form action="/imoveis" method="get" className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="q"
                type="text"
                placeholder="Cidade, zona, tipologia..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all"
              />
            </div>
            <select
              name="tipo"
              className="px-4 py-3 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all bg-white"
            >
              <option value="">Todos os tipos</option>
              <option value="Venda">Venda</option>
              <option value="Arrendamento">Arrendamento</option>
            </select>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors flex items-center gap-2 justify-center shadow-sm"
            >
              <Search className="w-4 h-4" /> Pesquisar
            </button>
          </form>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-[#00545F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 divide-x divide-white/20">
            {[
              { label: 'Imóveis disponíveis', value: stats.total },
              { label: 'Para venda', value: stats.venda },
              { label: 'Para arrendamento', value: stats.arrend },
            ].map((s) => (
              <div key={s.label} className="text-center px-4 py-2">
                <p className="text-white font-serif font-bold text-3xl">{s.value}+</p>
                <p className="text-white/80 text-sm mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ── */}
      {featured.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[#00545F] text-sm font-semibold uppercase tracking-widest mb-2">Imóveis em Destaque</p>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F3F44]">
                  Oportunidades selecionadas
                </h2>
              </div>
              <Link
                href="/imoveis"
                className="hidden sm:flex items-center gap-2 text-[#00545F] font-semibold text-sm hover:gap-3 transition-all"
              >
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((imovel) => (
                <PropertyCard key={imovel.id} imovel={imovel} featured />
              ))}
            </div>

            <div className="text-center mt-10 sm:hidden">
              <Link
                href="/imoveis"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1F3F44] text-white font-semibold hover:bg-[#1e293b] transition-colors"
              >
                Ver todos os imóveis <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── WHY US ── */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#00545F] text-sm font-semibold uppercase tracking-widest mb-2">Porquê a Painel Temático</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F3F44]">
              <EditableText settingKey="home_porque_titulo" value={settings.home_porque_titulo} />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-8 border border-[#e2e8f0] hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-teal-50 flex items-center justify-center mb-5">
                <Shield className="w-7 h-7 text-[#00545F]" />
              </div>
              <h3 className="font-serif font-semibold text-[#1F3F44] text-xl mb-3">
                <EditableText settingKey="home_card1_titulo" value={settings.home_card1_titulo} />
              </h3>
              <p className="text-[#64748b] text-sm leading-relaxed">
                <EditableText settingKey="home_card1_desc" value={settings.home_card1_desc} multiline />
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-8 border border-[#e2e8f0] hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-teal-50 flex items-center justify-center mb-5">
                <MapPin className="w-7 h-7 text-[#00545F]" />
              </div>
              <h3 className="font-serif font-semibold text-[#1F3F44] text-xl mb-3">
                <EditableText settingKey="home_card2_titulo" value={settings.home_card2_titulo} />
              </h3>
              <p className="text-[#64748b] text-sm leading-relaxed">
                <EditableText settingKey="home_card2_desc" value={settings.home_card2_desc} multiline />
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-8 border border-[#e2e8f0] hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-teal-50 flex items-center justify-center mb-5">
                <TrendingUp className="w-7 h-7 text-[#00545F]" />
              </div>
              <h3 className="font-serif font-semibold text-[#1F3F44] text-xl mb-3">
                <EditableText settingKey="home_card3_titulo" value={settings.home_card3_titulo} />
              </h3>
              <p className="text-[#64748b] text-sm leading-relaxed">
                <EditableText settingKey="home_card3_desc" value={settings.home_card3_desc} multiline />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJETOS EM CURSO ── */}
      {projetos.length > 0 && (
        <section className="py-20 bg-[#F2EEEE] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[#00545F] text-sm font-semibold uppercase tracking-widest mb-2">Empreendimentos</p>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F3F44]">Projetos em Curso</h2>
              </div>
              <Link href="/projetos" className="hidden sm:flex items-center gap-2 text-[#00545F] font-semibold text-sm hover:gap-3 transition-all">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          {/* Horizontal scroll carousel */}
          <div className="pl-4 sm:pl-6 lg:pl-8 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-5" style={{ width: 'max-content' }}>
              {projetos.map((p) => <ProjetoCard key={p.id} projeto={p} />)}
            </div>
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Link href="/projetos" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1F3F44] text-white font-semibold text-sm">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ── NOTAS / BLOG ── */}
      {artigos.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <h2 className="font-serif text-5xl sm:text-6xl font-bold text-[#1F3F44] tracking-tight">Notas</h2>
              <Link href="/blog" className="hidden sm:flex items-center gap-2 text-[#00545F] font-semibold text-sm hover:gap-3 transition-all">
                Ver todas <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {artigos.map((a) => <ArtigoCard key={a.id} artigo={a} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-20 bg-[#1F3F44] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #00545F 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Building2 className="w-12 h-12 text-[#00545F] mx-auto mb-6" />
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
            Tem um imóvel para vender?
          </h2>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            A nossa equipa avalia gratuitamente o seu imóvel e traça a melhor estratégia de venda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/avaliacao"
              className="px-8 py-4 rounded-xl bg-[#00545F] text-white font-semibold hover:bg-[#006B78] transition-colors shadow-lg"
            >
              Pedir avaliação gratuita
            </Link>
            <Link
              href="/imoveis"
              className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Ver imóveis disponíveis
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
