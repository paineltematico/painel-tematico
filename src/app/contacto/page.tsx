import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Entre em contacto com a Painel Temático. Estamos disponíveis para responder a todas as suas questões.',
}

export default function ContactoPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── Hero dark info section ───────────────────────────── */}
        <section className="relative min-h-screen flex items-center bg-[#0d1f22] overflow-hidden">

          {/* Background image + overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
            style={{ backgroundImage: "url('/images/contacto-hero.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1f22]/90 via-[#0d1f22]/60 to-[#0d1f22]/80" />

          {/* Content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-32 pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

              {/* ── Coluna esquerda: Morada + Email ── */}
              <div className="space-y-14">

                {/* Morada */}
                <div>
                  <p className="text-[#4ecdc4] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                    Morada
                  </p>
                  <address className="not-italic text-white text-3xl sm:text-4xl font-light leading-snug">
                    Rua do Carmo, 45,<br />
                    4700-000 Braga
                  </address>
                </div>

                {/* Email */}
                <div>
                  <p className="text-[#4ecdc4] text-xs font-semibold uppercase tracking-[0.2em] mb-6">
                    Email
                  </p>

                  <div className="space-y-6">
                    <div>
                      <p className="text-[#4ecdc4] text-xs uppercase tracking-[0.15em] mb-1">
                        Informações &amp; Orçamentos
                      </p>
                      <a
                        href="mailto:geral@paineltematico.pt"
                        className="text-white text-xl sm:text-2xl font-light hover:text-[#4ecdc4] transition-colors duration-200"
                      >
                        geral@paineltematico.pt
                      </a>
                    </div>

                    <div>
                      <p className="text-[#4ecdc4] text-xs uppercase tracking-[0.15em] mb-1">
                        Comercial
                      </p>
                      <a
                        href="mailto:comercial@paineltematico.pt"
                        className="text-white text-xl sm:text-2xl font-light hover:text-[#4ecdc4] transition-colors duration-200"
                      >
                        comercial@paineltematico.pt
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Coluna direita: Telefone ── */}
              <div>
                <p className="text-[#4ecdc4] text-xs font-semibold uppercase tracking-[0.2em] mb-10">
                  Contacto
                </p>

                <div className="space-y-10">

                  <div>
                    <p className="text-[#4ecdc4] text-xs uppercase tracking-[0.15em] mb-1">
                      Geral
                    </p>
                    <a
                      href="tel:+351913440800"
                      className="text-white text-4xl sm:text-5xl font-light tracking-tight hover:text-[#4ecdc4] transition-colors duration-200"
                    >
                      913 440 800
                    </a>
                    <p className="text-white/40 text-sm mt-1">(Chamada para rede móvel)</p>
                  </div>

                  <div>
                    <p className="text-[#4ecdc4] text-xs uppercase tracking-[0.15em] mb-1">
                      Horário
                    </p>
                    <p className="text-white text-lg font-light">Seg – Sex: 9h00 – 18h00</p>
                    <p className="text-white text-lg font-light">Sábado: 10h00 – 13h00</p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Formulário de contacto ───────────────────────────── */}
        <section className="bg-[#f4f7f7] py-20 px-6 sm:px-10">
          <div className="max-w-2xl mx-auto">
            <p className="text-[#00545F] text-xs font-semibold uppercase tracking-[0.2em] mb-3 text-center">
              Mensagem direta
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F3F44] text-center mb-10">
              Envie-nos uma mensagem
            </h2>
            <ContactForm />
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
