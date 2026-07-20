# Auditoria UX/UI — Painel Temático
### Método FABLE · Julho 2026

> Auditoria à camada visual e de conversão do site, com evidência medida no browser (375px/768px/1280px)
> e no código. Critério central: **o funil real** — o cliente recebe o link do imóvel/projeto
> enviado pelo comercial (WhatsApp/SMS) depois do contacto telefónico. As páginas de imóvel e de
> projeto são as landing pages; a homepage é camada de notoriedade e confiança.

**Método FABLE** (interpretação usada nesta auditoria):
- **F — Fundações:** branding, tokens, tipografia, cor, consistência
- **A — Arquitetura:** jornadas do funil, navegação, cross-sell, Lei de Hick
- **B — Blocos:** componentes UI, Gestalt, Lei de Fitts
- **L — Layout & responsivo:** grids, hierarquia, mobile-first
- **E — Emoção & conversão:** microinterações, confiança, CTAs, CRO, WCAG, SEO visual

---

## 1. Pontuação

Ponderação pelo funil real: Imóvel 30% · Projeto 25% · Pesquisa 15% · Homepage 15% · Contacto 10% · Nav/Footer 5%.

| Superfície | F | A | B | L | E | Média |
|---|---|---|---|---|---|---|
| Página de Imóvel (landing) | 7.5 | 4.5 | 6.5 | 7.0 | 5.0 | **6.1** |
| Página de Projeto (lançamentos) | 7.0 | 3.5 | 5.5 | 7.0 | 4.0 | **5.4** |
| Pesquisa/Listagem | 5.0 | 6.0 | 5.5 | 6.0 | 5.0 | **5.5** |
| Homepage | 5.0 | 5.5 | 5.5 | 5.5 | 4.5 | **5.2** |
| Contacto/Formulários | 6.0 | 6.5 | 6.5 | 6.5 | 6.0 | **6.3** |
| Navegação/Footer | 5.5 | 6.0 | 6.0 | 6.5 | 5.0 | **5.8** |
| **GLOBAL (ponderado)** | | | | | | **5.7 / 10** |

**Leitura:** a base estética das páginas luxury é forte (F e L acima da média — dark premium, gold,
tipografia serif, 100svh, clamp). O que falta é **conversão e arquitetura de funil** (A e E): o visitante
aterra bem mas não é conduzido — sem CTA persistente, sem cross-sell, sem captura de lead no projeto,
e a primeira impressão do link partilhado está comprometida.

---

## 2. Findings (evidência → princípio → impacto → prioridade)

### P0 — Corrigir antes de qualquer campanha

**F-01 · Título duplicado em todos os links partilhados**
Evidência (medida): `<title>Moradia T4 com Piscina | Painel Temático | Painel Temático</title>` — o
`generateMetadata` de `imoveis/[slug]/page.tsx:26` acrescenta ` | Painel Temático` e o template do
`layout.tsx:37` (`%s | Painel Temático`) acrescenta outra vez. Afeta imóveis e projetos.
Princípio: Nielsen #5 (prevenção de erros) / consistência da marca. Momento do funil: **aterragem por link** —
é literalmente a primeira linha que o cliente vê no WhatsApp. Impacto: amadorismo na primeira impressão.
Correção: nas páginas, definir `title: imovel.titulo` (sem sufixo) e deixar o template do layout compor.

**F-02 · Link de imóvel partilhado sem imagem de pré-visualização**
Evidência: `og:image` só é emitido se `imovel.fotos[0]` existir (`page.tsx:29`); sem fallback. Os imóveis
atuais têm `fotos: []` → o cartão no WhatsApp chega **sem imagem**. Falta também `og:image` com dimensões
declaradas e peso otimizado (o storage devolve o original).
Princípio: CRO (primeira impressão) / SEO social. Momento: **aterragem por link**. Impacto: CTR do link
enviado pelo comercial cai drasticamente — é o momento mais valioso do funil.
Correção: fallback de marca (imagem OG 1200×630 com logo + tagline), e servir foto redimensionada.

**F-03 · Sem CTA de conversão above-the-fold nem persistente na página de imóvel (mobile)**
Evidência (medida a 375×812): único CTA visível ao aterrar é "Contactar" no canto superior — 98×33px
(mínimo recomendado 44px). O bloco de contacto está a ~3000px de profundidade (doc: 3764px). Sem barra sticky.
Princípio: Fitts (alvo pequeno e distante) / CRO. Momento: **aterragem por link** — o cliente que já ligou
ao comercial quer *agir* (ligar de volta, WhatsApp, agendar). Impacto: fricção direta na conversão do
momento mais quente. Correção: barra sticky inferior em mobile com Ligar · WhatsApp · Agendar (ver mockup).

