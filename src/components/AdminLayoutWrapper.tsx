'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import AdminSidebar from '@/components/AdminSidebar'
import type { AdminRole } from '@/lib/auth'

interface Props {
  user?: {
    nome: string
    email: string
    role: AdminRole
    permissions_extra?: string[]
    permissions_denied?: string[]
  } | null
  children: React.ReactNode
}

export default function AdminLayoutWrapper({ user, children }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">

      {/* ── Desktop sidebar (always visible) ── */}
      <div className="hidden lg:block">
        <AdminSidebar user={user} />
      </div>

      {/* ── Mobile drawer overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile sidebar (slide-in) ── */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <AdminSidebar user={user} onClose={() => setOpen(false)} />
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#1F3F44] border-b border-white/10 sticky top-0 z-30">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold text-sm">Painel Temático</span>
        </div>

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
