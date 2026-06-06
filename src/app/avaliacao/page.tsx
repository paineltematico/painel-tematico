import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AvaliacaoForm from '@/components/avaliacao/AvaliacaoForm'
import { Home, TrendingUp, Shield, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Avaliação Gratuita do Seu Imóvel — Painel Temático',
  description: 'Receba uma avaliação gratuita e um estudo de mercado personalizado para o seu imóvel. Preencha o formulário e a nossa equipa especializada contacta-o em 24h.',
}

export default function AvaliacaoPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f8fafc]">

        {/* ── Hero ── */}
        <section className="bg-[#1F3F44] text-white py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-[#4ecdc4] text-xs font-bold tracking-[4px] uppercase mb-4">Serviço Gratuito</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-5 leading-tight">
              Quanto vale o<br className="hidden sm:block" /> seu imóvel?
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
              A nossa equipa especializada prepara um <strong className="text-white">estudo de mercado personalizado</strong> e
              uma avaliação gratuita para o seu imóvel em Braga e arredores.
            </p>
            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#4ecdc4]" />
                Resposta em 24-48h
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#4ecdc4]" />
                100% confidencial
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4ecdc4]" />
                Análise de mercado real
              </div>
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-[#4ecdc4]" />
                Sem compromisso
              </div>
            </div>
          </div>
        </section>

        {/* ── Form + sidebar ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Form card */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-[#e2e8f0] shadow-sm p-6 sm:p-10">
              <AvaliacaoForm />
            </div>

            {/* Sidebar */}
            <div className="space-y-5 lg:sticky lg:top-8">

              {/* Como funciona */}
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
                <h3 className="font-serif font-bold text-[#1F3F44] mb-4">Como funciona</h3>
                <ol className="space-y-4">
                  {[
                    { n: '1', label: 'Preenche o formulário', sub: 'Leva menos de 3 minutos' },
                    { n: '2', label: 'Analisamos o mercado', sub: 'Imóveis comparáveis na zona' },
                    { n: '3', label: 'Pedimos mais detalhes', sub: 'Fotos e informações extra' },
                    { n: '4', label: 'Recebe o estudo', sub: 'Avaliação personalizada' },
                  ].map(s => (
                    <li key={s.n} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#1F3F44] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {s.n}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1F3F44]">{s.label}</p>
                        <p className="text-xs text-[#94a3b8]">{s.sub}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Testemunho */}
              <div className="bg-[#1F3F44] rounded-2xl p-6 text-white">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(i => <span key={i} className="text-[#4ecdc4] text-sm">★</span>)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed italic mb-4">
                  "A equipa do Painel Temático fez uma avaliação muito completa e realista.
                  Vendemos em menos de 2 meses pelo valor que sugeriram."
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#00545F] flex items-center justify-center text-white font-bold text-xs font-serif">M</div>
                  <div>
                    <p className="text-xs font-semibold">Maria S.</p>
                    <p className="text-[10px] text-slate-400">Braga · Moradia T4</p>
                  </div>
                </div>
              </div>

              {/* AMI badge */}
              <div className="bg-[#f0fdf4] rounded-2xl border border-emerald-200 p-4 flex items-center gap-3">
                <Shield className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Licenciados AMI 25031</p>
                  <p className="text-xs text-emerald-600">Mediação imobiliária certificada</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
