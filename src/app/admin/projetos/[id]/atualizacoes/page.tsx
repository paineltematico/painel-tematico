'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, ArrowLeft, Loader2, HardHat, CheckCircle } from 'lucide-react'
import type { AtualizacaoObra } from '@/types/database'
import ImageUpload from '@/components/admin/ImageUpload'

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all'
const labelCls = 'block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5'

const FASES = ['Fundações', 'Estrutura', 'Alvenaria', 'Cobertura', 'Instalações', 'Rebocos', 'Acabamentos Exteriores', 'Acabamentos Interiores', 'Paisagismo', 'Entregue']

const EMPTY = { titulo: '', descricao: '', fase: '', percentagem_conclusao: 0, data_atualizacao: new Date().toISOString().split('T')[0], fotos: [] as string[] }

export default function AtualizacoesObraPage() {
  const params = useParams()
  const projetoId = params.id as string
  const [atualizacoes, setAtualizacoes] = useState<AtualizacaoObra[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newA, setNewA] = useState(EMPTY)
  const [projetoNome, setProjetoNome] = useState('')

  useEffect(() => {
    fetch(`/api/admin/projetos/${projetoId}/atualizacoes`)
      .then(r => (r.ok ? r.json() : { atualizacoes: [], projeto: null }))
      .then(({ atualizacoes: a, projeto: p }) => {
        setAtualizacoes((a ?? []) as AtualizacaoObra[])
        setProjetoNome(p?.nome ?? '')
        setLoading(false)
      })
  }, [projetoId])

  const addAtualizacao = async () => {
    if (!newA.titulo) return
    setAdding(true)
    const res = await fetch(`/api/admin/projetos/${projetoId}/atualizacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: newA.titulo,
        descricao: newA.descricao || null,
        fase: newA.fase || null,
        percentagem_conclusao: newA.percentagem_conclusao,
        data_atualizacao: newA.data_atualizacao,
        fotos: newA.fotos,
        publicado: true,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setAtualizacoes(a => [data as AtualizacaoObra, ...a])
      setNewA(EMPTY)
      setShowForm(false)
    }
    setAdding(false)
  }

  const deleteAtualizacao = async (id: string) => {
    if (!confirm('Eliminar esta atualização?')) return
    const res = await fetch(`/api/admin/atualizacoes/${id}`, { method: 'DELETE' })
    if (res.ok) setAtualizacoes(a => a.filter(x => x.id !== id))
  }

  const latestPct = atualizacoes[0]?.percentagem_conclusao ?? 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/admin/projetos/${projetoId}`} className="p-2 rounded-xl hover:bg-[#F2EEEE] text-[#64748b]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00545F]/10 flex items-center justify-center">
            <HardHat className="w-5 h-5 text-[#00545F]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Evolução da Obra — {projetoNome}</h1>
            <p className="text-[#64748b] text-sm">{atualizacoes.length} atualizações · {latestPct}% concluído</p>
          </div>
        </div>
      </div>

      {/* Progress overview */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-[#1F3F44]">Progresso global</span>
          <span className="font-serif font-bold text-2xl text-[#00545F]">{latestPct}%</span>
        </div>
        <div className="h-3 bg-[#f1f5f9] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#00545F] to-[#006B78] rounded-full transition-all" style={{ width: `${latestPct}%` }} />
        </div>
      </div>

      {/* Add button */}
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78]">
          <Plus className="w-4 h-4" /> Nova atualização
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#E8E3E3] p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Título *</label>
              <input value={newA.titulo} onChange={e => setNewA(a => ({ ...a, titulo: e.target.value }))} className={inputCls} placeholder="Conclusão das fundações" />
            </div>
            <div>
              <label className={labelCls}>Fase da obra</label>
              <select value={newA.fase} onChange={e => setNewA(a => ({ ...a, fase: e.target.value }))} className={inputCls}>
                <option value="">Selecionar fase...</option>
                {FASES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>% Conclusão</label>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="100" value={newA.percentagem_conclusao}
                  onChange={e => setNewA(a => ({ ...a, percentagem_conclusao: +e.target.value }))}
                  className="flex-1 accent-[#00545F]" />
                <span className="font-bold text-[#00545F] text-lg w-12 text-right">{newA.percentagem_conclusao}%</span>
              </div>
            </div>
            <div>
              <label className={labelCls}>Data</label>
              <input type="date" value={newA.data_atualizacao} onChange={e => setNewA(a => ({ ...a, data_atualizacao: e.target.value }))} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Descrição</label>
              <textarea value={newA.descricao} onChange={e => setNewA(a => ({ ...a, descricao: e.target.value }))} rows={3} className={`${inputCls} resize-none`} placeholder="Detalhes do progresso..." />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Fotos da obra</label>
              <ImageUpload
                urls={newA.fotos}
                onChange={(fotos) => setNewA(a => ({ ...a, fotos }))}
                folder="obra"
                max={10}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-[#64748b] text-sm font-semibold">Cancelar</button>
            <button onClick={addAtualizacao} disabled={adding || !newA.titulo}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00545F] text-white text-sm font-semibold hover:bg-[#006B78] disabled:opacity-60">
              {adding ? <><Loader2 className="w-4 h-4 animate-spin" /> A guardar...</> : <><CheckCircle className="w-4 h-4" /> Publicar atualização</>}
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-[#E8E3E3] overflow-hidden">
        {loading ? (
          <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#94a3b8] mx-auto" /></div>
        ) : atualizacoes.length === 0 ? (
          <div className="p-14 text-center">
            <HardHat className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
            <p className="text-[#64748b] text-sm">Nenhuma atualização publicada ainda.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#E8E3E3]">
            {atualizacoes.map((a, i) => (
              <li key={a.id} className="p-5 hover:bg-[#f8fafc] transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-serif font-bold text-sm ${i === 0 ? 'bg-[#00545F] text-white' : 'bg-[#f1f5f9] text-[#64748b]'}`}>
                    {a.percentagem_conclusao}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#1F3F44] text-sm">{a.titulo}</p>
                        {a.fase && <span className="inline-block text-xs text-[#00545F] font-semibold bg-teal-50 px-2 py-0.5 rounded-full mt-1">{a.fase}</span>}
                        {a.descricao && <p className="text-[#64748b] text-sm mt-1 leading-relaxed">{a.descricao}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-[#94a3b8]">
                          {new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(a.data_atualizacao))}
                        </span>
                        <button onClick={() => deleteAtualizacao(a.id)} className="p-1 rounded-lg text-[#94a3b8] hover:text-red-500 hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
