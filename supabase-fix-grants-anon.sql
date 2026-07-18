-- ═══════════════════════════════════════════════════════════════════════════
-- FIX URGENTE — restaurar leitura pública do site
-- Correr no Supabase SQL Editor.
--
-- Sintoma: o site público mostra 0 imóveis / 0 projetos / blog vazio.
-- Causa: o role `anon` perdeu o privilégio base SELECT nestas tabelas
--        (erro 42501 "permission denied for table ...").
-- As políticas RLS "*_public_read" já existem e continuam a restringir a
-- leitura a conteúdo publicado/disponível — este GRANT apenas devolve o
-- privilégio base para essas políticas voltarem a aplicar-se.
--
-- Seguro: só as linhas publicadas/ativas ficam visíveis (RLS mantém-se).
-- NÃO inclui tabelas privadas (admin_users, contactos_imoveis, oportunidades,
-- lead_atividades, avaliacoes, visitas_parceiros) — essas continuam fechadas.
-- ═══════════════════════════════════════════════════════════════════════════

grant select on
  public.imoveis,
  public.projetos,
  public.unidades,
  public.atualizacoes_obra,
  public.testemunhos,
  public.equipa,
  public.parceiros,
  public.faqs,
  public.blog_posts,
  public.videos_obra,
  public.site_settings
to anon, authenticated;

-- Verificação: deve devolver as linhas publicadas (não "permission denied")
select count(*) as imoveis_visiveis from public.imoveis where disponivel = true;
