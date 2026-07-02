'use client'

import { useState } from 'react'
import { Phone, Mail, Check, Loader2 } from 'lucide-react'

interface Props {
  imovelId?: string
  imovelTitulo?: string
  projetoId?: string
  projetoNome?: string
  variant?: 'card' | 'inline'
}

export default function ContactForm({ imovelId, imovelTitulo, projetoId, projetoNome, variant = 'card' }: Props) {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' })
  const [website, setWebsite] = useState('') // honeypot anti-spam — humanos nunca preenchem
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          website,
          imovel_id: imovelId ?? null,
          imovel_titulo: imovelTitulo ?? projetoNome ?? null,
          projeto_id: projetoId ?? null,
        }),
      })
      if (!res.ok) throw new Error('request failed')
      setStatus('success')
      setForm({ nome: '', email: '', telefone: '', mensagem: '' })
    } catch {
      setStatus('error')
    }
  }

  const honeypotInput = (
    <input
      type="text"
      name="website"
      value={website}
      onChange={e => setWebsite(e.target.value)}
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="absolute -left-[9999px] h-0 w-0 opacity-0"
    />
  )

  if (variant === 'inline') {
    return (
      <div>
        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-emerald-400" />
            </div>
            <h4 className="font-serif font-semibold text-white text-lg mb-2">Mensagem enviada!</h4>
            <p className="text-slate-300 text-sm">A nossa equipa entrará em contacto brevemente.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
            {honeypotInput}
            {[
              { key: 'nome', label: 'Nome *', placeholder: 'O seu nome', required: true },
              { key: 'email', label: 'Email *', placeholder: 'email@exemplo.com', type: 'email', required: true },
              { key: 'telefone', label: 'Telefone', placeholder: '+351 9XX XXX XXX', type: 'tel' },
            ].map(({ key, label, placeholder, type = 'text', required }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">{label}</label>
                <input
                  type={type}
                  required={required}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B78] focus:border-transparent transition-all"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Mensagem</label>
              <textarea
                rows={3}
                value={form.mensagem}
                onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))}
                placeholder={`Gostaria de saber mais sobre ${projetoNome ?? 'este projeto'}...`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B78] focus:border-transparent transition-all resize-none"
              />
            </div>
            {status === 'error' && <p className="sm:col-span-2 text-red-400 text-xs">Ocorreu um erro. Tente novamente.</p>}
            <div className="sm:col-span-2">
              <button type="submit" disabled={status === 'loading'}
                className="w-full py-3 rounded-xl bg-[#00545F] text-white font-semibold hover:bg-[#006B78] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {status === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin" /> A enviar...</> : 'Enviar mensagem'}
              </button>
            </div>
          </form>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-[#1F3F44] px-6 py-5">
        <h3 className="font-serif font-semibold text-white text-lg mb-0.5">Pedir informações</h3>
        {(imovelTitulo || projetoNome) && (
          <p className="text-slate-400 text-xs line-clamp-2">{imovelTitulo ?? projetoNome}</p>
        )}
      </div>

      <div className="p-6">
        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-emerald-500" />
            </div>
            <h4 className="font-serif font-semibold text-[#1F3F44] text-lg mb-2">Mensagem enviada!</h4>
            <p className="text-[#64748b] text-sm">A nossa equipa entrará em contacto brevemente.</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-5 text-sm text-[#00545F] hover:underline"
            >
              Enviar outra mensagem
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative space-y-4">
            {honeypotInput}
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Nome *</label>
              <input
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="O seu nome"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@exemplo.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Telefone</label>
              <input
                type="tel"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                placeholder="+351 900 000 000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Mensagem</label>
              <textarea
                rows={3}
                value={form.mensagem}
                onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                placeholder="Gostaria de saber mais sobre este imóvel..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#00545F]/30 focus:border-[#00545F] transition-all resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-xs">Ocorreu um erro. Tente novamente.</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 rounded-xl bg-[#00545F] text-white font-semibold text-sm hover:bg-[#006B78] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
            >
              {status === 'loading' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> A enviar...</>
              ) : (
                'Enviar mensagem'
              )}
            </button>
          </form>
        )}

        {/* Direct contacts */}
        <div className="mt-5 pt-5 border-t border-[#e2e8f0] space-y-2">
          <a href="tel:+351210000000" className="flex items-center gap-2.5 text-sm text-[#475569] hover:text-[#1F3F44] transition-colors">
            <Phone className="w-4 h-4 text-[#00545F]" /> +351 210 000 000
          </a>
          <a href="mailto:geral@paineltematico.pt" className="flex items-center gap-2.5 text-sm text-[#475569] hover:text-[#1F3F44] transition-colors">
            <Mail className="w-4 h-4 text-[#00545F]" /> geral@paineltematico.pt
          </a>
        </div>
      </div>
    </div>
  )
}
