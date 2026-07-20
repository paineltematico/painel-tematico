# Painel Temático — Briefing de Projeto

> Documento de contexto para novas sessões de desenvolvimento.
> Actualizado: Julho 2026

---

## 1. O Produto

**Painel Temático** é uma empresa de construção e promoção imobiliária sediada em Braga, Portugal.

Este repositório é a plataforma digital proprietária da empresa — funciona simultaneamente como:
- **Site público de vendas** (homepage, projetos, imóveis, contacto, blog)
- **Painel de gestão interno** (`/admin/*`) com CRM, leads, projetos, equipa, estatísticas

**Posicionamento:** Produto de média gama com execução premium. Não somos luxo, mas queremos ser a referência de profissionalismo e detalhe nos projetos de pequena escala em Braga. O cliente deve sentir que há mais cuidado aqui do que nas grandes promotoras.

**Tom de comunicação:** Direto, confiante, sem floreado. Português de Portugal correto. Nunca pomposo.

---

## 2. Stack Técnica

| Componente | Tecnologia |
|---|---|
| Framework | Next.js 16 com Turbopack |
| Base de dados | Supabase (PostgreSQL + Storage) |
| CSS | Tailwind CSS v4 |
| Linguagem | TypeScript |
| Deploy | Vercel (auto-deploy a cada push para `main`) |
| Autenticação | JWT próprio (não Supabase Auth) com cookies httpOnly |
| Servidor local | `npm run dev` → porta **3001** |

**Ficheiros críticos:**
- `src/proxy.ts` — equivalente ao middleware (Next.js 16 renomeou)
- `src/lib/auth.ts` + `src/lib/auth-server.ts` — JWT e verificação server-side
- `src/lib/permissions.ts` — sistema de roles e permissões
- `src/lib/supabase-admin.ts` — cliente com service role key (server-only)
- `src/types/database.ts` — todos os tipos da DB
- `src/lib/settings.ts` — chaves do `site_settings` editáveis em modo /edit

**Git:**
- Repo: `github.com/paineltematico/painel-tematico`
- Branch principal: `main`
- User obrigatório: `paineltematico@gmail.com` / `"Painel Temático"`
- Configurar por repo: `git config user.email "paineltematico@gmail.com"`

---

## 3. Branding

| Elemento | Valor |
|---|---|
| Verde estrutural | `#1F3F44` |
| Teal ativo | `#00545F` |
| Accent claro | `#4ecdc4` |
| Gold (páginas premium) | `#C9A96E` |
| Dark base (luxury) | `#07100f` / `#0d1a1c` |
| Fonte principal | Cera Pro (local, `--font-cera`) |
| Fonte display | Playfair Display (`--font-playfair`) |

---

## 4. Páginas Existentes

| Página | Estado | Notas |
|---|---|---|
| `/` Homepage | ✅ | Hero, projetos, imóveis, porquê nós, CTA |
| `/projetos` | ✅ | Listagem de projetos de construção |
| `/projetos/[slug]` | ✅ Premium | Luxury: parallax, galeria, vídeos, plantas, unidades, timeline de obra |
| `/imoveis` | ✅ | Listagem (sem filtros ainda) |
| `/imoveis/[slug]` | ✅ Premium | Luxury: parallax, lightbox, formulário de contacto |
| `/sobre` | ✅ | Parallax, stats animados, equipa, manifesto |
| `/contacto` | ✅ | Hero dark, formulário |
| `/avaliação` | ✅ | Formulário multi-step de avaliação gratuita de imóvel |
| `/visita` | ✅ | Agendamento de visita |
| `/blog` | ⚠️ | Estrutura OK, sem conteúdo real |
| `/construção` | ⚠️ | Atualizações de obra e vídeos, básico |
| `/admin/*` | ✅ | CRM completo, imóveis, projetos, equipa, blog, estatísticas, permissões |

**Modo de edição inline:** acrescentar `/edit` a qualquer URL pública ativa o modo de edição CMS (ex: `/sobre/edit`). Textos ficam editáveis em-página e guardam no Supabase via `/api/admin/content`.

---

## 5. A Lógica Comercial Central

### Projetos ≠ Imóveis — mas comunicam

```
PROJETO (Nova Construção)
  └── Empreendimento com identidade própria (história, arquitetura, localização)
  └── Tem N Unidades
       ├── disponivel   → CTA forte, preço visível
       ├── reservado    → visível discreto, diagonal "Reservado", sem preço
       ├── vendido      → visível apagado (cinza), sem CTA
       └── em_breve     → visível fechado, sem preço

IMÓVEL (2ª Mão / Angariação)
  └── Propriedade individual com ficha própria
  └── Pode estar ligado a um projeto ou ser independente
```

**Sincronização:** quando uma unidade muda de estado, o projeto pai devia actualizar `unidades_disponiveis` automaticamente. **Ainda não está implementado** — está em todo-list.

