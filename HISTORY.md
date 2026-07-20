# Histórico de Sessões — Painel Temático

Registo cronológico do trabalho feito, por sessão. A sessão mais recente fica no topo.
Cada entrada resume **o que mudou**, **porquê** e **o que ficou pendente** (sobretudo ações que só o dono pode fazer na Vercel / Supabase).

---

## Sessão — 2026-07-20

### Feito
- **Oportunidades com follow-up** (feature nova, super_admin) — pré-leads de venda/compra/arrendamento com orçamento, estimativa, documentos e fotos. Pipeline de 4 estados (Nova → Em análise → Convertida → Arquivada), timeline de atividades, lembrete por email + evento no Google Calendar, e conversão para **Lead** ou **Imóvel**.
  - SQL: `supabase-oportunidades.sql` (2 tabelas, RLS ativo sem políticas públicas).
  - Cron diário `oportunidades-followup` + `vercel.json`.
- **Dashboard** — alerta de follow-ups pendentes.
- **Admin mobile** — tabelas → cards responsivos; bottom-nav app-like fixa; cabeçalhos de detalhe compactados.
- **Upload HEIC** — fotos de iPhone (.heic/.heif) convertidas para JPEG no servidor (`heic-convert`, `runtime='nodejs'`); limite 10MB → 20MB.
- **Plantas** — passam a aceitar PDF além de imagens.
- **Preço de imóvel** — campo com separador de milhares, guarda exatamente o valor escrito (sem arredondamentos "…999€"). Corrigidos dois imóveis já afetados (404999→405000, 524999→525000).
- **Features extra** — email de boas-vindas ao lead; pesquisa + filtros colapsáveis em `/imoveis`; componente `Analytics` (GA4 + Meta Pixel, só carrega se os IDs existirem).
- **Branding** — favicon "p" da marca + imagem de partilha (OG).
- **Segurança** — password master desativada quando já existem utilizadores (obriga email + password). Confirmado que o Hugo tem login por email antes de ativar.
- **RLS** — corrigido GRANT de `select` ao role `anon` nas tabelas públicas (`supabase-fix-grants-anon.sql`); site público voltou a mostrar imóveis/projetos/blog.

### Pendente (só o dono pode fazer — sem acesso à Vercel)
- `CRON_SECRET` na Vercel (valor no `.env.local`) → redeploy, para os lembretes de oportunidades funcionarem.
- `NEXT_PUBLIC_GA_ID` e `NEXT_PUBLIC_META_PIXEL_ID` na Vercel quando houver IDs de Analytics.
- Carregar imóveis reais de Braga (estava a editar os demo).

---

<!-- Próximas sessões: adicionar acima desta linha, mantendo a mais recente no topo. -->
