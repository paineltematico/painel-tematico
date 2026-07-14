'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AxonFloor from './AxonFloor'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// useLayoutEffect no cliente (evita 1 frame de texto novo visível antes de o
// mascarar); useEffect no servidor para não gerar avisos de SSR.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

type Floor = {
  n: string
  tag: string
  title: string
  desc: string
  photo: string
}

const floors: Floor[] = [
  {
    n: '01',
    tag: 'Piso da rua',
    title: 'Entrada e garagem',
    desc: 'Chegada ao nível da rua, com garagem privativa e acesso direto ao logradouro ajardinado nas traseiras.',
    photo: '/images/merelim/render-3.jpeg',
  },
  {
    n: '02',
    tag: 'Piso intermédio',
    title: 'Zona social em open space',
    desc: 'Sala, jantar e cozinha num único espaço amplo e cheio de luz — o coração da casa, pensado para viver e receber.',
    photo: '/images/merelim/sala-real-3.jpeg',
  },
  {
    n: '03',
    tag: 'Piso superior',
    title: 'Três quartos, duas casas de banho',
    desc: 'A zona privada: três quartos e duas casas de banho, uma delas em suíte. Descanso e privacidade no piso de cima.',
    photo: '/images/merelim/quarto-real-3.jpeg',
  },
  {
    n: '04',
    tag: 'Lote 6 · Moradia T3',
    title: 'A casa completa',
    desc: 'Do logradouro ajardinado à zona privada dos quartos: três pisos que encaixam num único volume, pensado ao pormenor.',
    photo: '/images/merelim/render-2.jpeg',
  },
]

/** Número de pisos com vista individual (o passo seguinte é o empilhamento). */
const SOLO = 3
/** Largura partilhada dos planos no empilhamento (mesma escala entre pisos). */
const STACK_W = 150
/** Posições (px, pré-scale) de cada piso na axonometria explodida. */
const STACK_POS = [
  { x: 0, y: 140 },
  { x: 74, y: 28 },
  { x: 58, y: -159 },
]

const EASE_MASK = 'power4.out'
const EASE_DRAW = 'power2.inOut'

/**
 * Momento assinatura: a planta real "imprime-se" no chão (wipe/clip-path) e a
 * seguir a caixa levanta-se — as linhas verticais crescem em altura e o teto
 * aparece. Tudo numa timeline única, para poder ser interrompida/morta se o
 * utilizador mudar de piso a meio.
 */
function drawPlan(container: HTMLElement, tl: gsap.core.Timeline, at: number) {
  const img = container.querySelector<HTMLElement>('[data-plan]')
  const ceil = container.querySelector<HTMLElement>('[data-ceil]')
  const posts = container.querySelectorAll<HTMLElement>('[data-post]')
  if (img) {
    tl.fromTo(
      img,
      { clipPath: 'inset(0 0 100% 0)' },
      { clipPath: 'inset(0 0 0% 0)', duration: 0.85, ease: EASE_DRAW },
      at
    )
  }
  if (posts.length) {
    // paredes a "crescer" em altura (a largura do segmento é o pé-direito)
    tl.from(posts, { width: 0, duration: 0.5, ease: 'power2.out', stagger: 0.06 }, at + 0.4)
  }
  if (ceil) {
    tl.from(ceil, { opacity: 0, duration: 0.5, ease: 'power2.out' }, at + 0.7)
  }
}

/**
 * "Scrollytelling" da planta do Lote 6: enquanto se faz scroll, a fotografia
 * interior e o texto mudam por piso, com um esquema AXONOMÉTRICO discreto (a
 * branco) a acompanhar — e a construir-se traço a traço quando entra.
 * Fixação por `position: sticky` (robusto) e progresso via ScrollTrigger.
 *
 * Acessibilidade / robustez:
 * — sem JS: o piso 01 fica visível (estilos inline estáticos, nunca escondido
 *   por JS que não correu);
 * — `prefers-reduced-motion`: o percurso continua a funcionar (o piso muda com
 *   o scroll) mas as trocas são instantâneas, sem animação;
 * — < 1024px: versão empilhada nativa, sem pin nem scrub.
 */
