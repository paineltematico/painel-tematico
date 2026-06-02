import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { getSettings } from '@/lib/settings'
import { Shield, Award, MapPin, Hammer, Users, Heart } from 'lucide-react'
import type { MembroEquipa } from '@/types/database'

async function getEquipa(): Promise<MembroEquipa[]> {
  const { data } = await supabase
    .from('equipa')
    .select('*')
    .eq('ativo', true)
    .order('ordem')
  return (data ?? []) as MembroEquipa[]
}

const VALORES = [
  { icon: Shield, title: 'Confiança',     desc: 'Transparência total em cada etapa do processo. Sem surpresas, sem letra pequena.' },
  { icon: Hammer, title: 'Qualidade',     desc: 'Construímos com os melhores materiais e técnicas para garantir durabilidade e conforto.' },
  { icon: Heart,  title: 'Compromisso',  desc: 'Cada projeto é tratado como se fosse nosso. O seu sonho é a nossa responsabilidade.' },
  { icon: MapPin, title: 'Proximidade',  desc: 'Conhecemos profundamente o mercado local. Estamos sempre perto de si.' },
  { icon: Users,  title: 'Equipa',       desc: 'Profissionais experientes, apaixonados pelo que fazem.' },
  { icon: Award,  title: 'Excelência',   desc: 'Premiados pela qualidade construtiva e pelo serviço ao cliente.' },
]

export const metadata = {
  title: 'Sobre Nós | Painel Temático',
  description: 'Conheça a Painel Temático — empresa de construção e promoção imobiliária com foco em qualidade, confiança e transparência.',
}

export default async function SobreNosPage() {
  const [equipa, settings] = await Promise.all([getEquipa(), getSettings()])

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 bg-[#1F3F44] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #00545F 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#6BBFC9] text-sm font-semibold uppercase tracking-widest mb-4">Sobre Nós</p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Construímos mais do que casas
          </h1>
          <p className="text-white/70 text-lg sm:text-xl font-light leading-relaxed max-w-2xl mx-auto">
            {settings.sobre_texto}
          </p>
        </div>
      </section>

      {/* ── MISSÃO & HISTÓRIA ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#00545F] text-sm font-semibold uppercase tracking-widest mb-3">A Nossa Missão</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F3F44] mb-6 leading-tight">
                Criar lares onde as famílias crescem e prosperam
              </h2>
              <p className="text-[#64748b] leading-relaxed mb-4">
                A Painel Temático nasceu da vontade de construir de forma diferente. Diferentes pelos materiais que escolhemos, pelas técnicas que aplicamos, pelo cuidado que colocamos em cada detalhe.
              </p>
              <p className="text-[#64748b] leading-relaxed mb-4">
                Com projetos em Braga e arredores, especializamo-nos em habitação de qualidade superior com um posicionamento premium acessível — porque acreditamos que qualidade de vida não deve ser um luxo.
              </p>
              <p className="text-[#64748b] leading-relaxed">
                Cada projeto que desenvolvemos é pensado de raiz: a localização, a arquitetura, os materiais, os acabamentos. O objetivo é sempre o mesmo — que os nossos clientes se sintam em casa.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: '10+', label: 'Anos de experiência' },
                { value: '50+', label: 'Famílias que apoiámos' },
                { value: '4',   label: 'Projetos ativos' },
                { value: '100%', label: 'Satisfação garantida' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-[#f8fafc] rounded-2xl p-6 text-center border border-[#e2e8f0]">
                  <p className="font-serif font-bold text-4xl text-[#00545F] mb-2">{value}</p>
                  <p className="text-[#64748b] text-sm font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VALORES ── */}
      <section className="py-20 bg-[#F2EEEE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#00545F] text-sm font-semibold uppercase tracking-widest mb-3">Os Nossos Valores</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F3F44]">
              O que nos define
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALORES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-7 border border-[#E8E3E3] hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#00545F]" />
                </div>
                <h3 className="font-serif font-semibold text-[#1F3F44] text-lg mb-2">{title}</h3>
                <p className="text-[#64748b] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESSO CONSTRUTIVO ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#00545F] text-sm font-semibold uppercase tracking-widest mb-3">Como Trabalhamos</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F3F44]">
              Do terreno às chaves — com rigor
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
            {[
              { step: '01', title: 'Projeto',       desc: 'Arquitetura e engenharia pensadas ao detalhe, com foco na funcionalidade e estética.' },
              { step: '02', title: 'Construção',    desc: 'Execução rigorosa com materiais certificados e mão-de-obra especializada.' },
              { step: '03', title: 'Acabamentos',   desc: 'Escolha personalizada de acabamentos para refletir o seu gosto e estilo de vida.' },
              { step: '04', title: 'Entrega',       desc: 'Acompanhamento até à entrega das chaves — e muito além disso.' },
            ].map(({ step, title, desc }, i) => (
              <div key={step} className={`p-8 ${i % 2 === 0 ? 'bg-[#f8fafc]' : 'bg-white'} border border-[#e2e8f0]`}>
                <p className="font-serif font-black text-5xl text-[#E8E3E3] mb-4">{step}</p>
                <h3 className="font-serif font-bold text-[#1F3F44] text-xl mb-3">{title}</h3>
                <p className="text-[#64748b] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EQUIPA ── */}
      {equipa.length > 0 && (
        <section className="py-20 bg-[#F2EEEE]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-[#00545F] text-sm font-semibold uppercase tracking-widest mb-3">Equipa</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F3F44]">
                As pessoas por trás dos projetos
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {equipa.map((membro) => (
                <div key={membro.id} className="bg-white rounded-2xl overflow-hidden border border-[#E8E3E3] hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3] bg-[#1F3F44] relative">
                    {membro.foto ? (
                      <img src={membro.foto} alt={membro.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-serif font-bold text-white text-4xl opacity-30">
                          {membro.nome.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif font-bold text-[#1F3F44] text-lg">{membro.nome}</h3>
                    <p className="text-[#00545F] text-sm font-semibold mb-2">{membro.cargo}</p>
                    {membro.bio && <p className="text-[#64748b] text-sm leading-relaxed line-clamp-3">{membro.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── AMI / CERTIFICAÇÕES ── */}
      <section className="py-16 bg-[#1F3F44]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm uppercase tracking-widest mb-4">Licenciamento</p>
          <h2 className="font-serif text-2xl font-bold text-white mb-3">
            Empresa certificada e licenciada
          </h2>
          <p className="text-slate-300 mb-6">
            Licença IMI n.º <strong className="text-white">{settings.ami_numero}</strong>
          </p>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Todos os nossos projetos são realizados com pleno cumprimento da regulamentação nacional de construção e urbanismo.
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}
