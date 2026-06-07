'use client'

import { useState, useEffect, useRef } from 'react'
import { Globe, ChevronDown, X } from 'lucide-react'

const LANGUAGES = [
  { code: 'pt', label: 'Português',  flag: '🇵🇹', native: 'Português' },
  { code: 'en', label: 'English',    flag: '🇬🇧', native: 'English' },
  { code: 'es', label: 'Español',    flag: '🇪🇸', native: 'Español' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷', native: 'Français' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪', native: 'Deutsch' },
  { code: 'zh-CN', label: '中文',    flag: '🇨🇳', native: '中文 (简体)' },
  { code: 'ar', label: 'العربية',    flag: '🇸🇦', native: 'العربية' },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺', native: 'Русский' },
  { code: 'hi', label: 'हिन्दी',      flag: '🇮🇳', native: 'हिन्दी' },
]

function getGoogleTranslateUrl(targetLang: string, currentUrl: string) {
  if (targetLang === 'pt') return currentUrl // native language — no translation needed
  return `https://translate.google.com/translate?sl=pt&tl=${targetLang}&u=${encodeURIComponent(currentUrl)}`
}

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('pt')
  const ref = useRef<HTMLDivElement>(null)

  // Detect if already on Google Translate proxy
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = window.location.href
    if (url.includes('translate.google.com')) {
      const match = url.match(/tl=([^&]+)/)
      if (match) setCurrent(match[1])
    }
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = LANGUAGES.find(l => l.code === current) ?? LANGUAGES[0]

  const handleSelect = (lang: typeof LANGUAGES[0]) => {
    setCurrent(lang.code)
    setOpen(false)
    if (typeof window === 'undefined') return
    const url = window.location.href
    // Remove existing translate wrapper if present
    const baseUrl = url.includes('translate.google.com')
      ? decodeURIComponent(url.split('&u=')[1] ?? url)
      : url
    const target = getGoogleTranslateUrl(lang.code, baseUrl)
    window.location.href = target
  }

  return (
    <div ref={ref} className="fixed bottom-6 left-6 z-[9990]">
      {/* Dropdown panel */}
      {open && (
        <div className="absolute bottom-14 left-0 w-52 bg-[#0d1f22]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden mb-1">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Idioma</span>
            <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/70 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Language list */}
          <div className="py-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/8 ${
                  lang.code === current ? 'bg-white/10' : ''
                }`}
              >
                <span className="text-lg flex-shrink-0 leading-none">{lang.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${lang.code === current ? 'text-[#4ecdc4]' : 'text-white/80'}`}>
                    {lang.native}
                  </p>
                </div>
                {lang.code === current && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ecdc4] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
          {/* Footer note */}
          <div className="px-4 py-2.5 border-t border-white/10">
            <p className="text-[10px] text-white/25 leading-relaxed">
              Tradução automática via Google Translate
            </p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl shadow-xl transition-all duration-200 border backdrop-blur-sm
          ${open
            ? 'bg-[#00545F] border-[#4ecdc4]/30 text-white scale-105'
            : 'bg-[#0d1f22]/90 border-white/10 text-white/80 hover:bg-[#1F3F44]/90 hover:text-white hover:scale-105'
          }`}
        title="Mudar idioma"
        aria-label="Language / Idioma"
      >
        <Globe className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-semibold">{selected.flag}</span>
        <span className="text-xs font-medium hidden sm:block">{selected.native.split(' ')[0]}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
    </div>
  )
}
