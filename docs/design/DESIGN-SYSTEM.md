# Design System v2 — Painel Temático
### Julho 2026 · especificação para implementação futura (não aplicado ainda)

> Unifica os dois mundos do site — **institucional claro** e **produto dark premium** — sob os mesmos
> tokens. Mantém o branding existente e eleva-o: gold usado com avareza, tipografia maior, menos
> elementos por ecrã. Formato pronto a copiar para `src/app/globals.css` (Tailwind v4 `@theme`).

---

## 1. Tokens (`@theme` proposto)

```css
@import "tailwindcss";

@theme inline {
  /* ── Marca ── */
  --color-brand:        #00545F;  /* teal ativo — ações no tema claro */
  --color-brand-hover:  #006B78;
  --color-brand-dark:   #1F3F44;  /* verde estrutural — headings, fundos institucionais */
  --color-accent:       #4ecdc4;  /* SÓ decorativo (ícones, detalhes) — nunca texto sobre branco (1.9:1) */

  /* ── Premium (tema produto) ── */
  --color-gold:         #C9A96E;  /* preço, estado, ações premium — 8:1 sobre dark ✓ */
  --color-gold-soft:    #C9A96E1F; /* 12% — fundos de badge/ícone */
  --color-dark:         #07100f;  /* fundo base produto */
  --color-dark-2:       #0d1a1c;  /* secções alternadas */
  --color-dark-3:       #101f22;  /* cards/elevação sobre dark */

  /* ── Neutros (substituem os slate-* hardcoded) ── */
  --color-ink:          #1F3F44;  /* texto principal claro = brand-dark */
  --color-ink-soft:     #4A5A5E;  /* texto secundário sobre claro — 7:1 ✓ */
  --color-ink-mute:     #6B7A7E;  /* legendas sobre claro — 4.6:1 ✓ (piso AA) */
  --color-paper:        #FFFFFF;
  --color-warm:         #F2EEEE;  /* fundo alternado institucional (warm, não slate) */
  --color-warm-border:  #E8E3E3;
  --color-cream:        #FAF8F5;  /* substituto do #f8fafc slate — warm premium */

  /* Sobre dark: texto por STEPS fixos, nunca opacidade livre */
  --color-on-dark:        #F5F5F3;   /* títulos/valores */
  --color-on-dark-soft:   #C3C9C7;   /* corpo — 9:1 ✓ */
  --color-on-dark-mute:   #8FA09E;   /* legendas — 4.6:1 ✓ (PISO mínimo, nada abaixo) */

  /* ── Estados de unidade (lógica comercial §5 do BRIEFING) ── */
  --color-disponivel:   #C9A96E;   /* gold — o único estado "quente" */
  --color-reservado:    #D9B24A;   /* âmbar discreto */
  --color-vendido:      #8FA09E;   /* apagado */
  --color-embreve:      #7FB6C4;   /* fechado, frio */

  /* ── Tipografia ── */
  --font-sans:   var(--font-cera);
  --font-serif:  var(--font-playfair);

  --text-display: clamp(2.5rem, 6vw, 5.5rem);   /* h1 hero (antes ia a 10rem — demasiado) */
  --text-h1:      clamp(2rem, 4.5vw, 3.5rem);
  --text-h2:      clamp(1.5rem, 3vw, 2.5rem);
  --text-h3:      clamp(1.25rem, 2vw, 1.75rem);
  --text-lead:    clamp(1.05rem, 1.6vw, 1.35rem); /* parágrafo destaque (descrições) */
  --text-body:    1rem;                            /* corpo NUNCA abaixo de 1rem em mobile */
  --text-small:   0.875rem;
  --text-label:   0.75rem;                         /* labels uppercase — piso absoluto (antes: 9–10px) */

  /* ── Espaçamento (base 4pt; secções em escala própria) ── */
  --spacing-section:    clamp(4rem, 10vw, 8rem);   /* padding vertical de secção */
  --spacing-section-sm: clamp(2.5rem, 6vw, 4rem);

  /* ── Raio ── */
  --radius-card: 1rem;      /* cards, forms */
  --radius-btn:  0.75rem;   /* botões */
  --radius-pill: 999px;     /* badges */

  /* ── Elevação (sombras quentes, não cinza-azulado) ── */
  --shadow-card:  0 1px 3px rgb(31 63 68 / 0.06), 0 8px 24px rgb(31 63 68 / 0.07);
  --shadow-hover: 0 2px 6px rgb(31 63 68 / 0.08), 0 16px 40px rgb(31 63 68 / 0.14);
  --shadow-gold:  0 8px 32px rgb(201 169 110 / 0.25);  /* CTAs premium */

  /* ── Motion ── */
  --ease-premium: cubic-bezier(0.22, 1, 0.36, 1);  /* easeOutQuint — tudo usa esta */
  --duration-fast:   150ms;   /* hover, focus */
  --duration-base:   300ms;   /* transições de estado */
  --duration-reveal: 700ms;   /* reveals de scroll (antes: 1200ms — lento demais) */
}
```

