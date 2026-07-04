'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Loader2, Users, Edit3, Check, X } from 'lucide-react'
import type { MembroEquipa } from '@/types/database'
import ImageUpload from '@/components/admin/ImageUpload'

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all'
const labelCls = 'block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5'

const EMPTY = { nome: '', cargo: '', bio: '', foto: '', email: '', telefone: '', linkedin: '' }

export default function AdminEquipaPage() {
  const [membros, setMembros] = useState<MembroEquipa[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newMembro, setNewMembro] = useState(EMPTY)

  useEffect(() => {
    fetch('/api/admin/equipa')
      .then(r => (r.ok ? r.json() : []))
      .then((data) => {
        setMembros((data ?? []) as MembroEquipa[])
        setLoading(false)
      })
  }, [])

  const addMembro = async () => {
    if (!newMembro.nome || !newMembro.cargo) return
    setAdding(true)
    const res = await fetch('/api/admin/equipa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newMembro,
        bio: newMembro.bio || null,
        foto: newMembro.foto || null,
        email: newMembro.email || null,
        telefone: newMembro.telefone || null,
        linkedin: newMembro.linkedin || null,
        ordem: membros.length,
        ativo: true,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setMembros(m => [...m, data as MembroEquipa])
      setNewMembro(EMPTY)
      setShowForm(false)
    }
    setAdding(false)
  }

  const toggleAtivo = async (id: string, ativo: boolean) => {
    setSaving(id)
    await fetch(`/api/admin/equipa/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo }),
    })
    setMembros(m => m.map(x => x.id === id ? { ...x, ativo } : x))
    setSaving(null)
  }

  const deleteMembro = async (id: string) => {
    if (!confirm('Eliminar este membro da equipa?')) return
    const res = await fetch(`/api/admin/equipa/${id}`, { method: 'DELETE' })
    if (res.ok) setMembros(m => m.filter(x => x.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00545F]/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#00545F]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1F3F44]">Equipa</h1>
            <p className="text-[#64748b] text-sm">Aparece na página Sobre Nós</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors"
        >
          <Plus className="w-4 h-4" /> Adicionar membro
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#E8E3E3] p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Nome *</label>
              <input value={newMembro.nome} onChange={e => setNewMembro(m => ({ ...m, nome: e.target.value }))} className={inputCls} placeholder="Ana Ferreira" />
            </div>
            <div>
              <label className={labelCls}>Cargo *</label>
              <input value={newMembro.cargo} onChange={e => setNewMembro(m => ({ ...m, cargo: e.target.value }))} className={inputCls} placeholder="Diretora Comercial" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={newMembro.email} onChange={e => setNewMembro(m => ({ ...m, email: e.target.value }))} className={inputCls} placeholder="ana@paineltematico.pt" />
            </div>
            <div>
              <label className={labelCls}>Telefone</label>
              <input value={newMembro.telefone} onChange={e => setNewMembro(m => ({ ...m, telefone: e.target.value }))} className={inputCls} placeholder="+351 9XX XXX XXX" />
            </div>
            <div>
              <label className={labelCls}>Foto</label>
              <ImageUpload
                urls={newMembro.foto ? [newMembro.foto] : []}
                onChange={(urls) => setNewMembro(m => ({ ...m, foto: urls[0] ?? '' }))}
                folder="equipa"
                single
              />
            </div>
            <div>
              <label className={labelCls}>LinkedIn</label>
              <input value={newMembro.linkedin} onChange={e => setNewMembro(m => ({ ...m, linkedin: e.target.value }))} className={inputCls} placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Bio</label>
              <textarea value={newMembro.bio} onChange={e => setNewMembro(m => ({ ...m, bio: e.target.value }))} rows={3} className={`${inputCls} resize-none`} placeholder="Breve descrição..." />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-[#E8E3E3] text-[#64748b] text-sm font-semibold hover:bg-[#F2EEEE]">
              Cancelar
            </button>
            <button onClick={addMembro} disabled={adding || !newMembro.nome || !newMembro.cargo}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#00545F] text-white text-sm font-semibold hover:bg-[#006B78] disabled:opacity-60">
              {adding ? <><Loader2 className="w-4 h-4 animate-spin" /> A guardar...</> : <><Check className="w-4 h-4" /> Guardar</>}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-[#E8E3E3] overflow-hidden">
        {loading ? (
          <div className="p-10 text-center"><Loader2 className="w-6 h-6 text-[#94a3b8] animate-spin mx-auto" /></div>
        ) : membros.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
            <p className="text-[#64748b] text-sm">Nenhum membro adicionado ainda.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#E8E3E3]">
            {membros.map((m) => (
              <li key={m.id} className="flex items-center gap-3 p-4 hover:bg-[#F2EEEE]/50 transition-colors">
                <GripVertical className="w-4 h-4 text-[#E8E3E3] flex-shrink-0" />
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#1F3F44] flex-shrink-0">
                  {m.foto ? <img src={m.foto} alt="" className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center text-white/40 font-bold text-xl">{m.nome.charAt(0)}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1F3F44]">{m.nome}</p>
                  <p className="text-xs text-[#00545F] font-medium">{m.cargo}</p>
                </div>
                <button
                  onClick={() => toggleAtivo(m.id, !m.ativo)}
                  disabled={saving === m.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${m.ativo ? 'bg-emerald-50 text-emerald-700' : 'bg-[#F2EEEE] text-[#94a3b8]'}`}
                >
                  {saving === m.id ? <Loader2 className="w-3 h-3 animate-spin" /> : m.ativo ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  {m.ativo ? 'Visível' : 'Oculto'}
                </button>
                <button onClick={() => deleteMembro(m.id)} className="p-2 rounded-lg text-[#94a3b8] hover:text-red-500 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
