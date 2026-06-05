'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react'
import type { Unidade } from '@/types/database'

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all'

type TipoProjeto = 'apartamentos' | 'loteamento'

type UnidadeExt = Unidade & {
  area_lote?: number | null
  area_exterior?: number | null
  percentagem_conclusao?: number | null
}

const EMPTY_APT: Omit<UnidadeExt, 'id' | 'created_at' | 'projeto_id'> = {
  referencia: '', tipologia: null, area_m2: null, preco: null,
  estado: 'disponivel', piso: null, descricao: null, planta: null, ordem: 0,
  area_lote: null, area_exterior: null, percentagem_conclusao: 0,
}

const ESTADOS_UNIDADE = [
  { value: 'disponivel', label: 'Disponível', cls: 'bg-emerald-50 text-emerald-700' },
  { value: 'reservado',  label: 'Reservado',  cls: 'bg-amber-50 text-amber-700' },
  { value: 'vendido',    label: 'Vendido',    cls: 'bg-slate-100 text-slate-500' },
]

export default function UnidadesPage() {
  const params = useParams()
  const projetoId = params.id as string
  const [unidades, setUnidades] = useState<UnidadeExt[]>([])
  const [tipo, setTipo] = useState<TipoProjeto>('apartamentos')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [newU, setNewU] = useState(EMPTY_APT)
  const [projetoNome, setProjetoNome] = useState('')

  const isLoteamento = tipo === 'loteamento'
  const termFracao   = isLoteamento ? 'lote' : 'fração'
  const termFracoes  = isLoteamento ? 'lotes' : 'frações'

  useEffect(() => {
    Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('unidades') as any).select('*').eq('projeto_id', projetoId).order('ordem'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('projetos') as any).select('nome, tipo_projeto').eq('id', projetoId).single(),
    ]).then(([{ data: u }, { data: p }]) => {
      setUnidades((u ?? []) as UnidadeExt[])
      setProjetoNome(p?.nome ?? '')
      setTipo((p?.tipo_projeto ?? 'apartamentos') as TipoProjeto)
      setLoading(false)
    })
  }, [projetoId])

  const addUnidade = async () => {
    if (!newU.referencia) return
    setAdding(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('unidades') as any).insert({
      ...newU,
      projeto_id: projetoId,
      ordem: unidades.length,
    }).select().single()
    if (!error && data) {
      setUnidades(u => [...u, data as UnidadeExt])
      setNewU(EMPTY_APT)
    }
    setAdding(false)
  }

  const updateField = async (id: string, fields: Partial<UnidadeExt>) => {
    setSaving(id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('unidades') as any).update(fields).eq('id', id)
    setUnidades(u => u.map(x => x.id === id ? { ...x, ...fields } : x))
    setSaving(null)
  }

  const deleteUnidade = async (id: string) => {
    if (!confirm(`Eliminar este ${termFracao}?`)) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('unidades') as any).delete().eq('id', id)
    setUnidades(u => u.filter(x => x.id !== id))
  }

  const stats = {
    total:      unidades.length,
    disponivel: unidades.filter(u => u.estado === 'disponivel').length,
    reservado:  unidades.filter(u => u.estado === 'reservado').length,
    vendido:    unidades.filter(u => u.estado === 'vendido').length,
  }

  const fmt = (n: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/admin/projetos/${projetoId}`} className="p-2 rounded-xl hover:bg-[#F2EEEE] text-[#64748b]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F3F44] capitalize">
            {isLoteamento ? 'Lotes' : 'Frações'} — {projetoNome}
          </h1>
          <p className="text-[#64748b] text-sm">
            {stats.disponivel} disponíveis · {stats.reservado} reservados · {stats.vendido} vendidos
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',      value: stats.total,      cls: 'border-[#e2e8f0]' },
          { label: 'Disponível', value: stats.disponivel, cls: 'border-emerald-200 bg-emerald-50/50' },
          { label: 'Reservado',  value: stats.reservado,  cls: 'border-amber-200 bg-amber-50/50' },
          { label: 'Vendido',    value: stats.vendido,    cls: 'border-slate-200 bg-slate-50' },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-2xl border p-4 text-center ${s.cls}`}>
            <p className="font-serif font-bold text-3xl text-[#1F3F44]">{s.value}</p>
            <p className="text-xs text-[#64748b] font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      <div className="bg-white rounded-2xl border border-[#E8E3E3] p-6 mb-6">
        <h2 className="font-serif font-semibold text-[#1F3F44] mb-4 capitalize">Adicionar {termFracao}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1">
              {isLoteamento ? 'Nº do Lote *' : 'Referência *'}
            </label>
            <input value={newU.referencia} onChange={e => setNewU(u => ({ ...u, referencia: e.target.value }))}
              className={inputCls} placeholder={isLoteamento ? 'Lote 1' : 'V1 / A2B'} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1">Tipologia</label>
            <input value={newU.tipologia ?? ''} onChange={e => setNewU(u => ({ ...u, tipologia: e.target.value || null }))}
              className={inputCls} placeholder={isLoteamento ? 'Moradia T3' : 'T3 / V4'} />
          </div>
          {isLoteamento ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1">Área Bruta m²</label>
                <input type="number" value={newU.area_m2 ?? ''} onChange={e => setNewU(u => ({ ...u, area_m2: e.target.value ? +e.target.value : null }))}
                  className={inputCls} placeholder="185" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1">Área do Lote m²</label>
                <input type="number" value={newU.area_lote ?? ''} onChange={e => setNewU(u => ({ ...u, area_lote: e.target.value ? +e.target.value : null }))}
                  className={inputCls} placeholder="500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1">Área Exterior m²</label>
                <input type="number" value={newU.area_exterior ?? ''} onChange={e => setNewU(u => ({ ...u, area_exterior: e.target.value ? +e.target.value : null }))}
                  className={inputCls} placeholder="315" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1">% Conclusão</label>
                <input type="number" min={0} max={100} value={newU.percentagem_conclusao ?? 0} onChange={e => setNewU(u => ({ ...u, percentagem_conclusao: +e.target.value }))}
                  className={inputCls} placeholder="0" />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1">Área m²</label>
              <input type="number" value={newU.area_m2 ?? ''} onChange={e => setNewU(u => ({ ...u, area_m2: e.target.value ? +e.target.value : null }))}
                className={inputCls} placeholder="185" />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1">Preço €</label>
            <input type="number" value={newU.preco ?? ''} onChange={e => setNewU(u => ({ ...u, preco: e.target.value ? +e.target.value : null }))}
              className={inputCls} placeholder="320000" />
          </div>
        </div>
        <button onClick={addUnidade} disabled={adding || !newU.referencia}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] disabled:opacity-60">
          {adding ? <><Loader2 className="w-4 h-4 animate-spin" /> A adicionar...</> : <><Plus className="w-4 h-4" /> Adicionar</>}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8E3E3] overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#94a3b8] mx-auto" /></div>
        ) : unidades.length === 0 ? (
          <div className="p-14 text-center text-[#94a3b8] text-sm capitalize">Nenhum {termFracao} adicionado ainda.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
              <tr>
                {[
                  'Ref.',
                  'Tipo',
                  isLoteamento ? 'Área Bruta' : 'Área',
                  ...(isLoteamento ? ['Área Lote', 'Área Ext.', '% Conclusão'] : []),
                  'Preço',
                  'Estado',
                  '',
                ].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {unidades.map(u => (
                <tr key={u.id} className="hover:bg-[#f8fafc]">
                  <td className="px-4 py-3 font-semibold text-[#1F3F44] text-sm whitespace-nowrap">{u.referencia}</td>
                  <td className="px-4 py-3 text-sm text-[#64748b]">{u.tipologia ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-[#64748b]">{u.area_m2 ? `${u.area_m2} m²` : '—'}</td>
                  {isLoteamento && (
                    <>
                      <td className="px-4 py-3">
                        <input type="number" defaultValue={u.area_lote ?? ''} onBlur={e => updateField(u.id, { area_lote: e.target.value ? +e.target.value : null })}
                          className="w-20 px-2 py-1 text-xs rounded-lg border border-[#E8E3E3] text-[#1F3F44] focus:outline-none focus:ring-1 focus:ring-[#00545F]"
                          placeholder="—" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" defaultValue={u.area_exterior ?? ''} onBlur={e => updateField(u.id, { area_exterior: e.target.value ? +e.target.value : null })}
                          className="w-20 px-2 py-1 text-xs rounded-lg border border-[#E8E3E3] text-[#1F3F44] focus:outline-none focus:ring-1 focus:ring-[#00545F]"
                          placeholder="—" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <input type="number" min={0} max={100} defaultValue={u.percentagem_conclusao ?? 0}
                            onBlur={e => updateField(u.id, { percentagem_conclusao: +e.target.value })}
                            className="w-16 px-2 py-1 text-xs rounded-lg border border-[#E8E3E3] text-[#1F3F44] focus:outline-none focus:ring-1 focus:ring-[#00545F]"
                          />
                          <span className="text-xs text-[#94a3b8]">%</span>
                          {saving === u.id && <Loader2 className="w-3 h-3 animate-spin text-[#00545F]" />}
                        </div>
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3 text-sm text-[#1F3F44] font-medium whitespace-nowrap">
                    {u.preco ? fmt(u.preco) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <select value={u.estado} onChange={e => updateField(u.id, { estado: e.target.value as Unidade['estado'] })}
                      disabled={saving === u.id}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-[#00545F] bg-white">
                      {ESTADOS_UNIDADE.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteUnidade(u.id)} className="p-1.5 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