**Regras de uso dos tokens**
1. **Gold com avareza:** preço, estado "disponível", CTA primário premium e micro-acentos. Nunca em parágrafos.
2. **Texto sobre dark:** só os 3 steps (`on-dark`, `-soft`, `-mute`). Proibido `opacity` livre em texto.
3. **Slate proibido:** `#64748b`, `#e2e8f0`, `#f8fafc`, `#94a3b8` → substituir por `ink-*`/`warm`/`cream`.
4. **Alvos táteis:** qualquer elemento interativo ≥ 44×44px em mobile (padding conta).
5. **Motion:** tudo com `--ease-premium`; reveals de scroll só dentro de
   `@media (prefers-reduced-motion: no-preference)`; conteúdo visível por defeito (anima-se, não se esconde).

---

## 2. Componentes core

### Botões (hierarquia única nos dois temas)
| Variante | Claro | Dark | Uso |
|---|---|---|---|
| **Primário** | fundo `brand`, texto branco, hover `brand-hover` + `shadow-hover` | fundo `gold`, texto `#0A0A08`, hover brilho +4% + `shadow-gold` | 1 por ecrã: a ação do funil |
| **Secundário** | borda `brand-dark/25`, texto `ink`, hover fundo `warm` | borda `on-dark/20`, texto `on-dark-soft`, hover fundo branco/5% | ações de apoio (WhatsApp, ligar) |
| **Ghost** | texto `brand`, hover sublinhado animado | texto `gold`, idem | links de secção ("Ver todos") |

Especificação comum: altura ≥48px mobile / 44px desktop · `radius-btn` · `text-small` semibold ·
`tracking-wide` · transição `--duration-fast` · focus ring 2px `brand`/`gold` com offset 2px (visível sempre).

### Barra sticky de conversão (novo — o componente nº1 do funil)
Mobile, páginas de imóvel e projeto: barra fixa inferior, fundo `dark-2/95` + blur, safe-area-inset,
3 ações: **Ligar** (secundário, ícone) · **WhatsApp** (secundário, ícone) · **Agendar visita** (primário gold, flex-1).
Aparece após 30% de scroll (não tapa o hero), esconde no formulário. Substitui o WhatsApp flutuante nestas páginas.
Desktop: painel lateral sticky com preço + as 3 ações.

### PropertyCard v2
Imagem 4:3 com `next/image` + placeholder blur · badge de tipo no canto (pill, `dark/80` + blur, texto branco) ·
preço em `gold`/`brand` serif no rodapé do card com tipologia à direita · hover: `shadow-hover` + zoom 1.03 da
imagem (700ms), sem translate do card · título serif `text-h3` · placeholder sem foto: gradiente
`brand-dark→dark-2` com marca de água "PT" (corrige o `to-navy` quebrado).

### Badge de estado de unidade (lógica §5 do BRIEFING)
| Estado | Visual |
|---|---|
| `disponivel` | pill `gold-soft` + texto `gold` + ponto pulsante · preço visível · CTA "Quero saber mais" |
| `reservado` | pill âmbar discreto + faixa diagonal subtil · sem preço · card a 80% |
| `vendido` | pill `vendido` · card a 45%, dessaturado · sem CTA |
| `em_breve` | pill `embreve` + ícone relógio · sem preço · CTA "Avisar-me quando disponível" |

### Formulários
Labels `text-label` uppercase a `on-dark-mute`/`ink-mute` (nunca abaixo de 4.5:1) · inputs altura 48px,
fundo branco/5% (dark) ou branco (claro), borda 1px, focus: borda `gold`/`brand` + ring · checkbox RGPD
obrigatória com link para a política · botão submit primário full-width · sucesso com ícone + próximo passo
("Entretanto, veja imóveis semelhantes →" — nunca beco sem saída).

### Navbar
Claro/transparente como hoje, com adições: telefone clicável no desktop (à esquerda do CTA), item "Imóveis"
na navegação (hoje só existe como CTA), menu mobile em ecrã completo com animação stagger e focus trap.
Nas páginas produto mantém-se a nav minimal — mas com o mesmo componente de CTA e alvos ≥44px.

### Footer
4 colunas como hoje + linha legal: Política de Privacidade · Termos · **Livro de Reclamações** (logo oficial) ·
RGPD. Social (Instagram/Facebook). Nas páginas produto, mini-footer ganha os mesmos links legais.

---

## 3. Imagens e placeholders premium

Enquanto não há fotografia profissional:
- **Heroes:** arquitetura contemporânea portuguesa — luz natural, betão + madeira, céu limpo. Unsplash
  (coleções de arquitetura), sempre com overlay `dark/40→dark/85` para legibilidade.
- **Interiores:** salas com luz lateral, materiais naturais, sem pessoas.
- **Texturas:** microcimento, madeira de carvalho, pedra — para fundos de secção institucional a 4–6% de opacidade.
- **Regra:** nunca imagem sem overlay quando há texto por cima; nunca stock com pessoas/marcas visíveis.

## 4. Microinterações (catálogo)
1. CTA primário: hover eleva sombra + 1px translate-y (150ms) — nada de "pulos".
2. Cards: zoom da imagem 1.03 em 700ms `--ease-premium`; conteúdo imóvel.
3. Reveals: 1 stagger de 60ms por item, translateY 16px→0, 700ms, uma vez.
4. Preço no hero produto: contador suave só na primeira visualização (respeitando reduced-motion).
5. Sticky bar: entra com slide-up 300ms ao passar 30% de scroll.
6. Links ghost: sublinhado que cresce da esquerda (200ms).
7. Focus visível em TUDO (ring 2px) — acessibilidade é premium.
