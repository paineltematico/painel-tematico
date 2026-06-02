import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatArea } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'
import PhotoGallery from '@/components/PhotoGallery'
import { Bed, Bath, Car, Maximize2, MapPin, ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string }>
}

async function getImovel(slug: string) {
  const { data } = await supabase
    .from('imoveis')
    .select('*')
    .eq('slug', slug)
    .eq('disponivel', true)
    .single()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const imovel = await getImovel(slug)
  if (!imovel) return { title: 'Imóvel não encontrado' }
  return {
    title: imovel.titulo,
    description: imovel.descricao ?? undefined,
  }
}

export default async function ImovelPage({ params }: Props) {
  const { slug } = await params
  const imovel = await getImovel(slug)
  if (!imovel) notFound()

  const features = [
    imovel.quartos != null && { icon: <Bed className="w-5 h-5" />, label: 'Quartos', value: imovel.quartos },
    imovel.casas_banho != null && { icon: <Bath className="w-5 h-5" />, label: 'Casas de Banho', value: imovel.casas_banho },
    imovel.area_m2 != null && { icon: <Maximize2 className="w-5 h-5" />, label: 'Área', value: formatArea(imovel.area_m2) },
    imovel.garagem && { icon: <Car className="w-5 h-5" />, label: 'Garagem', value: 'Incluída' },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string | number }[]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f8fafc] pt-20">

        {/* Breadcrumb */}
        <div className="bg-white border-b border-[#e2e8f0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
              <Link href="/" className="hover:text-[#1F3F44] flex items-center gap-1 transition-colors">
                <Home className="w-3 h-3" /> Início
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/imoveis" className="hover:text-[#1F3F44] transition-colors">Imóveis</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#1F3F44] font-medium truncate max-w-xs">{imovel.titulo}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-6">

              {/* Photo gallery */}
              <div className="relative">
                <PhotoGallery fotos={imovel.fotos ?? []} titulo={imovel.titulo} />
                {/* Type badges overlaid above gallery */}
                <div className="absolute top-4 left-4 flex gap-2 z-10 pointer-events-none">
                  <span className={`text-sm font-bold px-3 py-1.5 rounded-full shadow ${imovel.tipo === 'Venda' ? 'bg-[#1F3F44] text-white' : 'bg-[#00545F] text-white'}`}>
                    {imovel.tipo}
                  </span>
                  {imovel.tipologia && (
                    <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-white text-[#1F3F44] shadow">
                      {imovel.tipologia}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & location */}
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F3F44] mb-2">
                      {imovel.titulo}
                    </h1>
                    {(imovel.localizacao || imovel.cidade) && (
                      <p className="flex items-center gap-1.5 text-[#64748b] text-sm">
                        <MapPin className="w-4 h-4 text-[#00545F]" />
                        {[imovel.localizacao, imovel.cidade, imovel.distrito].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {imovel.preco ? (
                      <p className="font-serif font-bold text-2xl sm:text-3xl text-[#00545F]">
                        {formatPrice(imovel.preco, imovel.tipo)}
                      </p>
                    ) : (
                      <p className="text-[#94a3b8] text-sm">Preço sob consulta</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Features grid */}
              {features.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
                  <h2 className="font-serif font-semibold text-[#1F3F44] text-lg mb-4">Características</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {features.map((f) => (
                      <div key={f.label} className="flex flex-col items-center text-center p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                        <span className="text-[#00545F] mb-2">{f.icon}</span>
                        <span className="font-bold text-[#1F3F44] text-lg">{f.value}</span>
                        <span className="text-[#94a3b8] text-xs mt-0.5">{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {imovel.descricao && (
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
                  <h2 className="font-serif font-semibold text-[#1F3F44] text-lg mb-4">Descrição</h2>
                  <p className="text-[#475569] leading-relaxed text-sm whitespace-pre-line">{imovel.descricao}</p>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN — Contact */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <ContactForm imovelId={imovel.id} imovelTitulo={imovel.titulo} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
