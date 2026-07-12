'use client'

/**
 * Axonometria de cada piso do Lote 6 — usa o DESENHO REAL da planta (extraído
 * da planta de arquitetura, convertido para traço branco sobre transparente)
 * projetado num plano isométrico. É uma cópia fiel da planta, não um esquema.
 *
 * - `iso` (default): plano inclinado (axonometria) com espessura de laje e um
 *   glow de chão que ACOMPANHA a forma da planta (fica no mesmo plano iso, por
 *   isso projeta-se como paralelogramo) — usado no scrollytelling do desktop.
 * - `iso={false}`: planta plana (miniatura) — usado nos cartões mobile.
 *
 * A imagem tem `data-plan` para o FloorPlanStory poder animar a revelação
 * (wipe); o plano tem `data-axon-plane`.
 */

type PlanSpec = { src: string; w: number }

const PLANS: PlanSpec[] = [
  { src: '/images/merelim/plano/piso-0.png', w: 156 }, // rua + garagem + logradouro
  { src: '/images/merelim/plano/piso-1.png', w: 250 }, // social (open space)
  { src: '/images/merelim/plano/piso-2.png', w: 250 }, // quartos
]

const ISO = 'rotateX(45deg) rotateZ(-45deg)'

export default function AxonFloor({
  id,
  className = '',
  style,
  iso = true,
}: {
  id: number
  className?: string
  style?: React.CSSProperties
  iso?: boolean
}) {
  const plan = PLANS[Math.max(0, Math.min(PLANS.length - 1, id))]
  // Altura à escala: as plantas têm 7 m de largura e o pé-direito é ~2,4 m,
  // logo a altura da caixa é (2.4 / 7) da largura projetada.
  const H = Math.round((plan.w * 2.4) / 7)
  const line = 'rgba(255,255,255,0.42)'

  // Variante plana (mobile): apenas a planta, contida.
  if (!iso) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={plan.src}
        alt=""
        aria-hidden="true"
        className={`object-contain ${className}`}
        style={style}
      />
    )
  }

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ ...style, perspective: 'none' }}
    >
      {/* Plano isométrico (projeção paralela — sem perspetiva = axonometria).
          Sem sombra nem glow: só as linhas brancas. */}
      <div
        data-axon-plane
        className="relative will-change-transform"
        style={{
          width: plan.w,
          transform: ISO,
          transformStyle: 'preserve-3d',
          transformOrigin: '50% 50%',
        }}
      >
        {/* Teto — mesmo footprint, elevado a H (contorno branco) */}
        <div
          data-ceil
          aria-hidden="true"
          className="absolute inset-0"
          style={{ transform: `translateZ(${H}px)`, border: `1px solid ${line}` }}
        />
        {/* Linhas verticais nos 4 cantos — simulam a altura (pé-direito) */}
        {(
          [
            { left: 0, top: 0 },
            { left: '100%', top: 0 },
            { left: 0, top: '100%' },
            { left: '100%', top: '100%' },
          ] as const
        ).map((pos, i) => (
          <span
            key={i}
            data-post
            aria-hidden="true"
            className="absolute"
            style={{
              left: pos.left,
              top: pos.top,
              height: 1,
              width: H,
              background: line,
              transformOrigin: 'left center',
              transform: 'rotateY(-90deg)',
            }}
          />
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-plan src={plan.src} alt="" aria-hidden="true" className="relative block w-full h-auto" />
      </div>
    </div>
  )
}
