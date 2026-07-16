import type { OportunidadeTipo, OportunidadeEstado, LinhaEstimativa, Oportunidade } from '@/types/database'

export const TIPOS: { value: OportunidadeTipo; label: string; emoji: string }[] = [
  { value: 'venda',        label: 'Quer vender',   emoji: '🏷️' },
  { value: 'compra',       label: 'Quer comprar',  emoji: '🔍' },
  { value: 'arrendamento', label: 'Arrendamento',  emoji: '🔑' },
]

export const ESTADOS: { value: OportunidadeEstado; label: string; color: string; bg: string; dot: string }[] = [
  { value: 'nova',        label: 'Nova',        color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',      dot: 'bg-blue-500' },
  { value: 'em_analise',  label: 'Em análise',  color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',    dot: 'bg-amber-500' },
  { value: 'convertida',  label: 'Convertida',  color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200',dot: 'bg-emerald-500' },
  { value: 'arquivada',   label: 'Arquivada',   color: 'text-slate-500',   bg: 'bg-slate-50 border-slate-200',    dot: 'bg-slate-400' },
]

export function getEstado(v: OportunidadeEstado) {
  return ESTADOS.find((e) => e.value === v) ?? ESTADOS[0]
}

export function getTipo(v: OportunidadeTipo) {
  return TIPOS.find((t) => t.value === v) ?? TIPOS[0]
}

export function formatPreco(min: number | null, max: number | null): string {
  const fmt = (n: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `desde ${fmt(min)}`
  if (max) return `até ${fmt(max)}`
  return '—'
}

export function isImagem(url: string): boolean {
  return /\.(jpe?g|png|webp|gif)$/i.test(url)
}

/** Formata um valor em euros. Custos (negativos) aparecem com sinal. */
export function formatEuro(n: number): string {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

/** Soma das linhas do orçamento — negativos são custos, por isso subtraem. */
export function totalEstimativa(linhas: LinhaEstimativa[] | null | undefined): number {
  return (linhas ?? []).reduce((soma, l) => soma + (Number(l.valor) || 0), 0)
}

/**
 * Link para o mapa: usa o URL colado à mão se existir,
 * senão constrói uma pesquisa no Google Maps a partir da morada.
 */
export function mapaLink(op: Pick<Oportunidade, 'mapa_url' | 'morada' | 'cidade' | 'codigo_postal' | 'localizacao'>): string | null {
  if (op.mapa_url?.trim()) return op.mapa_url.trim()
  const morada = [op.morada, op.codigo_postal, op.cidade ?? op.localizacao].filter(Boolean).join(', ')
  if (!morada) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(morada)}`
}

/** Morada legível numa linha. */
export function moradaCompleta(op: Pick<Oportunidade, 'morada' | 'cidade' | 'codigo_postal' | 'localizacao'>): string {
  return [op.morada, op.codigo_postal, op.cidade ?? op.localizacao].filter(Boolean).join(', ') || '—'
}

// Re-export formatadores partilhados com o CRM
export { formatRelativeDate, formatFullDate } from './crm'
