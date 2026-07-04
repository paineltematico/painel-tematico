-- ═══════════════════════════════════════════════════════════════════════════
-- RLS LOCKDOWN — fecha o acesso anónimo de escrita (e leitura admin) à DB
-- Executar no Supabase SQL Editor DEPOIS de fazer deploy do código que migra
-- todas as escritas admin para /api/admin/* (service role).
--
-- Contexto: as políticas "*_admin_all" davam acesso total (select/insert/
-- update/delete) a qualquer pessoa com a anon key pública. Todas as escritas
-- do painel admin passam agora por API routes autenticadas com getCurrentUser()
-- e o cliente service role (que ignora RLS), por isso estas políticas podem
-- ser removidas. As políticas "*_public_read" mantêm-se — o site público
-- continua a ler conteúdo publicado/ativo com a anon key.
--
-- Reverter (emergência): correr os "create policy ... _admin_all" do
-- supabase-schema-completo.sql.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Acesso total anónimo (todas migradas para /api/admin/*) ──────────────────
drop policy if exists "imoveis_admin_all"      on imoveis;
drop policy if exists "projetos_admin_all"     on projetos;
drop policy if exists "contactos_admin_all"    on contactos_imoveis;
drop policy if exists "atividades_admin_all"   on lead_atividades;
drop policy if exists "unidades_admin_all"     on unidades;
drop policy if exists "atualizacoes_admin_all" on atualizacoes_obra;
drop policy if exists "testemunhos_admin_all"  on testemunhos;
drop policy if exists "equipa_admin_all"       on equipa;
drop policy if exists "parceiros_admin_all"    on parceiros;
drop policy if exists "faqs_admin_all"         on faqs;
drop policy if exists "blog_posts_admin_all"   on blog_posts;
drop policy if exists "videos_admin_all"       on videos_obra;
drop policy if exists "settings_admin_all"     on site_settings;
drop policy if exists "visitas_admin_all"      on visitas_parceiros;

-- admin_users nunca deve ser acessível com a anon key (contém password hashes)
drop policy if exists "admin_users_all" on admin_users;

-- ── INSERTs públicos já migrados para API routes server-side ─────────────────
-- ContactForm → /api/contacto | agendar-visita → /api/agendar-visita
drop policy if exists "contactos_public_insert" on contactos_imoveis;
drop policy if exists "parceiros_public_insert" on parceiros;
drop policy if exists "visitas_public_insert"   on visitas_parceiros;

-- ── Auditoria: políticas que sobram (rever manualmente o resultado) ──────────
-- Devem restar apenas políticas "*_public_read" de SELECT sobre conteúdo
-- publicado/ativo. Atenção a tabelas criadas fora dos ficheiros de schema
-- (ex: avaliacoes) — se tiverem políticas abertas, fechar também.
select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
