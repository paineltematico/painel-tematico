-- PAINEL TEMATICO -- Schema Completo
-- Executar UMA VEZ no SQL Editor do Supabase

-- Imoveis
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
drop policy if exists "imoveis_public_read" on imoveis;
drop policy if exists "imoveis_admin_all" on imoveis;
create policy "imoveis_public_read" on imoveis for select using (disponivel = true);
create policy "imoveis_admin_all"   on imoveis for all   using (true) with check (true);

-- Projetos
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
drop policy if exists "projetos_public_read" on projetos;
drop policy if exists "projetos_admin_all" on projetos;
create policy "projetos_public_read" on projetos for select using (ativo = true);
create policy "projetos_admin_all"   on projetos for all   using (true) with check (true);

-- Admin Users (RBAC)
create table if not exists admin_users (
  id           uuid primary key default gen_random_uuid(),
  email        text unique not null,
  nome         text not null,
  password_hash text not null,
  role         text not null default 'comercial'
               check (role in ('super_admin','diretor','comercial','marketing','gestor_projeto')),
  ativo        boolean default true,
  ultimo_login timestamptz,
  created_at   timestamptz default now()
);

alter table admin_users enable row level security;
drop policy if exists "admin_users_all" on admin_users;
create policy "admin_users_all" on admin_users for all using (true) with check (true);

