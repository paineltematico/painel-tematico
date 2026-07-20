# Tarefa: Migrar escritas admin do client anon para API routes + fechar RLS

> Especificação preparada a 2026-07-02 para execução futura.
> Prioridade: 🔴 Crítica (vulnerabilidade #10 do BRIEFING.md).
> Estimativa: tarefa grande — fazer em fases, com commits separados por fase.
>
> **ESTADO 2026-07-04: Fases 1, 2, 3 e 5 ✅ concluídas.**
> Rotas em `src/app/api/admin/*` (auth + `canUser` + whitelist de campos + ownership
> de leads via `podeAcederLead` em `src/lib/crm-server.ts`); os 14 componentes client
> migrados para `fetch`; leituras sensíveis (admin/blog, admin/projetos, login,
> settings) passadas a `supabaseAdmin`; `as any` removidos do código migrado;
> verificado no browser e com curl (403 sem sessão, CRUD 200 com super_admin).
> **Fase 4 pendente:** após deploy em produção, executar `supabase-rls-lockdown.sql`
> (na raiz do repo) no Supabase SQL Editor e rever o output da auditoria final.

---

## 1. O Problema

Vários componentes do painel admin escrevem (e alguns leem) diretamente na base de dados
a partir do **browser**, usando o cliente Supabase **anon** (`import { supabase } from '@/lib/supabase'`).

Para isso funcionar, as políticas RLS dessas tabelas permitem escrita **anónima**.
Consequência: qualquer visitante com a anon key (que é pública, está no bundle JS)
pode inserir/alterar/apagar imóveis, artigos, leads, equipa, unidades, etc. — sem login.

**Agravante (PII):** as páginas admin também **leem** leads, avaliações e parceiros com o
client anon. Se o SELECT dessas tabelas está aberto, qualquer pessoa pode sacar os dados
pessoais de todos os leads. Auditar leituras além das escritas.

---

## 2. Inventário Exato (grep de 2026-07-02)

| Ficheiro | Tabela | Operações | Permissão a exigir |
|---|---|---|---|
| `src/components/ImovelForm.tsx` | `imoveis` | insert, update | `imoveis.create` / `imoveis.edit` |
| `src/components/DeleteImovelButton.tsx` | `imoveis` | delete | `imoveis.delete` |
| `src/components/ArtigoForm.tsx` | `blog_posts` | insert, update | `blog.create` / `blog.edit` |
| `src/components/crm/LeadNotesEditor.tsx` | `contactos_imoveis` | update (notas) | `leads.edit` |
| `src/components/MarkLeadRead.tsx` | `contactos_imoveis` | update (lido) | `leads.edit` |
| `src/components/crm/LeadPrioritySelector.tsx` | `contactos_imoveis` | update (prioridade) | `leads.edit` |
| `src/components/crm/LeadStageSelector.tsx` | `contactos_imoveis`, `lead_atividades` | update, insert | `leads.edit` |
| `src/components/crm/LeadTimeline.tsx` | `lead_atividades` | update (versões) | `leads.edit` |
| `src/app/admin/leads/[id]/editar/page.tsx` | `contactos_imoveis` | update | `leads.edit` |
| `src/app/admin/equipa/page.tsx` | `equipa` | insert, update, delete | `equipa.edit` |
| `src/app/admin/projetos/[id]/atualizacoes/page.tsx` | `atualizacoes_obra` | insert, delete | `obra.edit` |
| `src/app/admin/construcao/page.tsx` | `videos_obra` | insert, update, delete | `construcao.edit` |
| `src/app/admin/projetos/[id]/unidades/page.tsx` | `unidades` | insert, update, delete (com `as any`!) | `unidades.edit` |
| `src/app/admin/parceiros/page.tsx` | `parceiros`, `visitas_parceiros` | insert, update | `parceiros.archive` / `leads.edit` (confirmar semântica) |

Nota: o inventário pode estar incompleto — repetir o grep antes de começar:
```bash
grep -rln "from '@/lib/supabase'" src/components src/app --include="*.tsx" \
  | xargs grep -l "'use client'" \
  | xargs grep -n "\.insert(\|\.update(\|\.delete(\|\.select("
```

---

## 3. Arquitetura Alvo

### Padrão de referência (já existe no repo)
- **Auth:** `src/app/api/admin/upload/route.ts` — `getCurrentUser()` de `@/lib/auth-server`, 401 se null.
- **Permissões:** `canUser(user, 'imoveis.edit')` de `@/lib/permissions` — 403 se falhar.
  (Respeita `permissions_extra`/`permissions_denied` por utilizador — usar `canUser`, não `can`.)
- **DB:** `supabaseAdmin` de `@/lib/supabase-admin` (service role, só server-side).
- **Rate limiting:** não necessário nas rotas admin (já autenticadas), mas inofensivo.

### IMPORTANTE: reaproveitar rotas existentes
`src/app/api/admin/` já tem pastas: `imoveis`, `leads`, `projetos`, `parceiros`, `visitas`,
`avaliacoes`, `utilizadores`, `settings`, `content`, `permissoes`. **Antes de criar rotas
novas, ler as existentes** — algumas operações podem já existir e o componente é que não
as usa. Estender em vez de duplicar.

### Estrutura sugerida (quando faltar)
```
/api/admin/imoveis          POST (create) | PATCH /api/admin/imoveis/[id] | DELETE /[id]
/api/admin/leads/[id]       PATCH (estado, prioridade, notas, lido — um endpoint, campos parciais)
/api/admin/leads/[id]/atividades   POST, PATCH
/api/admin/blog             POST | PATCH /[id] | DELETE /[id]
/api/admin/equipa           POST | PATCH /[id] | DELETE /[id]
/api/admin/unidades         POST | PATCH /[id] | DELETE /[id]   ← aproveitar para tirar os `as any` (corrigir tipos em src/types/database.ts)
/api/admin/obra/atualizacoes  POST | DELETE /[id]
/api/admin/construcao/videos  POST | PATCH /[id] | DELETE /[id]
```

### Regras nas rotas
1. Validar sempre o body no servidor (campos obrigatórios, tipos, tamanhos) — nunca confiar no cliente.
2. Whitelist de campos atualizáveis por endpoint (nunca `...body` direto para o update).
3. Devolver erros em PT-PT: `{ error: '...' }` com status HTTP correto (400/401/403/404/500).
4. `leads.view_all` vs `leads.view`: comerciais só podem editar leads onde `responsavel_id` é o próprio — verificar essa regra no servidor para roles sem `leads.view_all`.

---

## 4. Fases de Execução

### Fase 1 — Rotas API (sem tocar nos componentes)
Criar/estender as rotas. Testar cada uma com curl (401 sem cookie, 403 com role errado, 200 com super_admin).

### Fase 2 — Migrar componentes
Trocar cada `supabase.from(...).insert/update/delete` por `fetch('/api/admin/...')`.
Manter o comportamento de UI exatamente igual (estados loading/erro).
Um commit por grupo lógico (imoveis, leads/CRM, conteúdo, equipa/parceiros).

### Fase 3 — Auditar e migrar LEITURAS sensíveis
Tabelas com PII: `contactos_imoveis`, `lead_atividades`, `avaliacoes_imovel`, `parceiros`,
`visitas_parceiros`, `admin_users`. Se páginas admin as leem com client anon, migrar essas
leituras para rotas GET autenticadas (ou server components com `supabaseAdmin`).

### Fase 4 — Fechar RLS no Supabase (só depois das fases 1–3 em produção!)
Por tabela, no SQL editor do Supabase:
- **Remover** políticas de INSERT/UPDATE/DELETE para `anon`.
- **Manter** SELECT público apenas onde o site precisa: `imoveis`, `projetos`, `unidades`,
  `blog_posts`, `equipa`, `testemunhos`, `atualizacoes_obra`, `videos_obra`, `site_settings`.
- **Fechar** SELECT anónimo nas tabelas com PII (lista da Fase 3).
- `contactos_imoveis`: fechar tudo para anon — o único insert público já passa por `/api/contacto` (service role).
- Guardar o SQL executado num ficheiro `supabase/migrations/` ou anexo ao commit para haver registo.

### Fase 5 — Verificação final
- Build limpo, sem `as any` novos (e remover os existentes em unidades).
- Testar no browser (porta 3001) cada área admin: criar/editar/apagar imóvel, mover lead no Kanban, editar nota, equipa, unidades, vídeos de obra.
- Confirmar que o site público continua a mostrar imóveis/projetos (SELECT público intacto).
- Testar com curl que a anon key já **não** consegue escrever: `curl -X POST $SUPABASE_URL/rest/v1/imoveis -H "apikey: $ANON_KEY" ...` → deve falhar.
- `/code-review` antes do push final.

---

## 5. Critérios de Aceitação

- [ ] Zero `.insert(/.update(/.delete(` com o client anon em componentes `'use client'`.
- [ ] Todas as rotas novas verificam `getCurrentUser()` + `canUser()` com a permissão certa.
- [ ] RLS: escrita anónima fechada em todas as tabelas; leitura anónima fechada nas tabelas com PII.
- [ ] Site público e painel admin funcionam de ponta a ponta (testado no browser).
- [ ] Zero `as any` no código migrado.
- [ ] SQL das políticas RLS registado no repo.

## 6. Regras do Projeto (lembrete)

- Git user: `paineltematico@gmail.com` / "Painel Temático"
- Ler `BRIEFING.md` e `node_modules/next/dist/docs/` (Next.js 16 — proxy.ts, não middleware)
- PT-PT em todas as mensagens de erro e UI
- Commits pequenos por fase; push publica no Vercel — a Fase 4 (RLS) só depois do deploy das fases 1–3 estar verificado em produção

---

## 7. Prompt pronto a usar (copiar para a nova sessão)

```
Estou a continuar o desenvolvimento da plataforma Painel Temático.
Lê primeiro BRIEFING.md e TAREFA-migracao-admin-api.md na raiz do projeto.
Stack: Next.js 16, Supabase, Tailwind v4, TypeScript, Vercel. Dev: porta 3001.
Git user: paineltematico@gmail.com.

Executa a tarefa descrita em TAREFA-migracao-admin-api.md: migrar todas as
escritas (e leituras sensíveis) que os componentes admin fazem com o cliente
Supabase anon para API routes autenticadas com getCurrentUser() + canUser(),
e no fim fechar as políticas RLS de escrita/leitura anónima no Supabase.
Segue as fases do documento pela ordem, com commits separados por fase.
A Fase 4 (fechar RLS) requer a minha confirmação antes de executar — pára
e mostra-me o SQL antes de o correr.
```
