import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin } from 'lucide-react'
import { getSettings } from '@/lib/settings'

export default async function Footer() {
  const s = await getSettings()

  return (
    <footer className="bg-[#1F3F44] text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/logos/logo-white.png"
                alt="Painel Temático"
                width={180}
                height={54}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-slate-400">
              {s.sobre_texto}
            </p>
            <div className="mt-6 space-y-2">
              <a href={`tel:${s.contacto_telefone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-[#006B78]" /> {s.contacto_telefone}
              </a>
              <a href={`mailto:${s.contacto_email}`} className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-[#006B78]" /> {s.contacto_email}
              </a>
              <span className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-[#006B78]" /> {s.contacto_morada}
              </span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Navegação</h4>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Início' },
                { href: '/imoveis', label: 'Todos os Imóveis' },
                { href: '/imoveis?tipo=Venda', label: 'Para Venda' },
                { href: '/imoveis?tipo=Arrendamento', label: 'Para Arrendamento' },
                { href: '/contacto', label: 'Contacto' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tipologias */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Tipologias</h4>
            <ul className="space-y-2">
              {['T0', 'T1', 'T2', 'T3', 'T4', 'T4+'].map((t) => (
                <li key={t}>
                  <Link href={`/imoveis?tipologia=${t}`} className="text-sm hover:text-white transition-colors">
                    Apartamento {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Painel Temático. Todos os direitos reservados.</p>
          <p className="text-xs text-slate-500">AMI {s.ami_numero} · IMPIC {s.impic_numero}</p>
        </div>
      </div>
    </footer>
  )
}
