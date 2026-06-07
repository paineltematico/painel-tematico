import { supabase } from './supabase'

export type SiteSettings = {
  // Homepage hero
  hero_linha1: string
  hero_linha2: string
  hero_video_url: string

  // Contact info
  contacto_telefone: string
  contacto_email: string
  contacto_email_comercial: string
  contacto_morada: string
  contacto_horario_semana: string
  contacto_horario_sabado: string

  // Licences
  ami_numero: string
  impic_numero: string

  // Sobre Nós
  sobre_texto: string
  manifesto_citacao: string
  sobre_historia_p1: string
  sobre_historia_p2: string
  sobre_historia_p3: string

  // Hero background images (per page) — saved to Supabase Storage
  hero_home_image: string
  hero_contacto_image: string
  hero_sobre_image: string
  hero_imoveis_image: string
  hero_construcao_image: string
  hero_projetos_image: string

  // Homepage — secção "Porquê nós"
  home_porque_titulo: string
  home_card1_titulo: string
  home_card1_desc: string
  home_card2_titulo: string
  home_card2_desc: string
  home_card3_titulo: string
  home_card3_desc: string
}

const DEFAULTS: SiteSettings = {
  // Homepage hero
  hero_linha1:              'Cada imóvel conta uma história.',
  hero_linha2:              'A sua começa aqui.',
  hero_video_url:           '',

  // Contact info
  contacto_telefone:        '+351 913 440 800',
  contacto_email:           'geral@paineltematico.pt',
  contacto_email_comercial: 'comercial@paineltematico.pt',
  contacto_morada:          'Rua do Carmo, 45, 4700-000 Braga',
  contacto_horario_semana:  'Seg – Sex: 9h00 – 18h00',
  contacto_horario_sabado:  'Sábado: 10h00 – 13h00',

  // Licences
  ami_numero:   '25031',
  impic_numero: '69636',

  // Sobre Nós
  sobre_texto:        'A sua imobiliária de confiança em Portugal. Especializados em venda e arrendamento de imóveis residenciais e comerciais.',
  manifesto_citacao:  'Cada tijolo conta uma história. Cada chave entregue é um sonho realizado.',
  sobre_historia_p1:  'A Painel Temático nasceu da vontade de construir de forma diferente — com materiais de excelência, técnicas avançadas e um cuidado genuíno em cada detalhe.',
  sobre_historia_p2:  'Com projetos emblemáticos em Braga e arredores, especializamo-nos em habitação premium acessível. Porque acreditamos que qualidade de vida não deve ser um luxo reservado a poucos.',
  sobre_historia_p3:  'Cada projeto começa com uma pergunta simples: "onde eu gostaria de viver?" E construímos a resposta.',

  // Hero images
  hero_home_image:        '',
  hero_contacto_image:    '',
  hero_sobre_image:       '',
  hero_imoveis_image:     '',
  hero_construcao_image:  '',
  hero_projetos_image:    '',

  // Homepage — secção "Porquê nós"
  home_porque_titulo:  'A diferença está nos detalhes',
  home_card1_titulo:   'Confiança e Transparência',
  home_card1_desc:     'Processo claro, sem surpresas. Acompanhamos cada etapa com total honestidade e profissionalismo.',
  home_card2_titulo:   'Conhecimento Local',
  home_card2_desc:     'Especialistas no mercado português. Sabemos onde estão as melhores oportunidades em cada zona.',
  home_card3_titulo:   'Valorização do Imóvel',
  home_card3_desc:     'Estratégias de marketing e networking para vender mais rápido e ao melhor preço de mercado.',
}

/** Fetch all settings from Supabase, falling back to defaults for missing keys. */
export async function getSettings(): Promise<SiteSettings> {
  const { data } = await supabase.from('site_settings').select('key, value')
  if (!data) return DEFAULTS
  const map = Object.fromEntries(data.map((r) => [r.key, r.value ?? '']))
  return { ...DEFAULTS, ...map } as SiteSettings
}
