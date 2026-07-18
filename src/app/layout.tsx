import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import WhatsAppButton from '@/components/WhatsAppButton'
import EditModeBar from '@/components/EditModeBar'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import SmoothScroll from '@/components/motion/SmoothScroll'
import Analytics from '@/components/Analytics'
import { EditModeProvider } from '@/context/EditModeContext'
import { getCurrentUser } from '@/lib/auth-server'
import localFont from 'next/font/local'
import { Playfair_Display } from 'next/font/google'
import './globals.css'

// Brand font — Cera Pro (local)
const ceraPro = localFont({
  src: [
    { path: './fonts/CeraProLight.otf',  weight: '300', style: 'normal' },
    { path: './fonts/CeraProMedium.otf', weight: '400', style: 'normal' },
    { path: './fonts/CeraProMedium.otf', weight: '500', style: 'normal' },
    { path: './fonts/CeraProBold.otf',   weight: '700', style: 'normal' },
    { path: './fonts/CeraProBlack.otf',  weight: '900', style: 'normal' },
  ],
  variable: '--font-cera',
  display: 'swap',
})

// Display serif — echoes the elegant logo serif
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paineltematico.pt'

export const metadata: Metadata = {
  title: {
    default: 'Painel Temático — Construção & Imobiliária',
    template: '%s | Painel Temático',
  },
  description: 'Empresa de construção e promoção imobiliária. Projetos premium em Braga. Qualidade, confiança e transparência.',
  keywords: ['imobiliária', 'construção', 'moradias', 'apartamentos', 'braga', 'portugal', 'painel tematico'],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    siteName: 'Painel Temático',
    url: SITE_URL,
    images: [{ url: '/logos/og-image.jpg', width: 1200, height: 630, alt: 'Painel Temático' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: { index: true, follow: true },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Check if edit mode cookie is set AND the user is actually authenticated
  const cookieStore = await cookies()
  const hasEditCookie = cookieStore.get('edit_mode')?.value === '1'
  const editMode = hasEditCookie ? !!(await getCurrentUser()) : false

  return (
    <html lang="pt" className={`${ceraPro.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Analytics />
        <EditModeProvider initialEditMode={editMode}>
          <SmoothScroll>{children}</SmoothScroll>
          <WhatsAppButton />
          <LanguageSwitcher />
          <EditModeBar />
        </EditModeProvider>
      </body>
    </html>
  )
}
