'use client'

import { useState } from 'react'
import { Save, Loader2, Check, AlertCircle } from 'lucide-react'
import type { SiteSettings } from '@/lib/settings'
import VideoUpload from '@/components/admin/VideoUpload'

interface Props { initial: SiteSettings }

type Status = 'idle' | 'saving' | 'saved' | 'error'

export default function SettingsForm({ initial }: Props) {
  const [form, setForm] = useState<SiteSettings>(initial)
  const [status, setStatus] = useState<Status>('idle')

  const set = (key: keyof SiteSettings) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('saving')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">

      {/* ── Hero ── */}
      <section className="bg-white rounded-2xl border border-[#E8E3E3] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E3E3] bg-[#F2EEEE]/50">
          <h2 className="font-serif font-semibold text-[#1F3F44] text-base">🎥 Hero do site</h2>
          <p className="text-[#64748b] text-xs mt-0.5">Texto exibido por cima do vídeo na página principal.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
              Slogan — linha 1
            </label>
            <input
              value={form.hero_linha1}
              onChange={set('hero_linha1')}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all"
              placeholder="Cada imóvel conta uma história."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
              Slogan — linha 2 <span className="text-[#94a3b8] normal-case font-normal">(sublinha)</span>
            </label>
            <input
              value={form.hero_linha2}
              onChange={set('hero_linha2')}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all"
              placeholder="A sua começa aqui."
            />
          </div>
          {/* Video hero */}
          <div>
            <VideoUpload
              url={form.hero_video_url}
              onChange={(url) => setForm(f => ({ ...f, hero_video_url: url }))}
              label="Vídeo de fundo"
            />
          </div>

          {/* Preview */}
          <div className="mt-4 rounded-xl bg-[#1F3F44] px-6 py-5 text-center">
            <p className="font-serif text-white text-xl font-bold leading-snug">
              {form.hero_linha1 || 'Cada imóvel conta uma história.'}
            </p>
            <p className="text-white/70 text-sm tracking-widest uppercase mt-1">
              {form.hero_linha2 || 'A sua começa aqui.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── Contactos ── */}
      <section className="bg-white rounded-2xl border border-[#E8E3E3] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E3E3] bg-[#F2EEEE]/50">
          <h2 className="font-serif font-semibold text-[#1F3F44] text-base">📞 Contactos</h2>
          <p className="text-[#64748b] text-xs mt-0.5">Aparecem no rodapé, na página de contacto e no formulário de imóveis.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Telefone</label>
              <input
                type="tel"
                value={form.contacto_telefone}
                onChange={set('contacto_telefone')}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all"
                placeholder="+351 210 000 000"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={form.contacto_email}
                onChange={set('contacto_email')}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all"
                placeholder="geral@paineltematico.pt"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Morada / Zona</label>
            <input
              value={form.contacto_morada}
              onChange={set('contacto_morada')}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all"
              placeholder="Lisboa, Portugal"
            />
          </div>
        </div>
      </section>

      {/* ── Sobre ── */}
      <section className="bg-white rounded-2xl border border-[#E8E3E3] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E3E3] bg-[#F2EEEE]/50">
          <h2 className="font-serif font-semibold text-[#1F3F44] text-base">🏢 Sobre a empresa</h2>
          <p className="text-[#64748b] text-xs mt-0.5">Descrição curta exibida no rodapé.</p>
        </div>
        <div className="p-6">
          <textarea
            rows={3}
            value={form.sobre_texto}
            onChange={set('sobre_texto')}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all resize-none"
            placeholder="A sua imobiliária de confiança em Portugal..."
          />
        </div>
      </section>

      {/* ── Legal ── */}
      <section className="bg-white rounded-2xl border border-[#E8E3E3] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E3E3] bg-[#F2EEEE]/50">
          <h2 className="font-serif font-semibold text-[#1F3F44] text-base">⚖️ Informação legal</h2>
          <p className="text-[#64748b] text-xs mt-0.5">Aparece no rodapé.</p>
        </div>
        <div className="p-6">
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Número AMI</label>
                <input
                  value={form.ami_numero}
                  onChange={set('ami_numero')}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all"
                  placeholder="25031"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">Número IMPIC</label>
                <input
                  value={form.impic_numero}
                  onChange={set('impic_numero')}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3E3] text-sm text-[#1F3F44] focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all"
                  placeholder="69636"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pré-visualização do Rodapé ── */}
      <section className="bg-white rounded-2xl border border-[#E8E3E3] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E3E3] bg-[#F2EEEE]/50">
          <h2 className="font-serif font-semibold text-[#1F3F44] text-base">🖥️ Pré-visualização do Rodapé</h2>
          <p className="text-[#64748b] text-xs mt-0.5">Atualiza em tempo real com os campos acima.</p>
        </div>
        <div className="p-0 overflow-hidden rounded-b-2xl">
          <div className="bg-[#1F3F44] text-slate-300 p-8 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl">
              {/* Brand col */}
              <div className="sm:col-span-1">
                <div className="font-serif font-bold text-white text-lg mb-3">painel<br /><span className="font-light tracking-widest text-xs text-[#4ecdc4] uppercase">temático</span></div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {form.sobre_texto || 'Texto sobre a empresa...'}
                </p>
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div>📞 {form.contacto_telefone || '—'}</div>
                  <div>✉️ {form.contacto_email || '—'}</div>
                  <div>📍 {form.contacto_morada || '—'}</div>
                </div>
              </div>
              {/* Nav col */}
              <div>
                <p className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Navegação</p>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {['Início', 'Todos os Imóveis', 'Para Venda', 'Para Arrendamento', 'Contacto'].map(l => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
              {/* Tipologias col */}
              <div>
                <p className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Tipologias</p>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {['T0', 'T1', 'T2', 'T3', 'T4', 'T4+'].map(t => (
                    <li key={t}>Apartamento {t}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p className="text-xs text-slate-500">© {new Date().getFullYear()} Painel Temático. Todos os direitos reservados.</p>
              <p className="text-xs text-slate-500">AMI {form.ami_numero || '—'} · IMPIC {form.impic_numero || '—'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Save button */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="flex items-center gap-2 px-7 py-3 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors disabled:opacity-60 shadow-sm"
        >
          {status === 'saving' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> A guardar...</>
          ) : status === 'saved' ? (
            <><Check className="w-4 h-4" /> Guardado!</>
          ) : (
            <><Save className="w-4 h-4" /> Guardar definições</>
          )}
        </button>

        {status === 'saved' && (
          <p className="text-sm text-emerald-600 flex items-center gap-1.5">
            <Check className="w-4 h-4" /> As alterações foram guardadas com sucesso.
          </p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-500 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> Erro ao guardar. Tente novamente.
          </p>
        )}
      </div>
    </form>
  )
}
