@AGENTS.md

# Painel Temático — Contexto do Projeto

## O que é este projeto
Plataforma imobiliária para a empresa **Painel Temático** (construção e promoção imobiliária, Braga, Portugal).
Tem duas partes no mesmo codebase:
- **Site público** — homepage, imóveis, projetos, construção, sobre, blog, contacto
- **Painel admin** — `/admin/*` — gestão de tudo (imóveis, leads/CRM, projetos, equipa, blog, etc.)

## Stack
- **Next.js 16** (Turbopack) — `npm run dev` arranca na porta **3001**
- **Supabase** — base de dados PostgreSQL + autenticação + Storage (fotos)
- **Tailwind CSS v4**
- **TypeScript**
- **Vercel** — deploy automático a cada `git push main`

## URLs
- Local: `http://localhost:3001`
- Produção: `https://painel-tematico.vercel.app`
- Admin produção: `https://painel-tematico.vercel.app/admin`

## Credenciais
- Estão no ficheiro `.env.local` (não está no git — cria manualmente em cada máquina)
- Logins do admin: ver `.env.local` ou Supabase → tabela `admin_users`

## Supabase
- Project URL: ver `NEXT_PUBLIC_SUPABASE_URL` no `.env.local`
- Bucket de fotos: `media` (público) — pastas: `imoveis/`, `projetos/`, `equipa/`, `artigos/`, `atualizacoes/`

## GitHub
- Repo: `https://github.com/paineltematico/painel-tematico`
- Branch principal: `main`

## Estrutura de autenticação
- JWT próprio (não Supabase Auth) — cookies httpOnly
- Roles: `super_admin` > `diretor` > `comercial` > `marketing` > `gestor_projeto`
- Ficheiros: `src/lib/auth.ts`, `src/lib/auth-server.ts`, `src/lib/permissions.ts`

## Tabelas principais (Supabase)
- `admin_users` — utilizadores do painel
- `imoveis` → `contactos_imoveis` (leads) → `lead_atividades` (CRM)
- `projetos` → `unidades_projeto` → `atualizacoes_obra`
- `equipa`, `artigos`, `site_settings`
- `lead_atividades` tem colunas `updated_at` e `versoes` (jsonb) para histórico de edições

## Componentes importantes
- `src/components/admin/ImageUpload.tsx` — upload de fotos para Supabase Storage
- `src/components/crm/LeadTimeline.tsx` — histórico editável com versões anteriores (super_admin)
- `src/components/WhatsAppButton.tsx` — botão flutuante WhatsApp (351913440800)

## Convenções
- Cores da marca: `#1F3F44` (verde escuro), `#00545F` (teal), `#4ecdc4` (accent claro)
- Fontes: Cera Pro (local, `--font-cera`), Playfair Display (serif, `--font-playfair`)
- Sempre português de Portugal (PT-PT)
- Componentes client: `'use client'` no topo
- API routes em `src/app/api/admin/`

## Fluxo de trabalho Git
```bash
git pull          # sempre antes de começar
git add -A
git commit -m "descrição"
git push          # publica no Vercel automaticamente
```

## Histórico
- Ver `HISTORY.md` na raiz — registo por sessão (o que mudou, porquê, pendentes).
- **No fim de cada sessão:** adicionar uma entrada nova no topo do `HISTORY.md`.

## Tabelas adicionais
- `oportunidades` + `oportunidade_atividades` — pré-leads com follow-up (só super_admin). RLS ativo sem políticas públicas.

## Pendente / A fazer
- **Na Vercel (só o dono):** `CRON_SECRET` (valor no `.env.local`) → redeploy, para os lembretes de oportunidades.
- **Na Vercel (quando houver IDs):** `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`.
- Imagens reais: `/public/images/contacto-hero.jpg` (página de contacto)
- Conteúdo real: imóveis de Braga + projetos Esporões, Merelim, Lomar
- Domínio próprio (ex: paineltematico.pt) → ligar no Vercel
