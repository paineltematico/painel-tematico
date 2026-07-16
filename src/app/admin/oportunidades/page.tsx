import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'
import { ESTADOS, getEstado, getTipo, formatRelativeDate, formatPreco, formatEuro, totalEstimativa, moradaCompleta } from '@/lib/oportunidades'
import { Plus, MapPin, CalendarClock, Lightbulb, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OportunidadeEstado } from '@/types/database'
import OportunidadesSearchBar from '@/components/oportunidades/OportunidadesSearchBar'

export const dynamic = 'force-dynamic'

interface SearchParams { estado?: string; q?: string }

export default async function OportunidadesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const me = await getCurrentUser()
  if (!me) redirect('/admin/login')
  if (!canUser(me, 'oportunidades.view')) redirect('/admin/dashboard')

  const { estado, q } = await searchParams

  let listQ = supabaseAdmin
    .from('oportunidades')
    .select('*')
    .order('updated_at', { ascending: false })
  if (estado) listQ = listQ.eq('estado', estado as OportunidadeEstado)
  if (q?.trim()) listQ = listQ.ilike('pessoa_nome', `%${q.trim()}%`)
  const { data } = await listQ
  const oportunidades = data ?? []

  const { data: countRows } = await supabaseAdmin.from('oportunidades').select('estado')
  const counts: Record<string, number> = {}
  for (const row of countRows ?? []) counts[row.estado] = (counts[row.estado] ?? 0) + 1
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  const hoje = new Date().toISOString().slice(0, 10)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00545F]/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-[#00545F]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Oportunidades</h1>
            <p className="text-[#64748b] text-sm mt-0.5">{total} no total · negócios em preparação</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Suspense fallback={null}><OportunidadesSearchBar defaultValue={q} /></Suspense>
          <Link
            href="/admin/oportunidades/nova"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nova Oportunidade
          </Link>
        </div>
      </div>

      {/* Filtros por estado */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Link
          href="/admin/oportunidades"
          className={cn('px-4 py-2 rounded-xl text-sm font-semibold border transition-colors',
            !estado ? 'bg-[#1F3F44] text-white border-[#1F3F44]' : 'bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]')}
        >
          Todas
        </Link>
        {ESTADOS.map((e) => {
          const count = counts[e.value] ?? 0
          const active = estado === e.value
          return (
            <Link
              key={e.value}
              href={active ? '/admin/oportunidades' : `/admin/oportunidades?estado=${e.value}`}
              className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors',
                active ? `${e.bg} border-current ${e.color}` : 'bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]')}
            >
              <span className={cn('w-2 h-2 rounded-full', e.dot)} />
              {e.label}
              {count > 0 && <span className="text-xs opacity-70">{count}</span>}
            </Link>
          )
        })}
      </div>

      {/* Lista */}
      {oportunidades.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-16 text-center">
          <Lightbulb className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
          <p className="font-serif font-semibold text-[#1F3F44] mb-1">Sem oportunidades</p>
          <p className="text-[#94a3b8] text-sm">Cria uma oportunidade para começar a recolher informação.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {oportunidades.map((op) => {
            const est = getEstado(op.estado)
            const tipo = getTipo(op.tipo)
            const followUpVencido = op.follow_up_data && op.follow_up_data <= hoje && !op.follow_up_email_sent && op.estado !== 'convertida'
            const morada = moradaCompleta(op)
            const totalEst = totalEstimativa(op.estimativa)
            const nFotos = op.fotos?.length ?? 0
            return (
              <Link
                key={op.id}
                href={`/admin/oportunidades/${op.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl border border-[#e2e8f0] p-4 hover:shadow-md hover:border-[#00545F]/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center flex-shrink-0 text-lg">{tipo.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1F3F44] text-sm group-hover:text-[#00545F] transition-colors">{op.pessoa_nome}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-[#64748b]">{tipo.label}</span>
                    {op.tipologia && <span className="text-xs text-[#64748b]">{op.tipologia}</span>}
                    {morada !== '—' && (
                      <span className="flex items-center gap-1 text-xs text-[#64748b]"><MapPin className="w-3 h-3" />{morada}</span>
                    )}
                    {totalEst > 0 ? (
                      <span className="text-xs font-semibold text-[#00545F]">{formatEuro(totalEst)}</span>
                    ) : (op.preco_esperado_min || op.preco_esperado_max) ? (
                      <span className="text-xs text-[#94a3b8]">{formatPreco(op.preco_esperado_min, op.preco_esperado_max)}</span>
                    ) : null}
                    {nFotos > 0 && (
                      <span className="flex items-center gap-1 text-xs text-[#94a3b8]"><ImageIcon className="w-3 h-3" />{nFotos}</span>
                    )}
                  </div>
                </div>
                {followUpVencido && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 font-medium flex-shrink-0">
                    <CalendarClock className="w-3.5 h-3.5" /> Follow-up
                  </span>
                )}
                <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0', est.bg, est.color)}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', est.dot)} />{est.label}
                </span>
                <span className="text-xs text-[#94a3b8] hidden lg:block flex-shrink-0">{formatRelativeDate(op.updated_at)}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
