'use client'

/**
 * Desenho axonométrico (isométrico) de cada piso do Lote 6, em traço branco
 * sobre fundo escuro — substitui a planta fotográfica por um esquema 3D leve
 * e discreto. Projeção iso 2:1; laje flutuante + paredes de fundo + divisões
 * e mobiliário desenhados a linha.
 */

type Pt = [number, number]
type Furn = {
  type: 'bed' | 'car' | 'stairs' | 'sofa' | 'rect' | 'table'
  x: number
  y: number
  dx: number
  dy: number
}
type FloorSpec = {
  W: number // largura (eixo y)
  D: number // profundidade (eixo x)
  rooms: [number, number, number, number][] // [x, y, dx, dy] — contornos de divisões
  furn: Furn[]
}

const S = 26
const COS = 0.8660254
const TH = 0.3 // espessura da laje
const WH = 1.5 // altura das paredes de fundo

const proj = (x: number, y: number, z = 0): Pt => [
  (x - y) * COS * S,
  ((x + y) * 0.5 - z) * S,
]

const FLOORS: FloorSpec[] = [
  // ── Piso 0 — Entrada e garagem ──
  {
    W: 5,
    D: 10,
    rooms: [[4, 0, 0.001, 5]], // parede que separa garagem / hall (linha)
    furn: [
      { type: 'car', x: 0.7, y: 1.1, dx: 3.2, dy: 2.8 },
      { type: 'stairs', x: 6.8, y: 3.2, dx: 2.2, dy: 1.5 },
      { type: 'rect', x: 4.6, y: 0.5, dx: 1.6, dy: 2.2 }, // hall de entrada
    ],
  },
  // ── Piso 1 — Zona social em open space ──
  {
    W: 5,
    D: 10,
    rooms: [[8.4, 3.4, 1.4, 1.6]], // arrumo/WC ao fundo
    furn: [
      { type: 'sofa', x: 1, y: 0.6, dx: 1.3, dy: 3.2 },
      { type: 'table', x: 3.8, y: 1.4, dx: 1.8, dy: 2.1 },
      { type: 'rect', x: 6.4, y: 1.5, dx: 2, dy: 1.6 }, // ilha de cozinha
    ],
  },
  // ── Piso 2 — Três quartos, duas casas de banho ──
  {
    W: 5,
    D: 10,
    rooms: [
      [0.4, 0.4, 3.2, 2],
      [0.4, 2.8, 3.2, 1.8],
      [4, 3, 1.5, 1.6], // WC 1
      [6.2, 0.4, 3.4, 2.6], // suíte
      [6.2, 3.3, 1.6, 1.3], // WC suíte
    ],
    furn: [
      { type: 'bed', x: 1, y: 0.7, dx: 1.4, dy: 1.4 },
      { type: 'bed', x: 1, y: 3.1, dx: 1.4, dy: 1.2 },
      { type: 'bed', x: 7, y: 0.8, dx: 1.7, dy: 1.6 },
    ],
  },
]

function d(...pts: Pt[]): string {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
}