**F-04 · Página de projeto não mostra as unidades**
Evidência (medida em /projetos/esporoes): secção `#unidades` não renderiza (tabela `unidades` sem registos
para o projeto); zero CTAs por fração; `formPresente: false`. O argumento comercial "última unidade de 7"
de Esporões **não existe na página**. O componente `ProjetoForm` está definido em `ProjetoLuxury.tsx:618`
mas nunca é renderizado (código morto) — a página de lançamento não captura leads.
Princípio: CRO / Nielsen #1 (visibilidade do estado). Momento: **lançamento de projeto** — é a página para
onde vais apontar as campanhas SMS/telefone. Impacto: crítico para Trandeiras.
Correção: carregar unidades reais + guia de frações com CTA por fração ("Quero saber mais sobre esta opção")
+ renderizar formulário de captura. Ver mockup `projeto-fracoes.html`.

**F-05 · Colisão de elementos flutuantes no fundo do ecrã mobile**
Evidência (medida a 375px na página de imóvel): botões Partilhar/Copiar/Brochura (y=767), botão WhatsApp
flutuante (y=741) e seletor de idioma (y=755) sobrepõem-se na mesma zona.
Princípio: Gestalt (proximidade gera agrupamento falso) / Fitts (alvos que competem). Impacto: toques errados
no momento de partilhar ou contactar. Correção: consolidar — em mobile, a barra sticky de CTA (F-03) substitui
o WhatsApp flutuante nas páginas de imóvel/projeto; partilha move-se para ícone único no topo.

**F-06 · Hero da homepage aponta para vídeo inexistente**
Evidência (medida): `/videos/hero.mp4` e `/videos/hero-poster.jpg` → 404; `video.readyState: 0`. Resultado:
fundo verde liso sem imagem. Princípio: Nielsen #1. Momento: **confiança**. Correção imediata: fallback de
imagem premium enquanto não há vídeo real (o código já suporta `settings.hero_video_url`).

### P1 — Alto impacto na conversão

**F-07 · Sem cross-sell: as páginas de imóvel e projeto são becos sem saída**
Evidência: depois do bloco de contacto só há um mini-footer. O momento "navegar um pouco mais" do funil
não tem caminho. Princípio: CRO / arquitetura do funil. Correção: secção "Também lhe pode interessar"
(3 cards, mesma tipologia/cidade ou mesmo projeto) antes do footer + link para o projeto-mãe quando o
imóvel é unidade de projeto.

**F-08 · Estatísticas da homepage minam o posicionamento**
Evidência (medida): "7+ · 4+ · 3+" imóveis. Números pequenos comunicam inventário fraco, não exclusividade.
Princípio: prova social mal calibrada (Cialdini/CRO). Correção: substituir por métricas de construtor —
anos de atividade, m² construídos, famílias instaladas, projetos entregues — que crescem com a empresa
e reforçam "construímos o que vendemos" (diferenciador real vs. mediadoras).

**F-09 · Contrastes abaixo de WCAG AA em texto informativo (páginas luxury)**
Evidência (calculada): texto branco a 40% de opacidade sobre `#0d1a1c` ≈ 3.5:1 (AA exige 4.5:1); a 25% ≈ 2.1:1;
legendas a 15–35% por toda a página; labels de formulário a 30–35%. O gold `#C9A96E` sobre dark passa (≈8:1) — usar
mais. Princípio: WCAG 1.4.3. Impacto: legibilidade real em ecrãs ao sol (o cliente está na rua, ao telefone).
Correção: piso mínimo de opacidade 0.65 para texto informativo; hierarquia por tamanho/peso, não só opacidade.

**F-10 · Alvos táteis sistematicamente abaixo de 44px**
Evidência (medida): "Voltar" 16×16px; "Contactar" 33px; botões de partilha 33px; thumbnails do lightbox 32×36px.
Princípio: Fitts / WCAG 2.5.8 (target size ≥24px, recomendado 44px). Correção: padding mínimo em todos os
alvos de navegação/ação em mobile.

