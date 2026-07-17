'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { visibleNavItems, activeHref, type NavUser } from '@/lib/admin-nav'

interface Props {
  user?: (NavUser & { nome?: string; email?: string }) | null
  onMore: () => void
}

/**
 * Barra de navegação fixa no fundo — só em mobile (lg:hidden).
 * Mostra até 4 destinos primários + botão "Mais" que abre o drawer completo.
 */
export default function AdminBottomNav({ user, onMore }: Props) {
  const pathname = usePathname()
  const visible = visibleNavItems(user ?? null)
  const active = activeHref(visible, pathname)

  // Até 4 itens primários que o utilizador pode ver
  const primary = visible.filter((i) => i.primary).slice(0, 4)

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#e2e8f0] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {primary.map((item) => {
          const isActive = item.href === active
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors',
                isActive ? 'text-[#00545F]' : 'text-[#94a3b8] hover:text-[#1F3F44]'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              <span className="text-[10px] font-medium leading-none">{item.short ?? item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={onMore}
          className="flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[#94a3b8] hover:text-[#1F3F44] transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">Mais</span>
        </button>
      </div>
    </nav>
  )
}