### Ligação Projeto → Imóvel
Um imóvel pode ser uma unidade de um projeto (ex: apartamento T2 em Trandeiras). Nesse caso deve aparecer:
- Na página do projeto como unidade
- Na listagem `/imoveis` como imóvel individual
- Com referência clara ao projeto de origem

---

## 6. Projetos Ativos e Necessidades

### Esporões
- 7 moradias · **1 disponível**
- Estado: quase esgotado
- Necessidade: urgência visual de "última unidade", galeria e história vendem a restante

### Merelim
- 9 unidades · 2 disponíveis · 1 vendida · 1 reservada · 5 em breve
- Estado: em curso
- Necessidade: formulário de pré-registo para as 5 "em breve", argumento de projeto quase cheio

### Trandeiras ← Lançamento agora, mais complexo
- 8 frações (apartamentos com tipologias e áreas diferentes)
- **Problema:** 8 anúncios separados confundem. O cliente precisa de ser guiado.
- **Solução a construir:** Guia Interativo de Frações dentro da página do projeto:
  - Filtros visuais por tipologia / área / piso / preço
  - Cards por fração (não listings separados)
  - Comparador lado-a-lado (max 3 frações)
  - Plantas com overlay por fração selecionada
  - CTA por fração: "Quero saber mais sobre esta opção"
  - Quando fração é marcada vendida/reservada → discreto mas visível, projeto atualiza

---

## 7. CRM — Estado Actual (Não mexer agora)

O CRM está funcional e bem construído. Documentado para referência.

| Funcionalidade | Estado |
|---|---|
| Pipeline Kanban | ✅ Novo → Contactado → Qualificado → Visita → Negociação → Reserva → Ganho/Perdido |
| Timeline de atividade | ✅ Notas, chamadas, emails, visitas — editável com histórico de versões |
| Temperatura do lead | ✅ Frio / Morno / Quente / Muito Quente |
| Score automático | ✅ 0-100 |
| Transferência entre comerciais | ✅ |
| Arquivamento com restauro | ✅ |
| Estatísticas por período/comercial | ✅ |
| Roles: super_admin > diretor > comercial > marketing > gestor_projeto | ✅ |
| Notificações email ao chegar lead | ❌ Não implementado (Resend API pendente) |
| Score por comportamento no site | ❌ Não implementado |

---

## 8. O que Falta Construir (Por Prioridade)

> **Ver também:** auditoria UX/UI completa (método FABLE, score 5.7/10, 21 findings) em
> `docs/design/AUDITORIA-UXUI-2026-07.md`, Design System v2 em `docs/design/DESIGN-SYSTEM.md`
> e mockups navegáveis em `docs/design/mockups/index.html` (2026-07-04). O roadmap de design
> da auditoria (M1–M10) detalha e substitui os itens visuais desta lista.

### Curto prazo — Segurança & Operacional
- [x] API route para `ContactForm` (`/api/contacto` — validação, honeypot, email admin) ✅ 2026-07-02
- [x] Rate limiting nas rotas públicas e login (`src/lib/rate-limit.ts`) ✅ 2026-07-02
- [x] `secure: true` nos cookies de autenticação (em produção) ✅ 2026-07-02
- [x] Validação de tamanho de ficheiro server-side no upload (20MB media / 200MB vídeos) ✅ 2026-07-02
- [ ] Email automático de boas-vindas ao lead (Resend API) — nota: admin já é notificado em /api/contacto e /api/avaliacao
- [ ] Auto-sync `unidades_disponiveis` no projeto pai quando unidade muda de estado
- [ ] Conteúdo real: fotos, textos e plantas de Trandeiras, Merelim, Esporões

### Médio prazo — Funil Comercial
- [ ] Guia interativo de frações para Trandeiras (filtro + comparação + plantas)
- [ ] Filtros na listagem `/imoveis` (tipologia, preço, localização)
- [ ] Formulário de pré-registo "Avisa-me quando disponível" para unidades em breve
- [ ] Calculadora de prestação bancária (na página de imóvel)
- [ ] Sequência de email nurturing pós-lead (3 emails em 10 dias)
- [ ] Mapa Mapbox com POIs (escolas, transportes, comércio) em cada projeto

### Longo prazo — Diferenciação Premium
- [ ] Planta SVG interativa com overlay de unidades clicáveis
- [ ] Spline embed para hero 3D interativo em Trandeiras
- [ ] GSAP ScrollTrigger para storytelling de projeto
- [ ] Virtual tour embed (Matterport ou Kuula)
- [ ] Renders AI dos projetos (Midjourney → pipeline → Supabase Storage)
- [ ] Google Analytics GA4 com eventos de funil
- [ ] Meta Pixel com ViewContent, Lead, Contact
- [ ] Blog com conteúdo SEO (2 artigos/mês sobre mercado imobiliário em Braga)
- [ ] Domínio próprio `paineltematico.pt`

---

## 9. Funil de Vendas Ideal