export default function FloorPlanStory() {
  const outerRef = useRef<HTMLDivElement>(null)
  const photoRefs = useRef<(HTMLDivElement | null)[]>([])
  const axonRefs = useRef<(HTMLDivElement | null)[]>([])
  const barRefs = useRef<(HTMLSpanElement | null)[]>([])
  const eyebrowRef = useRef<HTMLParagraphElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  const tagRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const barsRef = useRef<HTMLDivElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const stackFloorRefs = useRef<(HTMLDivElement | null)[]>([])

  // 'full' = desktop animado · 'reduced' = desktop com reduced-motion ·
  // 'off' = mobile (a versão empilhada é a única visível)
  const modeRef = useRef<'off' | 'full' | 'reduced'>('off')
  const stRef = useRef<ScrollTrigger | null>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const prevRef = useRef(0)
  const idxRef = useRef(0)
  const enteredRef = useRef(false)

  const [active, setActive] = useState(0)

  // Revelação de texto com máscara (wrappers overflow-hidden no JSX)
  const animateTextIn = (tl: gsap.core.Timeline, at: number, dir: number) => {
    tl.fromTo(
      [tagRef.current, titleRef.current],
      { yPercent: 112 * dir },
      { yPercent: 0, duration: 0.9, ease: EASE_MASK, stagger: 0.09, immediateRender: true },
      at
    )
    tl.fromTo(
      numRef.current,
      { yPercent: 118 * dir },
      { yPercent: 0, duration: 1.05, ease: EASE_MASK, immediateRender: true },
      at
    )
    tl.fromTo(
      descRef.current,
      { opacity: 0, y: 18 * dir },
      { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', immediateRender: true },
      at + 0.16
    )
  }

  // ── Setup: ScrollTrigger + entrada (desktop), com teardown via matchMedia ──
  useEffect(() => {
    const outer = outerRef.current
    if (!outer) return
    const mm = gsap.matchMedia()

    // Coloca cada piso na sua posição do empilhamento (layer começa oculto)
    const placeStack = () => {
      gsap.set(stackRef.current, { autoAlpha: 0 })
      stackFloorRefs.current.forEach((el, i) => {
        if (el) gsap.set(el, { xPercent: -50, yPercent: -50, x: STACK_POS[i].x, y: STACK_POS[i].y })
      })
    }

    const makeST = (full: boolean) =>
      ScrollTrigger.create({
        trigger: outer,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const raw = self.progress * floors.length
          const idx = Math.max(0, Math.min(floors.length - 1, Math.floor(raw)))
          idxRef.current = idx
          setActive((prev) => (prev === idx ? prev : idx))
          // barras de progresso: pisos passados cheios, atual em scrub
          barRefs.current.forEach((bar, i) => {
            if (!bar) return
            gsap.set(bar, { scaleX: i < idx ? 1 : i > idx ? 0 : full ? raw - idx : 1 })
          })
          // "Ken Burns" subtil na foto ativa, ligado ao progresso do piso
          if (full) {
            const photo = photoRefs.current[idx]
            if (photo) gsap.set(photo, { scale: 1.02 + (raw - idx) * 0.06 })
          }
        },
      })

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      modeRef.current = 'full'
      stRef.current = makeST(true)
      placeStack()

      // Esconde só DEPOIS de montar (se o JS falhar, o conteúdo SSR fica visível)
      if (!enteredRef.current) {
        gsap.set([eyebrowRef.current, barsRef.current, metaRef.current], { opacity: 0, y: 14 })
        gsap.set(descRef.current, { opacity: 0 })
        gsap.set([tagRef.current, titleRef.current, numRef.current], { yPercent: 112 })
        gsap.set([photoRefs.current[0], axonRefs.current[0]], { opacity: 0 })
      }

      const startEntrance = () => {
        if (enteredRef.current) return
        enteredRef.current = true
        // moldura (eyebrow, barras, legenda) — tween separado para nunca ser
        // morto por uma troca de piso a meio
        gsap.to([eyebrowRef.current, barsRef.current, metaRef.current], {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.12,
        })
        const i = idxRef.current
        if (i !== 0) {
          // Entrou já noutro piso (ex.: recarregou a página a meio da secção):
          // revela esse piso de imediato para nada ficar preso invisível.
          gsap.set([tagRef.current, titleRef.current, numRef.current], { yPercent: 0 })
          gsap.set(descRef.current, { opacity: 1, y: 0 })
          gsap.set(photoRefs.current[i], { opacity: 1 })
          if (i < SOLO) gsap.set(axonRefs.current[i], { opacity: 1, y: 0 })
          else gsap.set(stackRef.current, { autoAlpha: 1 })
          return
        }
        const tl = gsap.timeline()
        tlRef.current = tl
        animateTextIn(tl, 0.1, 1)
        tl.fromTo(
          photoRefs.current[0],
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
          0.2
        )
        tl.set(axonRefs.current[0], { opacity: 1 }, 0.25)
        const cont = axonRefs.current[0]
        if (cont) drawPlan(cont, tl, 0.25)
      }

      const enterST = ScrollTrigger.create({
        trigger: outer,
        start: 'top 78%',
        once: true,
        onEnter: startEntrance,
      })

      // O ScrollTrigger não dispara `onEnter` retroativamente quando a secção já
      // está dentro/além do ponto de entrada ao montar (ex.: reload a meio da
      // página). Revela já nesse caso — o conteúdo nunca pode ficar invisível.
      if (outer.getBoundingClientRect().top < window.innerHeight * 0.78) {
        startEntrance()
      }

      return () => {
        enterST.kill()
        stRef.current = null
        modeRef.current = 'off'
      }
    })

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: reduce)', () => {
      modeRef.current = 'reduced'
      stRef.current = makeST(false)
      placeStack()
      return () => {
        stRef.current = null
        modeRef.current = 'off'
      }
    })

    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Transição entre pisos ──
  useIsoLayoutEffect(() => {
    const prev = prevRef.current
    if (prev === active) return
    prevRef.current = active
    const mode = modeRef.current
    if (mode === 'off') return

    const photoPrev = photoRefs.current[prev]
    const photoNext = photoRefs.current[active]
    const axonPrev = axonRefs.current[prev]
    const axonNext = axonRefs.current[active]

    tlRef.current?.kill()

    if (mode === 'reduced') {
      // troca instantânea, sem movimento
      if (photoPrev) gsap.set(photoPrev, { opacity: 0 })
      if (photoNext) gsap.set(photoNext, { opacity: 1 })
      if (axonPrev) gsap.set(axonPrev, { opacity: 0 })
      if (axonNext) gsap.set(axonNext, { opacity: 1, y: 0 })
      gsap.set(stackRef.current, { autoAlpha: active === SOLO ? 1 : 0 })
      return
    }

    enteredRef.current = true
    const dir = active > prev ? 1 : -1 // 1 = a subir na casa
    const tl = gsap.timeline()
    tlRef.current = tl

    // foto interior (protagonista) — crossfade sereno
    if (photoPrev) tl.to(photoPrev, { opacity: 0, duration: 0.55, ease: 'power2.out' }, 0)
    if (photoNext) {
      tl.fromTo(
        photoNext,
        { opacity: 0 },
        { opacity: 1, duration: 0.9, ease: 'power2.out', immediateRender: true },
        0.1
      )
    }

    // axonometria — três casos: montar a casa (entrar no passo 4), desmontar
    // (sair do passo 4), ou a troca normal entre pisos individuais
    if (active === SOLO) {
      // a casa monta-se: o piso solo sai e os três pisos empilham-se em
      // sequência, cada um a construir-se ao assentar
      if (axonPrev) {
        tl.to(axonPrev, { opacity: 0, y: 24, duration: 0.4, ease: 'power2.in' }, 0)
        tl.set(axonPrev, { y: 0 }, 0.45)
      }
      tl.set(stackRef.current, { autoAlpha: 1 }, 0.2)
      stackFloorRefs.current.forEach((el, i) => {
        if (!el) return
        const at = 0.25 + i * 0.3
        tl.fromTo(
          el,
          { y: STACK_POS[i].y - 110, autoAlpha: 0 },
          { y: STACK_POS[i].y, autoAlpha: 1, duration: 0.85, ease: 'power3.out', immediateRender: true },
          at
        )
        drawPlan(el, tl, at)
      })
    } else if (prev === SOLO) {
      // desmonta: a casa completa sai e volta a vista de um piso
      tl.to(stackRef.current, { autoAlpha: 0, duration: 0.45, ease: 'power2.out' }, 0)
      if (axonNext) {
        tl.fromTo(
          axonNext,
          { opacity: 0, y: -36 * dir },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', immediateRender: true },
          0.2
        )
        drawPlan(axonNext, tl, 0.2)
      }
    } else {
      // troca normal — o piso antigo desce para fora, o novo assenta vindo de
      // cima (a direção inverte quando se volta para trás), e constrói-se
      if (axonPrev) {
        tl.to(axonPrev, { opacity: 0, y: 28 * dir, duration: 0.45, ease: 'power2.in' }, 0)
        tl.set(axonPrev, { y: 0 }, 0.5)
      }
      if (axonNext) {
        tl.fromTo(
          axonNext,
          { opacity: 0, y: -36 * dir },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', immediateRender: true },
          0.16
        )
        drawPlan(axonNext, tl, 0.16)
      }
    }

    animateTextIn(tl, 0.02, dir)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  // Clique numa barra → scroll até ao piso correspondente (via Lenis se ativo)
  const scrollToFloor = (i: number) => {
    const st = stRef.current
    if (!st) return
    const y = st.start + ((i + 0.5) / floors.length) * (st.end - st.start)
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number) => void } }).__lenis
    if (modeRef.current === 'full' && lenis) lenis.scrollTo(y)
    else window.scrollTo({ top: y, behavior: modeRef.current === 'full' ? 'smooth' : 'auto' })
  }

  const current = floors[active]

  return (
    <section className="bg-[#1F3F44] text-white">
      {/* ── DESKTOP: scrollytelling fixo ── */}
      <div ref={outerRef} className="hidden lg:block relative" style={{ height: `${floors.length * 100}vh` }}>
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          {/* textura */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
              backgroundSize: '38px 38px',
            }}
          />
          <div className="relative max-w-7xl mx-auto w-full px-8 grid grid-cols-[1.15fr_0.85fr] gap-12 items-center">
            {/* Painel de texto + foto (protagonista) */}
            <div>
              <p
                ref={eyebrowRef}
                className="flex items-center gap-3 text-[#6BBFC9] text-sm font-semibold uppercase tracking-widest mb-5"
              >
                <span className="inline-block h-px w-8 bg-[#6BBFC9]/60" aria-hidden="true" />
                Merelim S. Pedro · Lote 6 · Percurso pela planta
              </p>

              <div className="flex items-start gap-5 mb-6">
                <div className="overflow-hidden">
                  <span
                    ref={numRef}
                    className="block font-serif text-6xl font-bold text-white/15 leading-none tabular-nums"
                  >
                    {current.n}
                  </span>
                </div>
                <div>
                  <div className="overflow-hidden">
                    <p
                      ref={tagRef}
                      className="text-[#6BBFC9] text-xs font-semibold uppercase tracking-widest mb-1"
                    >
                      {current.tag}
                    </p>
                  </div>
                  <div className="overflow-hidden pb-1 -mb-1">
                    <h3 ref={titleRef} className="font-serif text-3xl xl:text-4xl font-bold leading-tight">
                      {current.title}
                    </h3>
                  </div>
                </div>
              </div>

              <p ref={descRef} className="text-white/70 leading-relaxed max-w-md mb-8 min-h-[3.5rem]">
                {current.desc}
              </p>

              {/* Foto interior — crossfade + Ken Burns subtil ligado ao scroll */}
              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden ring-1 ring-white/10">
                {floors.map((fl, i) => (
                  <div
                    key={fl.photo}
                    ref={(el) => {
                      photoRefs.current[i] = el
                    }}
                    className="absolute inset-0 will-change-transform"
                    style={{ opacity: i === 0 ? 1 : 0 }}
                  >
                    <Image
                      src={fl.photo}
                      alt={fl.title}
                      fill
                      sizes="(max-width: 1280px) 55vw, 700px"
                      className="object-cover"
                    />
                  </div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F3F44]/25 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Progresso por piso — a barra ativa enche com o scroll; clique navega */}
              <div ref={barsRef} className="flex gap-2.5 mt-6">
                {floors.map((fl, i) => (
                  <button
                    key={fl.n}
                    type="button"
                    onClick={() => scrollToFloor(i)}
                    aria-label={`Ver ${fl.tag.toLowerCase()} — ${fl.title}`}
                    className="group flex-1 cursor-pointer py-2"
                  >
                    <span className="block h-[3px] rounded-full bg-white/10 overflow-hidden transition-colors duration-300 group-hover:bg-white/25 motion-reduce:transition-none">
                      <span
                        ref={(el) => {
                          barRefs.current[i] = el
                        }}
                        className="block h-full w-full rounded-full bg-[#6BBFC9] origin-left"
                        style={{ transform: `scaleX(${i === 0 ? 1 : 0})` }}
                      />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Axonometria — constrói-se a cada piso; no fim a casa empilha-se */}
            <div className="flex flex-col">
              <div className="relative h-[26rem]">
                {floors.slice(0, SOLO).map((fl, i) => (
                  <div
                    key={fl.n}
                    ref={(el) => {
                      axonRefs.current[i] = el
                    }}
                    className="absolute inset-0 will-change-transform"
                    style={{ opacity: i === 0 ? 1 : 0 }}
                  >
                    <AxonFloor id={i} className="w-full h-full" />
                  </div>
                ))}

                {/* Passo 4 — a casa completa em axonometria explodida */}
                <div
                  ref={stackRef}
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{ opacity: 0, transform: 'scale(0.62)' }}
                >
                  {floors.slice(0, SOLO).map((fl, i) => (
                    <div
                      key={fl.n}
                      ref={(el) => {
                        stackFloorRefs.current[i] = el
                      }}
                      className="absolute left-1/2 top-1/2 w-[150px] will-change-transform"
                    >
                      <AxonFloor id={i} width={STACK_W} className="w-full" />
                    </div>
                  ))}
                </div>
              </div>
              {/* indicador de nível (tipo elevador) — na casa completa acendem todos */}
              <div ref={metaRef} className="mt-6 flex items-center justify-center">
                <div className="flex flex-col-reverse gap-[5px]" aria-hidden="true">
                  {floors.slice(0, SOLO).map((fl, i) => {
                    const lit = i === active || active === SOLO
                    return (
                      <span
                        key={fl.n}
                        className="block h-[2px] rounded-full transition-all duration-500 motion-reduce:transition-none"
                        style={{
                          width: lit ? 28 : 14,
                          backgroundColor: lit ? '#6BBFC9' : 'rgba(255,255,255,0.22)',
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE: versão empilhada estática ── */}
      <div className="lg:hidden px-4 sm:px-6 py-16">
        <p className="text-[#6BBFC9] text-sm font-semibold uppercase tracking-widest mb-3">
          Merelim S. Pedro · Lote 6
        </p>
        <h3 className="font-serif text-3xl font-bold mb-8">Um percurso pela planta</h3>
        <div className="space-y-8">
          {floors.slice(0, SOLO).map((fl, i) => (
            <div key={fl.n} className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
              <div className="relative w-full aspect-[16/10]">
                <Image src={fl.photo} alt={fl.title} fill sizes="100vw" className="object-cover" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="text-[#6BBFC9] text-xs font-semibold uppercase tracking-widest mb-1">
                      {fl.tag}
                    </p>
                    <h4 className="font-serif text-xl font-bold">{fl.title}</h4>
                  </div>
                  <AxonFloor id={i} iso={false} className="w-16 h-24 flex-shrink-0 opacity-80" />
                </div>
                <p className="text-white/70 text-sm leading-relaxed">{fl.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
