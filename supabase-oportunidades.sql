-- ═══════════════════════════════════════════════════════════════════════════
-- OPORTUNIDADES — pré-leads de venda/compra/arrendamento (só super_admin)
-- Correr no Supabase SQL Editor.
--
-- Recolha estruturada de oportunidades antes de serem negócios confirmados.
-- Cada oportunidade pode converter-se em Lead (contactos_imoveis) ou em
-- Imóvel (imoveis). Follow-up com data → email automático + evento no
-- Google Calendar.
--
-- RLS: ativa e SEM políticas públicas. Só o service role (/api/admin/*) acede.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Tabela principal ─────────────────────────────────────────────────────────
create table if not exists oportunidades (
  id uuid primary key default gen_random_uuid(),
  tipo text not null default 'venda'
    check (tipo in ('venda','compra','arrendamento')),
  estado text not null default 'nova'
    check (estado in ('nova','em_analise','convertida','arquivada')),
  -- Pessoa
  pessoa_nome text not null,
  pessoa_email text,
  pessoa_telefone text,
  -- Localização
  localizacao text,              -- zona / etiqueta curta
  morada text,                   -- rua e número
  cidade text,
  codigo_postal text,
  mapa_url text,                 -- link do Google Maps colado à mão
  -- Imóvel
  tipologia text,
  area_m2 numeric,
  descricao text,
  -- Estimativa (orçamento): [{ id, label, valor }] — valor negativo = custo
  preco_esperado_min numeric,
  preco_esperado_max numeric,
  estimativa jsonb default '[]'::jsonb,
  -- Notas internas (bloco livre, separado da timeline)
  notas text,
  -- Media
  fotos text[] default '{}',
  documentos text[] default '{}',
  follow_up_data date,
  follow_up_nota text,
  follow_up_email_sent boolean default false,
  gcal_event_id text,
  convertido_tipo text check (convertido_tipo in ('lead','imovel')),
  convertido_id uuid,
  criado_por uuid references admin_users(id) on delete set null,
  arquivado_em timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table oportunidades enable row level security;
-- Sem políticas: só o service role acede (RLS bloqueia a anon key por completo).

-- ── Timeline de atividades ───────────────────────────────────────────────────
create table if not exists oportunidade_atividades (
  id uuid primary key default gen_random_uuid(),
  oportunidade_id uuid not null references oportunidades(id) on delete cascade,
  tipo text not null check (tipo in ('nota','chamada','email','mudanca_estado')),
  conteudo text,
  estado_anterior text,
  estado_novo text,
  created_at timestamptz default now()
);

alter table oportunidade_atividades enable row level security;
-- Sem políticas: só o service role acede.

-- ── Índices úteis ────────────────────────────────────────────────────────────
create index if not exists oportunidades_estado_idx      on oportunidades (estado);
create index if not exists oportunidades_followup_idx     on oportunidades (follow_up_data) where follow_up_email_sent = false;
create index if not exists oport_atividades_oport_idx     on oportunidade_atividades (oportunidade_id);

-- ── Trigger updated_at (reutiliza a função update_updated_at() já existente) ──
drop trigger if exists oportunidades_updated_at on oportunidades;
create trigger oportunidades_updated_at
  before update on oportunidades
  for each row execute function update_updated_at();
