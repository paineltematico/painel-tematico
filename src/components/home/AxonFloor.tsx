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

const ISO = 'rotateX(56deg) rotateZ(-45deg)'

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
      {/* Wrapper só para a sombra (filtro fora do contexto 3D) */}
      <div style={{ filter: 'drop-shadow(0 24px 20px rgba(0,0,0,0.40))' }}>
        {/* Plano isométrico (projeção paralela — sem perspetiva = axonometria) */}
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
          {/* Glow de chão — no mesmo plano, por baixo da laje: acompanha o
              contorno da planta (paralelogramo), não é um círculo */}
          <div
            data-glow
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              transform: 'translateZ(-44px)',
              background: 'rgba(107,191,201,0.26)',
              filter: 'blur(13px)',
            }}
          />
          {/* Espessura da laje — face inferior */}
          <div
            data-face
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              transform: 'translateZ(-18px)',
              border: '1px solid rgba(255,255,255,0.26)',
              background: 'rgba(31,63,68,0.55)',
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-plan src={plan.src} alt="" aria-hidden="true" className="block w-full h-auto" />
        </div>
      </div>
    </div>
  )
}
