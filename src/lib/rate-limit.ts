/**
 * Rate limiter em memória (sliding window) para rotas públicas.
 * Em serverless o estado é por instância — funciona como primeira barreira
 * contra flood/spam, não como garantia absoluta entre instâncias.
 */
const buckets = new Map<string, number[]>()
const MAX_BUCKETS = 5000

/**
 * Devolve `true` se o pedido é permitido, `false` se excedeu o limite.
 * @param key    identificador único (ex: `contacto:${ip}`)
 * @param limit  nº máximo de pedidos por janela
 * @param windowMs duração da janela em ms
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, hits] of buckets) {
      if (hits.every(t => now - t >= windowMs)) buckets.delete(k)
    }
  }

  const hits = (buckets.get(key) ?? []).filter(t => now - t < windowMs)
  if (hits.length >= limit) {
    buckets.set(key, hits)
    return false
  }
  hits.push(now)
  buckets.set(key, hits)
  return true
}

/** IP do cliente atrás do proxy da Vercel. */
export function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  return fwd?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}
