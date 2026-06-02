-- ═══════════════════════════════════════════════════════
--  PAINEL TEMÁTICO — RBAC & Extended Schema
--  Run this AFTER supabase-schema.sql
-- ═══════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- Admin Users (RBAC)
-- ─────────────────────────────────────────────
create table if not exists admin_users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  nome        text not null,
  password_hash text not null,
  role        text not null default 'comercial'
              check (role in ('super_admin','diretor','comercial','marketing','gestor_projeto')),
  ativo       boolean default true,
  ultimo_login timestamptz,
  created_at  timestamptz default now()
);

alter table admin_users enable row level security;
-- Permissive policy needed since we use anon key for server-side queries
create policy "admin_users_all" on admin_users for all using (true) with check (true);

-- ─────────────────────────────────────────────
-- Unidades (Project Units Matrix)
-- ─────────────────────────────────────────────
create table if not exists unidades (
  id          uuid primary key default gen_random_uuid(),
  projeto_id  uuid references projetos(id) on delete cascade,
  referencia  text not null,           -- e.g. 'V1', 'A2B', 'Lote 3'
  tipologia   text,                    -- 'T2', 'V4', etc.
  area_m2     numeric,
  preco       numeric,
  estado      text default 'disponivel'
              check (estado in ('disponivel','reservado','vendido')),
  piso        integer,
  descricao   text,
  planta      text,                    -- URL to floor plan image
  ordem       integer default 0,
  created_at  timestamptz default now()
);

alter table unidades enable row level security;
create policy "unidades_public_read" on unidades for select using (true);
create policy "unidades_admin_all"   on unidades for all   using (true) with check (true);

-- ─────────────────────────────────────────────
-- Atualizações de Obra (Construction Progress)
-- ─────────────────────────────────────────────
create table if not exists atualizacoes_obra (
  id                    uuid primary key default gen_random_uuid(),
  projeto_id            uuid references projetos(id) on delete cascade,
  titulo                text not null,
  descricao             text,
  fotos                 text[],
  data_atualizacao      date default current_date,
  fase                  text,          -- 'Fundações', 'Estrutura', 'Acabamentos'...
  percentagem_conclusao integer default 0 check (percentagem_conclusao between 0 and 100),
  publicado             boolean default true,
  created_at            timestamptz default now()
);

alter table atualizacoes_obra enable row level security;
create policy "atualizacoes_public_read" on atualizacoes_obra for select using (publicado = true);
create policy "atualizacoes_admin_all"   on atualizacoes_obra for all   using (true) with check (true);

-- ─────────────────────────────────────────────
-- Testemunhos / Testimonials
-- ─────────────────────────────────────────────
create table if not exists testemunhos (
  id          uuid primary key default gen_random_uuid(),
  projeto_id  uuid references projetos(id) on delete set null,
  nome        text not null,
  cargo       text,
  texto       text not null,
  rating      integer default 5 check (rating between 1 and 5),
  foto        text,
  publicado   boolean default true,
  ordem       integer default 0,
  created_at  timestamptz default now()
);

alter table testemunhos enable row level security;
create policy "testemunhos_public_read" on testemunhos for select using (publicado = true);
create policy "testemunhos_admin_all"   on testemunhos for all   using (true) with check (true);

-- ─────────────────────────────────────────────
-- Equipa / Team Members
-- ─────────────────────────────────────────────
create table if not exists equipa (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  cargo       text not null,
  bio         text,
  foto        text,
  email       text,
  telefone    text,
  linkedin    text,
  ordem       integer default 0,
  ativo       boolean default true,
  created_at  timestamptz default now()
);

alter table equipa enable row level security;
create policy "equipa_public_read" on equipa for select using (ativo = true);
create policy "equipa_admin_all"   on equipa for all   using (true) with check (true);

-- ─────────────────────────────────────────────
-- Parceiros / Partners & Brands
-- ─────────────────────────────────────────────
create table if not exists parceiros (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  logo        text,
  website     text,
  categoria   text,   -- 'construcao', 'financiamento', 'arquitetura', 'materiais'
  ordem       integer default 0,
  ativo       boolean default true,
  created_at  timestamptz default now()
);

alter table parceiros enable row level security;
create policy "parceiros_public_read" on parceiros for select using (ativo = true);
create policy "parceiros_admin_all"   on parceiros for all   using (true) with check (true);

-- ─────────────────────────────────────────────
-- FAQs (can be project-specific or global)
-- ─────────────────────────────────────────────
create table if not exists faqs (
  id          uuid primary key default gen_random_uuid(),
  projeto_id  uuid references projetos(id) on delete set null,
  pergunta    text not null,
  resposta    text not null,
  categoria   text,
  ordem       integer default 0,
  ativo       boolean default true,
  created_at  timestamptz default now()
);

alter table faqs enable row level security;
create policy "faqs_public_read" on faqs for select using (ativo = true);
create policy "faqs_admin_all"   on faqs for all   using (true) with check (true);

-- ─────────────────────────────────────────────
-- Leads: extend estado enum to full pipeline
-- ─────────────────────────────────────────────
-- If the estado column has a check constraint, update it:
-- First drop old constraint if it exists, then re-add
DO $$
BEGIN
  -- Try to add new estado values to contactos_imoveis
  -- (if constraint exists, this is a no-op on the data)
  ALTER TABLE contactos_imoveis DROP CONSTRAINT IF EXISTS contactos_imoveis_estado_check;
  ALTER TABLE contactos_imoveis ADD CONSTRAINT contactos_imoveis_estado_check
    CHECK (estado IN ('novo','contactado','qualificado','visita_agendada','negociacao','reserva','ganho','perdido'));
EXCEPTION WHEN others THEN
  NULL; -- silently ignore if table doesn't exist yet
END $$;

-- Add new fields to contactos_imoveis if they don't exist
ALTER TABLE contactos_imoveis ADD COLUMN IF NOT EXISTS temperatura text default 'frio'
  check (temperatura in ('frio','morno','quente','muito_quente'));
ALTER TABLE contactos_imoveis ADD COLUMN IF NOT EXISTS score integer default 0;
ALTER TABLE contactos_imoveis ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE contactos_imoveis ADD COLUMN IF NOT EXISTS projeto_interesse uuid references projetos(id) on delete set null;
ALTER TABLE contactos_imoveis ADD COLUMN IF NOT EXISTS orcamento_min numeric;
ALTER TABLE contactos_imoveis ADD COLUMN IF NOT EXISTS orcamento_max numeric;
ALTER TABLE contactos_imoveis ADD COLUMN IF NOT EXISTS responsavel_id uuid references admin_users(id) on delete set null;
