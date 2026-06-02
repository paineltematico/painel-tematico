'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, ArrowLeft, Loader2, Save } from 'lucide-react'
import type { Unidade } from '@/types/database'

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all'
const EMPTY: Omit<Unidade, 'id' | 'created_at' | 'projeto_id'> = {
  referencia: '', tipologia: null, area_m2: null, preco: null,
  estado: 'disponivel', piso: null, descricao: null, planta: null, ordem: 0,
}

const ESTADOS_UNIDADE = [
  { value: 'disponivel', label: 'Disponível', cls: 'bg-emerald-50 text-emerald-700' },
  { value: 'reservado',  label: 'Reservado',  cls: 'bg-amber-50 text-amber-700' },
  { value: 'vendido',    label: 'Vendido',    cls: 'bg-slate-100 text-slate-500' },
]

export default function UnidadesPage() {
  const params = useParams()
  const projetoId = params.id as string
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [newU, setNewU] = useState(EMPTY)
  const [projetoNome, setProjetoNome] = useState('')

  useEffect(() => {
    Promise.all([
      supabase.from('unidades').select('*').eq('projeto_id', projetoId).order('ordem'),
      supabase.from('projetos').select('nome').eq('id', projetoId).single(),
    ]).then(([{ data: u }, { data: p }]) => {
      setUnidades((u ?? []) as Unidade[])
      setProjetoNome(p?.nome ?? '')
      setLoading(false)
    })
  }, [projetoId])

  const addUnidade = async () => {
    if (!newU.referencia) return
    setAdding(true)
    const { data, error } = await supabase.from('unidades').insert({
      ...newU,
      projeto_id: projetoId,
      ordem: unidades.length,
    }).select().single()
    if (!error && data) {
      setUnidades(u => [...u, data as Unidade])
      setNewU(EMPTY)
    }
    setAdding(false)
  }

  const updateEstado = async (id: string, estado: Unidade['estado']) => {
    setSaving(id)
    await supabase.from('unidades').update({ estado }).eq('id', id)
    setUnidades(u => u.map(x => x.id === id ? { ...x, estado } : x))
    setSaving(null)
  }

  const deleteUnidade = async (id: string) => {
    if (!confirm('Eliminar esta unidade?')) return
    await supabase.from('unidades').delete().eq('id', id)
    setUnidades(u => u.filter(x => x.id !== id))
  }

  const stats = {
    total:      unidades.length,
    disponivel: unidades.filter(u => u.estado === 'disponivel').length,
    reservado:  unidades.filter(u => u.estado === 'reservado').length,
    vendido:    unidades.filter(u => u.estado === 'vendido').length,
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/admin/projetos/${projetoId}`} className="p-2 rounded-xl hover:bg-[#F2EEEE] text-[#64748b]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Frações — {projetoNome}</h1>
          <p className="text-[#64748b] text-sm">{stats.disponivel} disponíveis · {stats.reservado} reservadas · {stats.vendido} vendidas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, cls: 'border-[#e2e8f0]' },
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

      {/* Add new unit */}
      <div className="bg-white rounded-2xl border border-[#E8E3E3] p-6 mb-6">
        <h2 className="font-serif font-semibold text-[#1F3F44] mb-4">Adicionar fração</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1">Referência *</label>
            <input value={newU.referencia} onChange={e => setNewU(u => ({ ...u, referencia: e.target.value }))} className={inputCls} placeholder="V1 / A2B" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1">Tipologia</label>
            <input value={newU.tipologia ?? ''} onChange={e => setNewU(u => ({ ...u, tipologia: e.target.value || null }))} className={inputCls} placeholder="T3 / V4" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1">Área m²</label>
            <input type="number" value={newU.area_m2 ?? ''} onChange={e => setNewU(u => ({ ...u, area_m2: e.target.value ? +e.target.value : null }))} className={inputCls} placeholder="185" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1">Preço €</label>
            <input type="number" value={newU.preco ?? ''} onChange={e => setNewU(u => ({ ...u, preco: e.target.value ? +e.target.value : null }))} className={inputCls} placeholder="320000" />
          </div>
        </div>
        <button onClick={addUnidade} disabled={adding || !newU.referencia}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] disabled:opacity-60">
          {adding ? <><Loader2 className="w-4 h-4 animate-spin" /> A adicionar...</> : <><Plus className="w-4 h-4" /> Adicionar</>}
        </button>
      </div>

      {/* Units list */}
      <div className="bg-white rounded-2xl border border-[#E8E3E3] overflow-hidden">
        {loading ? (
          <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#94a3b8] mx-auto" /></div>
        ) : unidades.length === 0 ? (
          <div className="p-14 text-center text-[#94a3b8] text-sm">Nenhuma fração adicionada ainda.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
              <tr>
                {['Ref.', 'Tipo', 'Área', 'Preço', 'Estado', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {unidades.map(u => (
                <tr key={u.id} className="hover:bg-[#f8fafc]">
                  <td className="px-4 py-3 font-semibold text-[#1F3F44] text-sm">{u.referencia}</td>
                  <td className="px-4 py-3 text-sm text-[#64748b]">{u.tipologia ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-[#64748b]">{u.area_m2 ? `${u.area_m2} m²` : '—'}</td>
                  <td className="px-4 py-3 text-sm text-[#1F3F44] font-medium">
                    {u.preco ? new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(u.preco) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.estado}
                      onChange={e => updateEstado(u.id, e.target.value as Unidade['estado'])}
                      disabled={saving === u.id}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-[#00545F] bg-white"
                    >
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