export default function AxonFloor({
  id,
  className = '',
  style,
}: {
  id: number
  className?: string
  style?: React.CSSProperties
}) {
  const f = FLOORS[Math.max(0, Math.min(FLOORS.length - 1, id))]
  const { W, D } = f
  const pts: Pt[] = []
  const track = (p: Pt) => {
    pts.push(p)
    return p
  }

  const strong = 'rgba(255,255,255,0.9)'
  const mid = 'rgba(255,255,255,0.5)'
  const soft = 'rgba(255,255,255,0.32)'

  const els: React.ReactElement[] = []
  let k = 0

  // Laje (topo)
  const A = track(proj(0, 0))
  const B = track(proj(D, 0))
  const Cc = track(proj(D, W))
  const Dd = track(proj(0, W))
  els.push(
    <path key={k++} d={`${d(A, B, Cc, Dd)} Z`} fill="rgba(255,255,255,0.03)" stroke={strong} strokeWidth={1.3} />
  )

  // Espessura da laje (faces frontais)
  const Blo = track(proj(D, 0, -TH))
  const Clo = track(proj(D, W, -TH))
  const Dlo = track(proj(0, W, -TH))
  els.push(<path key={k++} d={`${d(B, Cc, Clo, Blo)} Z`} fill="rgba(255,255,255,0.05)" stroke={strong} strokeWidth={1.1} />)
  els.push(<path key={k++} d={`${d(Dd, Cc, Clo, Dlo)} Z`} fill="rgba(255,255,255,0.05)" stroke={strong} strokeWidth={1.1} />)

  // Paredes de fundo (nas duas arestas traseiras)
  const Aup = track(proj(0, 0, WH))
  const Bup = track(proj(D, 0, WH))
  const Dup = track(proj(0, W, WH))
  els.push(<path key={k++} d={`${d(A, B, Bup, Aup)} Z`} fill="rgba(255,255,255,0.025)" stroke={mid} strokeWidth={1} />)
  els.push(<path key={k++} d={`${d(A, Dd, Dup, Aup)} Z`} fill="rgba(255,255,255,0.025)" stroke={mid} strokeWidth={1} />)

  // Divisões (contornos das salas, no plano da laje)
  f.rooms.forEach(([x, y, dx, dy]) => {
    const p1 = track(proj(x, y))
    const p2 = track(proj(x + dx, y))
    const p3 = track(proj(x + dx, y + dy))
    const p4 = track(proj(x, y + dy))
    els.push(<path key={k++} d={`${d(p1, p2, p3, p4)} Z`} fill="none" stroke={mid} strokeWidth={1} strokeLinejoin="round" />)
  })

  // Mobiliário
  f.furn.forEach((it) => {
    const { x, y, dx, dy } = it
    const p1 = track(proj(x, y))
    const p2 = track(proj(x + dx, y))
    const p3 = track(proj(x + dx, y + dy))
    const p4 = track(proj(x, y + dy))
    els.push(<path key={k++} d={`${d(p1, p2, p3, p4)} Z`} fill="none" stroke={soft} strokeWidth={0.9} strokeLinejoin="round" />)

    if (it.type === 'bed') {
      // linha da almofada junto à cabeceira
      const q1 = track(proj(x + dx * 0.72, y))
      const q2 = track(proj(x + dx * 0.72, y + dy))
      els.push(<path key={k++} d={d(q1, q2)} stroke={soft} strokeWidth={0.9} />)
    }
    if (it.type === 'car') {
      // para-brisas
      const q1 = track(proj(x + dx * 0.62, y + dy * 0.15))
      const q2 = track(proj(x + dx * 0.62, y + dy * 0.85))
      els.push(<path key={k++} d={d(q1, q2)} stroke={soft} strokeWidth={0.9} />)
    }
    if (it.type === 'sofa') {
      // encosto
      const q1 = track(proj(x + dx * 0.28, y))
      const q2 = track(proj(x + dx * 0.28, y + dy))
      els.push(<path key={k++} d={d(q1, q2)} stroke={soft} strokeWidth={0.9} />)
    }
    if (it.type === 'stairs') {
      const n = 5
      for (let s = 1; s < n; s++) {
        const t = s / n
        const q1 = track(proj(x + dx * t, y))
        const q2 = track(proj(x + dx * t, y + dy))
        els.push(<path key={k++} d={d(q1, q2)} stroke={soft} strokeWidth={0.8} />)
      }
    }
  })

  // Caixa envolvente (viewBox) a partir de todos os pontos
  const pad = 14
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const minX = Math.min(...xs) - pad
  const minY = Math.min(...ys) - pad
  const vw = Math.max(...xs) - Math.min(...xs) + pad * 2
  const vh = Math.max(...ys) - Math.min(...ys) + pad * 2

  return (
    <svg
      viewBox={`${minX.toFixed(1)} ${minY.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`}
      className={className}
      style={style}
      fill="none"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {els}
    </svg>
  )
}