```
TOPO
  Anúncio Meta/Google → Homepage → Projeto ou Imóvel → CTA

MEIO
  Lead capturado → Email automático boas-vindas
  → Sequência nurturing (3-5 emails / 2 semanas)
  → WhatsApp follow-up automático para comercial
  → Proposta de visita guiada

FUNDO
  Visita presencial ou virtual → Reserva → Escritura

RETENÇÃO
  Cliente satisfeito → Testemunho → Referência → Novo lead
```

---

## 10. Vulnerabilidades Conhecidas

| # | Nível | Descrição |
|---|---|---|
| 1 | ✅ Corrigida 2026-07-02 | ~~ContactForm escreve direto na DB sem API route~~ → `/api/contacto` |
| 2 | ✅ Corrigida 2026-07-02 | ~~Sem rate limiting em formulários públicos~~ → `src/lib/rate-limit.ts` (nota: em memória, por instância serverless) |
| 3 | 🔴 Crítica | Login ainda aceita `ADMIN_PASSWORD` de ambiente (bootstrap legado) — remover quando há users |
| 4 | ✅ Corrigida 2026-07-02 | ~~Cookie de auth sem `secure: true`~~ → ativo em produção (login e logout) |
| 5 | ✅ Corrigida 2026-07-02 | ~~Validação de tamanho de upload só no cliente~~ → server-side 20MB/200MB |
| 10 | 🟠 Código ✅ 2026-07-04 | ~~Componentes **admin** escrevem direto na DB com client anon~~ → todas as escritas (e leituras admin) migradas para `/api/admin/*` com `getCurrentUser()` + `canUser()`; ownership de leads verificada server-side. **Falta:** após deploy, executar `supabase-rls-lockdown.sql` no Supabase SQL Editor para remover as políticas `*_admin_all` e `*_public_insert` |
| 6 | 🟠 Média | Sem CSP headers em `next.config.ts` |
| 7 | 🟠 Média | `ADMIN_JWT_SECRET` tem fallback inseguro hardcoded |
| 8 | 🟡 Baixa | Vários `(supabaseAdmin as any)` — tipos incompletos mascarados |
| 9 | 🟡 Baixa | Token JWT de 7 dias sem mecanismo de revogação server-side |

---

## 11. Ferramentas para Elevar o Produto

| Ferramenta | Uso no Site |
|---|---|
| **Spline** | Hero 3D interativo sem WebGL manual |
| **React Three Fiber** | Plantas 3D navegáveis |
| **GSAP ScrollTrigger** | Storytelling de scroll em páginas de projeto |
| **Lottie** | Micro-animações e ícones animados |
| **Mapbox GL** | Mapa imersivo com POIs customizados |
| **Matterport / Kuula** | Virtual tour 360° embedável |
| **Midjourney + ControlNet** | Renders AI dos projetos antes de construídos |
| **Framer Motion** | Transições de página fluidas |
| **Resend** | Emails automáticos transacionais e nurturing |

---

## 12. Regras de Desenvolvimento (Nunca Violar)

1. Commits sempre com `paineltematico@gmail.com` — configurar por repo com `git config user.email`
2. Mobile-first — testar sempre em 375px e 768px
3. Nunca `grid-cols-2` em formulários no mobile
4. `100svh` em vez de `100vh` para hero sections (iOS Safari)
5. `clamp()` para tipografia fluida
6. Formulários públicos → sempre API route server-side (nunca `supabase` client direto)
7. TypeScript sem `as any` — corrigir tipos em vez de cast
8. Imagens externas → validadas em `next.config.ts` remotePatterns

---

## 13. Prompt Base para Novas Sessões

Copiar este bloco no início de cada nova conversa:

```
Estou a continuar o desenvolvimento da plataforma Painel Temático.
Lê o ficheiro BRIEFING.md na raiz do projeto antes de começar.
Stack: Next.js 16, Supabase, Tailwind v4, TypeScript, Vercel.
Dev: porta 3001. Git user: paineltematico@gmail.com.
O site é uma ferramenta de vendas imobiliárias — cada feature deve 
acelerar a jornada: Descobrir → Confiar → Imaginar → Contactar → Visitar → Reservar.
Produto média gama, execução premium. Detalhe e profissionalismo acima de tudo.
```

---

## 14. MCPs e Skills Recomendados a Adicionar

**MCPs:**
- Resend MCP — emails automáticos de leads e nurturing
- Linear MCP — tracking de bugs e features em tickets
- Google Analytics MCP — métricas de conversão em tempo real

**Skills Claude Code:**
- `/resend-setup` — configurar templates de email e workflows automáticos
- `/lead-report` — gerar relatório semanal de leads
- `/content-audit` — verificar páginas sem imagens reais ou textos placeholder
- `/deploy-check` — verificar build Vercel, env vars, domínio

**Rotina de Feature:**
`Plan → Mockup (Canva MCP) → Implementar → verify no browser → code-review → push`

---

*Nota final: A maior prioridade antes de qualquer nova feature é conteúdo real —
fotos profissionais dos projetos, renders de Trandeiras, e testemunhos de clientes.
Nenhuma ferramenta compensa uma página vazia.*