**F-11 · Pesquisa: filtros escondidos em mobile e sem ordenação**
Evidência: sidebar de filtros empilha acima da grelha em mobile (empurra resultados para baixo); sem "ordenar
por preço/recentes"; sem contagem por filtro; querystring de preço faz dois `router.push` seguidos
(`ImovelFilters.tsx:115-117` — o primeiro é perdido). Princípio: Hick (boa contenção de opções, má
apresentação) / Nielsen #3. Correção: barra de filtros horizontal compacta + bottom-sheet em mobile,
ordenação, e um único push com min+max.

**F-12 · Homepage viola a própria regra 100svh**
Evidência: `page.tsx:61` usa `h-screen` (100vh) — no iOS Safari a barra de endereço tapa o fundo do hero
(CTAs). As páginas luxury usam `100svh` corretamente. Princípio: consistência interna / regra #4 do BRIEFING.

### P2 — Qualidade premium e coerência

**F-13 · Duas linguagens visuais desligadas**
O site público "clean" (branco, slate `#f8fafc`/`#64748b`, teal) e as páginas luxury (dark `#07100f`, gold)
não partilham tokens nem transição — o clique num card claro salta para um universo escuro sem ponte.
Princípio: Gestalt (continuidade) / branding. Correção: o Design System v2 unifica — dark+gold é o tema
"produto" (imóvel/projeto), o claro é o tema "institucional", com elementos partilhados (tipografia, radius,
motion, gold como fio condutor premium em ambos).

**F-14 · Design system inexistente na prática**
`globals.css` tem 7 cores e 2 fontes; gold/dark não tokenizados (constantes duplicadas em 2 ficheiros);
estilos inline por todo o ImovelLuxury/ProjetoLuxury; cores slate hardcoded (`#64748b`, `#e2e8f0`) misturadas
com a paleta warm (`#F2EEEE`, `#E8E3E3`). Bug latente: `PropertyCard.tsx:14` usa gradiente `to-navy` — classe
inexistente no Tailwind v4 (placeholder silenciosamente quebrado). Correção: `@theme` completo (ver DESIGN-SYSTEM.md).

**F-15 · Animações sem `prefers-reduced-motion` e conteúdo invisível pré-JS**
As secções nascem com `opacity: 0` via IntersectionObserver; sem JS (ou em crawlers) o conteúdo fica invisível;
sem respeito por reduced-motion (WCAG 2.3.3). Parallax via scroll listener em vez de CSS. Correção: animar
com `@media (prefers-reduced-motion: no-preference)`, conteúdo visível por defeito, animação como enhancement.

**F-16 · Imagens sem otimização**
`<img>` plano em cards, galerias e heroes (background-image) — sem `next/image`, sem `sizes`, sem prioridade
no LCP, originais do storage sem redimensionamento. Impacto: LCP alto na aterragem 4G (o momento crítico).
Nota: os domínios já estão em `remotePatterns`? Verificar ao implementar.

**F-17 · Confiança jurídica incompleta no footer**
Sem Política de Privacidade, Termos, e **Livro de Reclamações eletrónico** (obrigatório em Portugal).
AMI/IMPIC presentes (bom). Sem RGPD/consentimento nos formulários (checkbox + link política). Impacto:
confiança + risco legal + bloqueador para remarketing (Brevo/ManyChat precisam de consentimento).

**F-18 · Microdetalhes que traem o premium**
`© 2025` hardcoded nas páginas luxury (estamos em 2026); "Brochura PDF" é um `window.print()` cru;
logo escuro é `.jpg` (sem transparência); mapa Google com filtro CSS invertido (aspeto artificial);
telefone hardcoded `351913440800` em vez do telefone do angariador; ticker do projeto repete o nome 6×
(ruído). Correção: varrimento de detalhes na implementação.

### P3 — Oportunidades

**F-19 · SEO estrutural por explorar** — sem sitemap dinâmico de imóveis/projetos confirmado, sem dados
estruturados (`RealEstateListing`/`Residence` schema.org), h1 correto mas hierarquia h2/h3 saltada nas luxury.
Base necessária para a fase SEM/SEO do funil.

**F-20 · Sem analytics de funil** — GA4/Meta Pixel ausentes (já no roadmap do BRIEFING); sem eventos
(ver_imovel, clicar_whatsapp, submeter_form) não há como otimizar campanhas pagas.

**F-21 · Prova social invisível** — testemunhos só aparecem na página de projeto se existirem na DB (não há);
sem selo "construtor + promotor" destacado, sem contagem de obras entregues. O diferenciador real da empresa
(constrói o que vende) não é comunicado visualmente.

