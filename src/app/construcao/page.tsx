import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Play, ArrowRight } from 'lucide-react'
import type { VideoObra } from '@/types/database'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Construção — Saber-Fazer' }

const PILARES = [
  { icon: '🏗️', label: 'Qualidade construtiva', desc: 'Materiais de primeira linha e acabamentos criteriosamente selecionados em cada projeto.' },
  { icon: '🌱', label: 'Eficiência energética', desc: 'Certificação energética A e A+ com soluções de isolamento e ventilação controlada.' },
  { icon: '🔌', label: 'Domótica e tecnologia', desc: 'Casas preparadas para automação residencial, carregamento elétrico e fibra ótica.' },
  { icon: '📍', label: 'Localização privilegiada', desc: 'Zonas residenciais premium de Braga com excelentes acessos e serviços de proximidade.' },
  { icon: '✏️', label: 'Design contemporâneo', desc: 'Arquitetura moderna com espaços amplos, luminosidade natural e exteriores cuidados.' },
]

const PARCEIROS = [
  { nome: 'Parceiro Construção A', placeholder: true },
  { nome: 'Parceiro Materiais B', placeholder: true },
  { nome: 'Arquitetura C', placeholder: true },
  { nome: 'Engenharia D', placeholder: true },
  { nome: 'Marca E', placeholder: true },
  { nome: 'Marca F', placeholder: true },
]

async function getVideos(): Promise<VideoObra[]> {
  const { data } = await supabase
    .from('videos_obra')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })
  return (data ?? []) as VideoObra[]
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return match?.[1] ?? null
}

function VideoCard({ video }: { video: VideoObra }) {
  const ytId = getYouTubeId(video.url)
  const thumb = video.thumbnail ?? (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null)

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex-shrink-0 w-72 sm:w-80 rounded-2xl overflow-hidden relative cursor-pointer block"
      style={{ aspectRatio: '16/9' }}
    >
      {thumb ? (
        <img src={thumb} alt={video.titulo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="w-full h-full bg-[#1F3F44]" />
      )}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-colors mb-3">
          <Play className="w-6 h-6 text-white fill-white translate-x-0.5" />
        </div>
        <p className="text-white font-semibold text-sm text-center px-4 line-clamp-2">{video.titulo}</p>
        {video.projeto && <p className="text-white/60 text-xs mt-1">{video.projeto}</p>}
      </div>
    </a>
  )
}

// Placeholder video card
function PlaceholderVideoCard({ n }: { n: number }) {
  return (
    <div
      className="flex-shrink-0 w-72 sm:w-80 rounded-2xl overflow-hidden relative bg-[#2E3537] flex flex-col items-center justify-center gap-3"
      style={{ aspectRatio: '16/9' }}
    >
      <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
        <Play className="w-6 h-6 text-white/40 fill-white/40 translate-x-0.5" />
      </div>
      <p className="text-white/40 text-sm font-medium">Vídeo de obra {n}</p>
      <p className="text-white/20 text-xs">Em breve</p>
    </div>
  )
}

export default async function ConstrucaoPage() {
  const videos = await getVideos()
  const showPlaceholders = videos.length === 0

  return (
    <>
      <Navbar />

      {/* ── ABERTURA — estilo DAPE ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#2E3537]">
        {/* Background image placeholder */}
        <div className="absolute inset-0">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url('/images/construcao-hero.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {/* Fallback gradient when no image */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2E3537] via-[#1F3F44] to-[#00545F]/50" />
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Text card overlay — estilo DAPE */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <div className="max-w-lg bg-[#1F3F44]/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl">
            <span className="text-[#6BBFC9] text-xs font-semibold uppercase tracking-widest mb-4 block">
              O Nosso Saber-Fazer
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight mb-5">
              Construção de qualidade,<br />do projeto à entrega.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed mb-4">
              O planeamento rigoroso e a atenção ao detalhe fazem da Painel Temático uma referência no desenvolvimento imobiliário residencial em Braga.
            </p>
            <p className="text-slate-400 text-base leading-relaxed mb-8">
              Estamos presentes em cada fase — da escolha do terreno ao momento em que o cliente recebe as chaves.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/projetos"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors"
              >
                Ver projetos <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contacto"
                className="flex items-center justify-center px-6 py-3.5 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                Fale connosco
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 text-xs uppercase tracking-widest">
          ↓
        </div>
      </section>

      {/* ── SABER-FAZER ── */}
      <section className="py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-[#1F3F44] tracking-tight mb-8">
            SABER-FAZER
          </h2>
          <p className="text-[#475569] text-lg leading-relaxed max-w-2xl mx-auto mb-4">
            Os nossos empreendimentos são exemplo de um projeto imobiliário onde observamos
          </p>
          <p className="text-[#1F3F44] text-lg font-semibold mb-12">
            5 características fundamentais presentes em cada construção:
          </p>

          {/* Pillars — horizontal pill list */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {PILARES.map((p) => (
              <span key={p.label} className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#00545F] text-[#00545F] font-semibold text-sm">
                <span>{p.icon}</span> {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* Pillar detail cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {PILARES.map((p) => (
              <div key={p.label} className="bg-[#F2EEEE] rounded-2xl p-6 text-center border border-[#E8E3E3] hover:border-[#00545F]/30 hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="font-serif font-semibold text-[#1F3F44] text-base mb-2">{p.label}</h3>
                <p className="text-[#64748b] text-xs leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VÍDEOS DE OBRA ── */}
      <section className="py-20 bg-[#2E3537] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[#6BBFC9] text-xs font-semibold uppercase tracking-widest block mb-2">Acompanhamento</span>
              <h2 className="font-serif text-3xl font-bold text-white">Obra em Direto</h2>
              <p className="text-slate-400 text-sm mt-1">Registos das nossas obras em curso</p>
            </div>
          </div>
        </div>

        {/* Horizontal scroll */}
        <div className="pl-4 sm:pl-6 lg:pl-8 overflow-x-auto pb-4 scrollbar-none">
          <div className="flex gap-4 w-max">
            {showPlaceholders
              ? [1, 2, 3, 4].map((n) => <PlaceholderVideoCard key={n} n={n} />)
              : videos.map((v) => <VideoCard key={v.id} video={v} />)
            }
          </div>
        </div>

        {showPlaceholders && (
          <p className="text-center text-slate-500 text-sm mt-6">
            Os vídeos podem ser adicionados no <Link href="/admin/construcao" className="text-[#6BBFC9] hover:underline">backoffice</Link>.
          </p>
        )}
      </section>

      {/* ── PARCEIROS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#00545F] text-xs font-semibold uppercase tracking-widest block mb-2">Quem nos acompanha</span>
            <h2 className="font-serif text-3xl font-bold text-[#1F3F44]">Parceiros e Marcas</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
            {PARCEIROS.map((p) => (
              <div key={p.nome} className="aspect-square rounded-2xl bg-[#F2EEEE] border border-[#E8E3E3] flex flex-col items-center justify-center gap-2 hover:border-[#00545F]/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#E8E3E3]" />
                <span className="text-[#94a3b8] text-xs text-center leading-tight px-2">{p.nome}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-[#94a3b8] text-xs mt-8">
            Logos dos parceiros a adicionar. Edite na página de{' '}
            <Link href="/admin/definicoes" className="text-[#00545F] hover:underline">Definições</Link>.
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}
