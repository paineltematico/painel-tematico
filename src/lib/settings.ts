import { supabase } from './supabase'

export type SiteSettings = {
  hero_linha1: string
  hero_linha2: string
  hero_video_url: string
  contacto_telefone: string
  contacto_email: string
  contacto_morada: string
  ami_numero: string
  impic_numero: string
  sobre_texto: string
}

const DEFAULTS: SiteSettings = {
  hero_linha1:       'Cada imóvel conta uma história.',
  hero_linha2:       'A sua começa aqui.',
  hero_video_url:    '',
  contacto_telefone: '+351 210 000 000',
  contacto_email:    'geral@paineltematico.pt',
  contacto_morada:   'Lisboa, Portugal',
  ami_numero:        '25031',
  impic_numero:      '69636',
  sobre_texto:       'A sua imobiliária de confiança em Portugal. Especializados em venda e arrendamento de imóveis residenciais e comerciais.',
}

/** Fetch all settings from Supabase, falling back to defaults for missing keys. */
export async function getSettings(): Promise<SiteSettings> {
  const { data } = await supabase.from('site_settings').select('key, value')
  if (!data) return DEFAULTS
  const map = Object.fromEntries(data.map((r) => [r.key, r.value ?? '']))
  return { ...DEFAULTS, ...map } as SiteSettings
}
