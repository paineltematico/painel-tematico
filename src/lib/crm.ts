import type { LeadEstado, LeadPrioridade, LeadTemperatura, AtividadeTipo } from '@/types/database'

export const ESTADOS: { value: LeadEstado; label: string; color: string; bg: string; dot: string; step: number }[] = [
  { value: 'novo',           label: 'Novo',           color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',      dot: 'bg-blue-500',    step: 1 },
  { value: 'contactado',     label: 'Contactado',     color: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200',  dot: 'bg-violet-500',  step: 2 },
  { value: 'qualificado',    label: 'Qualificado',    color: 'text-indigo-700',  bg: 'bg-indigo-50 border-indigo-200',  dot: 'bg-indigo-500',  step: 3 },
  { value: 'visita_agendada',label: 'Visita',         color: 'text-teal-700',    bg: 'bg-teal-50 border-teal-200',      dot: 'bg-teal-500',    step: 4 },
  { value: 'negociacao',     label: 'Negociação',     color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',    dot: 'bg-amber-500',   step: 5 },
  { value: 'reserva',        label: 'Reserva',        color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200',  dot: 'bg-orange-500',  step: 6 },
  { value: 'ganho',          label: 'Ganho ✓',        color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200',dot: 'bg-emerald-500', step: 7 },
  { value: 'perdido',        label: 'Perdido',        color: 'text-slate-500',   bg: 'bg-slate-50 border-slate-200',    dot: 'bg-slate-400',   step: 0 },
]

export const TEMPERATURAS: { value: LeadTemperatura; label: string; emoji: string; color: string }[] = [
  { value: 'frio',        label: 'Frio',        emoji: '🔵', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'morno',       label: 'Morno',       emoji: '🟡', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'quente',      label: 'Quente',      emoji: '🟠', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { value: 'muito_quente',label: 'Muito Quente',emoji: '🔴', color: 'text-red-600 bg-red-50 border-red-200' },
]

export function getTemperatura(v: LeadTemperatura) {
  return TEMPERATURAS.find((t) => t.value === v) ?? TEMPERATURAS[0]
}

export const PRIORIDADES: { value: LeadPrioridade; label: string; emoji: string; color: string }[] = [
  { value: 'alta',   label: 'Alta',   emoji: '🔴', color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'normal', label: 'Normal', emoji: '🟡', color: 'text-amber-600 bg-teal-50 border-amber-200' },
  { value: 'baixa',  label: 'Baixa',  emoji: '🟢', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
]

export const ATIVIDADE_TIPOS: { value: AtividadeTipo; label: string; icon: string }[] = [
  { value: 'nota',           label: 'Nota',              icon: '📝' },
  { value: 'chamada',        label: 'Chamada telefónica', icon: '📞' },
  { value: 'email',          label: 'Email enviado',      icon: '✉️' },
  { value: 'visita',         label: 'Visita ao imóvel',   icon: '🏠' },
  { value: 'mudanca_estado', label: 'Estado alterado',    icon: '🔄' },
]

export function getEstado(v: LeadEstado) {
  return ESTADOS.find((e) => e.value === v) ?? ESTADOS[0]
}

export function getPrioridade(v: LeadPrioridade) {
  return PRIORIDADES.find((p) => p.value === v) ?? PRIORIDADES[1]
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'agora mesmo'
  if (diffMins < 60) return `há ${diffMins} min`
  if (diffHours < 24) return `há ${diffHours}h`
  if (diffDays === 1) return 'ontem'
  if (diffDays < 7) return `há ${diffDays} dias`
  return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' }).format(date)
}

export function formatFullDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr))
}
