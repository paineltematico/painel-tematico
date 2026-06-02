import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, tipo: string): string {
  const formatted = new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
  return tipo === 'Arrendamento' ? `${formatted}/mês` : formatted
}

export function formatArea(area: number): string {
  return `${area.toLocaleString('pt-PT')} m²`
}