---

## 3. Melhorias justificadas (síntese acionável)

| # | Melhoria | Findings | Momento do funil |
|---|---|---|---|
| M1 | Corrigir metadados de partilha (título único, og:image com fallback de marca, dimensões) | F-01, F-02 | Aterragem |
| M2 | Barra sticky de conversão mobile (Ligar · WhatsApp · Agendar) nas páginas de imóvel e projeto | F-03, F-05, F-10 | Aterragem |
| M3 | Guia de frações no projeto: cards por unidade com estado visual + CTA por fração + formulário | F-04 | Lançamento |
| M4 | Secção "Também lhe pode interessar" + ligação imóvel↔projeto | F-07 | Navegar mais |
| M5 | Hero homepage com imagem/vídeo real + stats de construtor | F-06, F-08 | Confiança |
| M6 | Tokens e tema unificado (Design System v2) + varrimento de contraste e alvos táteis | F-09, F-10, F-13, F-14 | Todos |
| M7 | Filtros horizontais + ordenação + bottom-sheet mobile na pesquisa | F-11 | Navegar mais |
| M8 | Footer legal completo + consentimento RGPD nos formulários | F-17 | Confiança/Retenção |
| M9 | Animações acessíveis + imagens otimizadas (next/image, LCP) | F-15, F-16 | Aterragem |
| M10 | Schema.org + sitemap + eventos GA4/Pixel | F-19, F-20 | SEM/SEO |

---

## 4. Roadmap

### Quick Wins (1 sessão, risco baixo)
1. M1 — metadados de partilha (F-01 é uma linha por página; fallback OG é um ficheiro)
2. F-06 — fallback de imagem no hero da homepage + F-12 (`100svh`)
3. F-18 — varrimento de microdetalhes (ano, telefone do angariador, logo PNG)
4. M6 (parte 1) — `@theme` novo em `globals.css` com todos os tokens (sem redesenhar nada ainda)
5. F-09/F-10 (parte 1) — pisos de opacidade e alvos ≥44px nas páginas luxury

### Médio Prazo (o redesign, por ordem de funil)
1. M2 — barra sticky de conversão mobile (imóvel + projeto)
2. M3 — guia de frações (Trandeiras como piloto; requer carregar unidades na DB)
3. M4 — cross-sell nas duas páginas
4. M7 — pesquisa redesenhada
5. M5 — homepage (hero, stats de construtor, secção confiança com prova social)
6. M8 — footer legal + RGPD
7. M9 — animações e imagens

### Longo Prazo (diferenciação + growth)
1. M10 — analytics de funil (pré-requisito das campanhas pagas)
2. Integração Brevo/ManyChat: captura de consentimento, sequência pós-lead, remarketing à base de dados
3. Planta interativa SVG com unidades clicáveis (Trandeiras)
4. Virtual tour (Matterport/Kuula) e storytelling de scroll (GSAP) nos projetos
5. Domínio próprio paineltematico.pt (os links partilhados ganham autoridade)

---

## 5. Recomendações estratégicas

1. **Trata o link partilhado como o teu anúncio nº1.** Antes de qualquer campanha, M1+M2 têm de estar
   em produção — cada link enviado por telefone é um anúncio de custo zero com intenção máxima.
2. **A página de projeto é o produto.** Para lançamentos à base de dados, a página tem de responder em
   30 segundos: o que é, onde é, o que resta, quanto custa, o que faço a seguir. O guia de frações é
   a peça central — não são 8 anúncios, é um produto com 8 opções.
3. **Vende o diferenciador de construtor.** Sotheby's vende curadoria; a Painel Temático constrói o que
   vende. Timeline de obra, materiais, equipa — isso é o "premium" autêntico da marca, e já existe no
   admin (atualizações de obra); falta dar-lhe palco.
4. **Premium é subtração.** O caminho não é acrescentar efeitos — é menos elementos por ecrã, mais
   whitespace, tipografia maior, gold usado com avareza (só preço, estado e ações), microinterações de
   100–300ms. Os mockups seguem esta régua.
5. **Coerência entre mundos.** O tema claro (institucional) e o dark (produto) devem sentir-se como duas
   divisões da mesma casa — mesmos tokens, mesma voz. É isso que o Design System v2 resolve.

*Entregáveis relacionados: `DESIGN-SYSTEM.md` (tokens e componentes) e `mockups/` (6 superfícies navegáveis).*
