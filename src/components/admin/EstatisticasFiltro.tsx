'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronDown, Users } from 'lucide-react'

interface BasicUser { id: string; nome: string; role: string }

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super Admin',
  diretor: 'Diretor',
  comercial: 'Comercial',
}

export default function EstatisticasFiltro({ users }: { users: BasicUser[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('comercial') ?? ''

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set('comercial', value)
    else params.delete('comercial')
    router.push(`${pathname}?${params.toString()}`)
  }

  const selected = users.find(u => u.id === current)

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Users className="w-3.5 h-3.5 text-[#94a3b8]" />
        </div>
        <select
          value={current}
          onChange={e => handleChange(e.target.value)}
          className="pl-8 pr-8 py-2 rounded-xl border border-[#e2e8f0] text-sm text-[#475569] bg-white focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] appearance-none cursor-pointer min-w-[200px]"
        >
          <option value="">Toda a equipa</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.nome} · {ROLE_LABEL[u.role] ?? u.role}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8]" />
        </div>
      </div>
      {selected && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00545F]/10 border border-[#00545F]/20">
          <div className="w-5 h-5 rounded-md bg-[#1F3F44] flex items-center justify-center text-white text-[9px] font-bold font-serif flex-shrink-0">
            {selected.nome.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-[#00545F]">{selected.nome}</span>
        </div>
      )}
    </div>
  )
}
