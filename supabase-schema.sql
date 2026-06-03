-- PAINEL TEMÁTICO — Schema Supabase
-- Executar no SQL Editor do dashboard Supabase

-- ─────────────────────────────────────────────
-- Imóveis
-- ─────────────────────────────────────────────
create table if not exists imoveis (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text unique not null,
  tipo text not null check (tipo in ('Venda','Arrendamento')),
  tipologia text check (tipologia in ('T0','T1','T2','T3','T4','T4+')),
  preco numeric(12,2),
  area_m2 numeric(8,2),
  quartos integer,
  casas_banho integer,
  garagem boolean default false,
  localizacao text,
  cidade text,
  distrito text,
  descricao text,
  fotos text[] default '{}',
  destaque boolean default false,
  disponivel boolean default true,
  created_at timestamptz default now()
);

alter table imoveis enable row level security;

create policy "imoveis_public_read" on imoveis
  for select using (disponivel = true);

-- Allow all operations (admin uses cookie auth, not Supabase auth)
create policy "imoveis_admin_all" on imoveis
  for all using (true) with check (true);

-- ─────────────────────────────────────────────
-- Leads / CRM
-- ─────────────────────────────────────────────
create table if not exists contactos_imoveis (
  id uuid primary key default gen_random_uuid(),
  -- Contact info
  nome text not null,
  email text not null,
  telefone text,
  mensagem text,
  -- Property reference
  imovel_id uuid references imoveis(id) on delete set null,
  imovel_titulo text,
  -- CRM pipeline
  estado text default 'novo'
    check (estado in ('novo','contactado','visita','proposta','ganho','perdido')),
  prioridade text default 'normal'
    check (prioridade in ('baixa','normal','alta')),
  -- Internal
  notas text,
  lido boolean default false,
  fonte text default 'site',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table contactos_imoveis enable row level security;

create policy "contactos_public_insert" on contactos_imoveis
  for insert with check (true);

create policy "contactos_admin_all" on contactos_imoveis
  for all using (true) with check (true);

-- ─────────────────────────────────────────────
-- Histórico de atividades por lead
-- ─────────────────────────────────────────────
create table if not exists lead_atividades (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references contactos_imoveis(id) on delete cascade,
  tipo text not null check (tipo in ('nota','chamada','email','visita','mudanca_estado')),
  conteudo text,
  estado_anterior text,
  estado_novo text,
  created_at timestamptz default now()
);

alter table lead_atividades enable row level security;

create policy "atividades_admin_all" on lead_atividades
  for all using (true) with check (true);

-- Auto-update updated_at on contactos_imoveis
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger contactos_updated_at
  before update on contactos_imoveis
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────
-- Dados de exemplo — imóveis
-- ─────────────────────────────────────────────
insert into imoveis (titulo, slug, tipo, tipologia, preco, area_m2, quartos, casas_banho, garagem, localizacao, cidade, distrito, descricao, destaque) values
('Moradia T4 com Piscina', 'moradia-t4-piscina-braga', 'Venda', 'T4', 495000, 280, 4, 3, true, 'Nogueiró', 'Braga', 'Braga', 'Fantástica moradia isolada com piscina, jardim e garagem dupla. Acabamentos de luxo em zona residencial tranquila a 5 min do centro.', true),
('Apartamento T2 Centro Porto', 'apartamento-t2-centro-porto', 'Venda', 'T2', 295000, 98, 2, 1, false, 'Bonfim', 'Porto', 'Porto', 'Apartamento completamente renovado no coração do Porto. Excelente exposição solar, varanda e acabamentos premium.', true),
('Apartamento T1 — Arrendamento', 'apartamento-t1-arrendamento-lisboa', 'Arrendamento', 'T1', 1200, 55, 1, 1, false, 'Arroios', 'Lisboa', 'Lisboa', 'Apartamento moderno, mobilado e equipado. Ideal para profissionais. Próximo de transportes e comércio.', false),
('Moradia T3 com Jardim', 'moradia-t3-jardim-guimaraes', 'Venda', 'T3', 340000, 185, 3, 2, true, 'Azurém', 'Guimarães', 'Braga', 'Moradia de 2 pisos com jardim privativo, garagem e arrumos. Zona familiar, perto de escolas e parques.', true),
('Estúdio T0 Moderno', 'studio-t0-moderno-lisboa', 'Arrendamento', 'T0', 850, 38, 0, 1, false, 'Intendente', 'Lisboa', 'Lisboa', 'Estúdio completamente remodelado com design contemporâneo. Edifício com elevador, todas as comodidades incluídas.', false),
('Moradia V4 Vista Mar Cascais', 'moradia-v4-vista-mar-cascais', 'Venda', 'T4', 1250000, 420, 4, 4, true, 'Cascais', 'Cascais', 'Lisboa', 'Moradia de luxo com vista panorâmica para o mar. Piscina infinita, spa, adega e garagem para 3 carros.', true)
on conflict (slug) do nothing;

-- ─────────────────────────────────────────────
-- Definições do site (conteúdo editável)
-- ─────────────────────────────────────────────
create table if not exists site_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

alter table site_settings enable row level security;

create policy "settings_public_read" on site_settings
  for select using (true);

create policy "settings_admin_all" on site_settings
  for all using (true) with check (true);

-- Valores por defeito
insert into site_settings (key, value) values
  ('hero_linha1',         'Cada imóvel conta uma história.'),
  ('hero_linha2',         'A sua começa aqui.'),
  ('contacto_telefone',   '+351 210 000 000'),
  ('contacto_email',      'geral@paineltematico.pt'),
  ('contacto_morada',     'Lisboa, Portugal'),
  ('ami_numero',          'XXXXXXX'),
  ('sobre_texto',         'A sua imobiliária de confiança em Portugal. Especializados em venda e arrendamento de imóveis residenciais e comerciais.')
on conflict (key) do nothing;

-- ─────────────────────────────────────────────
-- Projetos / Empreendimentos
-- ─────────────────────────────────────────────
create table if not exists projetos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text unique not null,
  subtitulo text,
  descricao text,
  localizacao text,
  cidade text,
  imagem text,
  estado text default 'em_curso'
    check (estado in ('em_curso', 'concluido', 'brevemente')),
  unidades_total integer,
  unidades_disponiveis integer,
  ordem integer default 0,
  ativo boolean default true,
  created_at timestamptz default now()
);