-- Leads / CRM (pipeline completo)
create table if not exists contactos_imoveis (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  telefone text,
  mensagem text,
  imovel_id uuid references imoveis(id) on delete set null,
  imovel_titulo text,
  estado text default 'novo'
    check (estado in ('novo','contactado','qualificado','visita_agendada','negociacao','reserva','ganho','perdido')),
  prioridade text default 'normal'
    check (prioridade in ('baixa','normal','alta')),
  temperatura text default 'frio'
    check (temperatura in ('frio','morno','quente','muito_quente')),
  score integer default 0,
  tags text[],
  projeto_interesse uuid references projetos(id) on delete set null,
  orcamento_min numeric,
  orcamento_max numeric,
  responsavel_id uuid references admin_users(id) on delete set null,
  notas text,
  lido boolean default false,
  fonte text default 'site',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table contactos_imoveis enable row level security;
drop policy if exists "contactos_public_insert" on contactos_imoveis;
drop policy if exists "contactos_admin_all" on contactos_imoveis;
create policy "contactos_public_insert" on contactos_imoveis for insert with check (true);
create policy "contactos_admin_all"     on contactos_imoveis for all   using (true) with check (true);

-- Historico de atividades por lead
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
drop policy if exists "atividades_admin_all" on lead_atividades;
create policy "atividades_admin_all" on lead_atividades for all using (true) with check (true);

-- updated_at automatico
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists contactos_updated_at on contactos_imoveis;
create trigger contactos_updated_at
  before update on contactos_imoveis
  for each row execute function update_updated_at();

-- Unidades (matriz de disponibilidade)
create table if not exists unidades (
  id         uuid primary key default gen_random_uuid(),
  projeto_id uuid references projetos(id) on delete cascade,
  referencia text not null,
  tipologia  text,
  area_m2    numeric,
  preco      numeric,
  estado     text default 'disponivel'
             check (estado in ('disponivel','reservado','vendido')),
  piso       integer,
  descricao  text,
  planta     text,
  ordem      integer default 0,
  created_at timestamptz default now()
);

alter table unidades enable row level security;
drop policy if exists "unidades_public_read" on unidades;
drop policy if exists "unidades_admin_all" on unidades;
create policy "unidades_public_read" on unidades for select using (true);
create policy "unidades_admin_all"   on unidades for all   using (true) with check (true);

-- Atualizacoes de Obra (timeline de construcao)
create table if not exists atualizacoes_obra (
  id                    uuid primary key default gen_random_uuid(),
  projeto_id            uuid references projetos(id) on delete cascade,
  titulo                text not null,
  descricao             text,
  fotos                 text[],
  data_atualizacao      date default current_date,
  fase                  text,
  percentagem_conclusao integer default 0 check (percentagem_conclusao between 0 and 100),
  publicado             boolean default true,
  created_at            timestamptz default now()
);

alter table atualizacoes_obra enable row level security;
drop policy if exists "atualizacoes_public_read" on atualizacoes_obra;
drop policy if exists "atualizacoes_admin_all" on atualizacoes_obra;
create policy "atualizacoes_public_read" on atualizacoes_obra for select using (publicado = true);
create policy "atualizacoes_admin_all"   on atualizacoes_obra for all   using (true) with check (true);

-- Testemunhos
create table if not exists testemunhos (
  id         uuid primary key default gen_random_uuid(),
  projeto_id uuid references projetos(id) on delete set null,
  nome       text not null,
  cargo      text,
  texto      text not null,
  rating     integer default 5 check (rating between 1 and 5),
  foto       text,
  publicado  boolean default true,
  ordem      integer default 0,
  created_at timestamptz default now()
);

alter table testemunhos enable row level security;
drop policy if exists "testemunhos_public_read" on testemunhos;
drop policy if exists "testemunhos_admin_all" on testemunhos;
create policy "testemunhos_public_read" on testemunhos for select using (publicado = true);
create policy "testemunhos_admin_all"   on testemunhos for all   using (true) with check (true);

-- Equipa
create table if not exists equipa (
  id       uuid primary key default gen_random_uuid(),
  nome     text not null,
  cargo    text not null,
  bio      text,
  foto     text,
  email    text,
  telefone text,
  linkedin text,
  ordem    integer default 0,
  ativo    boolean default true,
  created_at timestamptz default now()
);

alter table equipa enable row level security;
drop policy if exists "equipa_public_read" on equipa;
drop policy if exists "equipa_admin_all" on equipa;
create policy "equipa_public_read" on equipa for select using (ativo = true);
create policy "equipa_admin_all"   on equipa for all   using (true) with check (true);

-- Parceiros
create table if not exists parceiros (
  id       uuid primary key default gen_random_uuid(),
  nome     text not null,
  logo     text,
  website  text,
  categoria text,
  ordem    integer default 0,
  ativo    boolean default true,
  created_at timestamptz default now()
);

alter table parceiros enable row level security;
drop policy if exists "parceiros_public_read" on parceiros;
drop policy if exists "parceiros_admin_all" on parceiros;
create policy "parceiros_public_read" on parceiros for select using (ativo = true);
create policy "parceiros_admin_all"   on parceiros for all   using (true) with check (true);

-- FAQs
create table if not exists faqs (
  id         uuid primary key default gen_random_uuid(),
  projeto_id uuid references projetos(id) on delete set null,
  pergunta   text not null,
  resposta   text not null,
  categoria  text,
  ordem      integer default 0,
  ativo      boolean default true,
  created_at timestamptz default now()
);

alter table faqs enable row level security;
drop policy if exists "faqs_public_read" on faqs;
drop policy if exists "faqs_admin_all" on faqs;
create policy "faqs_public_read" on faqs for select using (ativo = true);
create policy "faqs_admin_all"   on faqs for all   using (true) with check (true);

-- Blog Posts (renomeado de artigos para evitar conflito com App)
create table if not exists blog_posts (
  id         uuid primary key default gen_random_uuid(),
  titulo     text not null,
  slug       text unique not null,
  resumo     text,
  conteudo   text,
  imagem     text,
  categoria  text default 'Mercado Imobiliario',
  publicado  boolean default false,
  publicado_em timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table blog_posts enable row level security;
drop policy if exists "blog_posts_public_read" on blog_posts;
drop policy if exists "blog_posts_admin_all" on blog_posts;
create policy "blog_posts_public_read" on blog_posts for select using (publicado = true);
create policy "blog_posts_admin_all"   on blog_posts for all   using (true) with check (true);

drop trigger if exists blog_posts_updated_at on blog_posts;
create trigger blog_posts_updated_at
  before update on blog_posts
  for each row execute function update_updated_at();

-- Videos de Obra
create table if not exists videos_obra (
  id       uuid primary key default gen_random_uuid(),
  titulo   text not null,
  url      text not null,
  thumbnail text,
  projeto  text,
  ordem    integer default 0,
  ativo    boolean default true,
  created_at timestamptz default now()
);

alter table videos_obra enable row level security;
drop policy if exists "videos_public_read" on videos_obra;
drop policy if exists "videos_admin_all" on videos_obra;
create policy "videos_public_read" on videos_obra for select using (ativo = true);
create policy "videos_admin_all"   on videos_obra for all   using (true) with check (true);

-- Definicoes do site
create table if not exists site_settings (
  key   text primary key,
  value text,
  updated_at timestamptz default now()
);

alter table site_settings enable row level security;
drop policy if exists "settings_public_read" on site_settings;
drop policy if exists "settings_admin_all" on site_settings;
create policy "settings_public_read" on site_settings for select using (true);
create policy "settings_admin_all"   on site_settings for all   using (true) with check (true);

-- Dados de exemplo
insert into imoveis (titulo, slug, tipo, tipologia, preco, area_m2, quartos, casas_banho, garagem, localizacao, cidade, distrito, descricao, destaque) values
('Moradia T4 com Piscina',         'moradia-t4-piscina-braga',           'Venda',       'T4', 495000, 280, 4, 3, true,  'Nogueiro',   'Braga',    'Braga',  'Fantastica moradia isolada com piscina, jardim e garagem dupla.', true),
('Apartamento T2 Centro Porto',    'apartamento-t2-centro-porto',        'Venda',       'T2', 295000,  98, 2, 1, false, 'Bonfim',     'Porto',    'Porto',  'Apartamento completamente renovado no coracao do Porto.', true),
('Apartamento T1 Arrendamento',    'apartamento-t1-arrendamento-lisboa', 'Arrendamento','T1',   1200,  55, 1, 1, false, 'Arroios',    'Lisboa',   'Lisboa', 'Apartamento moderno, mobilado e equipado.', false),
('Moradia T3 com Jardim',          'moradia-t3-jardim-guimaraes',        'Venda',       'T3', 340000, 185, 3, 2, true,  'Azurem',     'Guimaraes','Braga',  'Moradia de 2 pisos com jardim privativo, garagem e arrumos.', true),
('Studio T0 Moderno',              'studio-t0-moderno-lisboa',           'Arrendamento','T0',    850,  38, 0, 1, false, 'Intendente', 'Lisboa',   'Lisboa', 'Studio completamente remodelado com design contemporaneo.', false),
('Moradia V4 Vista Mar Cascais',   'moradia-v4-vista-mar-cascais',       'Venda',       'T4', 1250000,420, 4, 4, true,  'Cascais',    'Cascais',  'Lisboa', 'Moradia de luxo com vista panoramica para o mar.', true)
on conflict (slug) do nothing;

insert into projetos (nome, slug, subtitulo, descricao, localizacao, cidade, estado, unidades_disponiveis, ordem) values
('Esporoes',        'esporoes',        'Moradias de excelencia',       'Projeto de habitacao premium em Esporoes, Braga.', 'Esporoes', 'Braga', 'em_curso',   4, 1),
('Merelim',         'merelim',         'Viver perto da cidade',        'Empreendimento residencial em Merelim, a 10 minutos do centro de Braga.', 'Merelim', 'Braga', 'em_curso', 6, 2),
('Lomar',           'lomar',           'Natureza e tranquilidade',     'Moradias em Lomar, numa das zonas residenciais mais procuradas de Braga.', 'Lomar', 'Braga', 'em_curso', 3, 3),
('Empreendimentos', 'empreendimentos', 'Novos projetos em lancamento', 'Conheca os nossos proximos empreendimentos.', 'Braga', 'Braga', 'brevemente', 0, 4)
on conflict (slug) do nothing;

insert into site_settings (key, value) values
  ('hero_linha1',       'Cada imovel conta uma historia.'),
  ('hero_linha2',       'A sua comeca aqui.'),
  ('contacto_telefone', '+351 210 000 000'),
  ('contacto_email',    'geral@paineltematico.pt'),
  ('contacto_morada',   'Braga, Portugal'),
  ('ami_numero',        'XXXXXXX'),
  ('sobre_texto',       'A sua imobiliaria de confianca em Portugal.')
on conflict (key) do nothing;