alter table projetos enable row level security;
create policy "projetos_public_read" on projetos for select using (ativo = true);
create policy "projetos_admin_all"   on projetos for all   using (true) with check (true);

insert into projetos (nome, slug, subtitulo, descricao, localizacao, cidade, estado, unidades_disponiveis, ordem) values
('Esporões',       'esporoes',       'Moradias de excelência',       'Projeto de habitação premium em Esporões, Braga. Moradias com acabamentos de topo e áreas generosas em ambiente exclusivo.', 'Esporões', 'Braga', 'em_curso',   4, 1),
('Merelim',        'merelim',        'Viver perto da cidade',        'Empreendimento residencial em Merelim, a 10 minutos do centro de Braga. Apartamentos modernos com garagem e terraços privativos.', 'Merelim', 'Braga', 'em_curso',   6, 2),
('Lomar',          'lomar',          'Natureza e tranquilidade',     'Moradias em Lomar, numa das zonas residenciais mais procuradas de Braga. Espaços amplos, jardins e excelentes acessos à cidade.', 'Lomar', 'Braga', 'em_curso',   3, 3),
('Empreendimentos','empreendimentos','Novos projetos em lançamento', 'Conheça os nossos próximos empreendimentos. Invista com confiança no mercado imobiliário com a Painel Temático.', 'Braga', 'Braga', 'brevemente', 0, 4)
on conflict (slug) do nothing;

-- ─────────────────────────────────────────────
-- Blog / Notas
-- ─────────────────────────────────────────────
create table if not exists artigos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text unique not null,
  resumo text,
  conteudo text,
  imagem text,
  categoria text default 'Mercado Imobiliário',
  publicado boolean default false,
  publicado_em timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table artigos enable row level security;
create policy "artigos_public_read" on artigos for select using (publicado = true);
create policy "artigos_admin_all"   on artigos for all   using (true) with check (true);

create trigger artigos_updated_at
  before update on artigos
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────
-- Vídeos de Obra
-- ─────────────────────────────────────────────
create table if not exists videos_obra (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  url text not null,
  thumbnail text,
  projeto text,
  ordem integer default 0,
  ativo boolean default true,
  created_at timestamptz default now()
);

alter table videos_obra enable row level security;
create policy "videos_public_read" on videos_obra for select using (ativo = true);
create policy "videos_admin_all"   on videos_obra for all   using (true) with check (true);

-- ─────────────────────────────────────────────
-- Parceiros (agentes imobiliários externos)
-- ─────────────────────────────────────────────
create table if not exists parceiros (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  empresa       text,
  email         text,
  telefone      text,
  ami           text,
  notas         text,
  ativo         boolean not null default true,
  token_visita  text unique default encode(gen_random_bytes(16), 'hex'),
  created_at    timestamptz not null default now()
);

create table if not exists visitas_parceiros (
  id              uuid primary key default gen_random_uuid(),
  parceiro_id     uuid references parceiros(id) on delete set null,
  imovel_id       uuid references imoveis(id) on delete set null,
  imovel_outro    text,
  cliente_nome    text not null,
  cliente_email   text,
  cliente_telef   text,
  data_visita     date not null,
  hora_visita     time not null,
  notas           text,
  estado          text not null default 'pendente',
  gcal_event_id   text,
  created_at      timestamptz not null default now()
);

alter table parceiros        enable row level security;
alter table visitas_parceiros enable row level security;

-- Leitura/escrita públicas (página pública de agendamento)
create policy "parceiros_public_insert" on parceiros        for insert with check (true);
create policy "parceiros_admin_all"     on parceiros        for all    using (true) with check (true);
create policy "visitas_public_insert"   on visitas_parceiros for insert with check (true);
create policy "visitas_admin_all"       on visitas_parceiros for all    using (true) with check (true);
