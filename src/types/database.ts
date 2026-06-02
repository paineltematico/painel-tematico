export type Imovel = {
  id: string
  titulo: string
  slug: string
  tipo: 'Venda' | 'Arrendamento'
  tipologia: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T4+' | null
  preco: number | null
  area_m2: number | null
  quartos: number | null
  casas_banho: number | null
  garagem: boolean
  localizacao: string | null
  cidade: string | null
  distrito: string | null
  descricao: string | null
  fotos: string[]
  destaque: boolean
  disponivel: boolean
  created_at: string
}

export type ProjetoEstado = 'em_curso' | 'concluido' | 'brevemente'

export type Projeto = {
  id: string
  nome: string
  slug: string
  subtitulo: string | null
  descricao: string | null
  localizacao: string | null
  cidade: string | null
  imagem: string | null
  estado: ProjetoEstado
  unidades_total: number | null
  unidades_disponiveis: number | null
  ordem: number
  ativo: boolean
  created_at: string
}

export type Artigo = {
  id: string
  titulo: string
  slug: string
  resumo: string | null
  conteudo: string | null
  imagem: string | null
  categoria: string
  publicado: boolean
  publicado_em: string | null
  created_at: string
  updated_at: string
}

export type VideoObra = {
  id: string
  titulo: string
  url: string
  thumbnail: string | null
  projeto: string | null
  ordem: number
  ativo: boolean
  created_at: string
}

export type LeadEstado = 'novo' | 'contactado' | 'qualificado' | 'visita_agendada' | 'negociacao' | 'reserva' | 'ganho' | 'perdido'
export type LeadPrioridade = 'baixa' | 'normal' | 'alta'
export type AtividadeTipo = 'nota' | 'chamada' | 'email' | 'visita' | 'mudanca_estado'
export type LeadTemperatura = 'frio' | 'morno' | 'quente' | 'muito_quente'

export type Unidade = {
  id: string
  projeto_id: string
  referencia: string
  tipologia: string | null
  area_m2: number | null
  preco: number | null
  estado: 'disponivel' | 'reservado' | 'vendido'
  piso: number | null
  descricao: string | null
  planta: string | null
  ordem: number
  created_at: string
}

export type AtualizacaoObra = {
  id: string
  projeto_id: string
  titulo: string
  descricao: string | null
  fotos: string[]
  data_atualizacao: string
  fase: string | null
  percentagem_conclusao: number
  publicado: boolean
  created_at: string
}

export type Testemunho = {
  id: string
  projeto_id: string | null
  nome: string
  cargo: string | null
  texto: string
  rating: number
  foto: string | null
  publicado: boolean
  ordem: number
  created_at: string
}

export type MembroEquipa = {
  id: string
  nome: string
  cargo: string
  bio: string | null
  foto: string | null
  email: string | null
  telefone: string | null
  linkedin: string | null
  ordem: number
  ativo: boolean
  created_at: string
}

export type Parceiro = {
  id: string
  nome: string
  logo: string | null
  website: string | null
  categoria: string | null
  ordem: number
  ativo: boolean
  created_at: string
}

export type Lead = {
  id: string
  nome: string
  email: string
  telefone: string | null
  mensagem: string | null
  imovel_id: string | null
  imovel_titulo: string | null
  estado: LeadEstado
  prioridade: LeadPrioridade
  temperatura: LeadTemperatura
  score: number
  tags: string[] | null
  projeto_interesse: string | null
  orcamento_min: number | null
  orcamento_max: number | null
  responsavel_id: string | null
  notas: string | null
  lido: boolean
  fonte: string | null
  created_at: string
  updated_at: string
}

export type LeadAtividade = {
  id: string
  lead_id: string
  tipo: AtividadeTipo
  conteudo: string | null
  estado_anterior: string | null
  estado_novo: string | null
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      imoveis: {
        Row: Imovel
        Insert: Omit<Imovel, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Imovel, 'id' | 'created_at'>>
        Relationships: []
      }
      contactos_imoveis: {
        Row: Lead
        Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'imovel_id' | 'notas' | 'telefone' | 'mensagem' | 'imovel_titulo' | 'fonte' | 'temperatura' | 'score' | 'tags' | 'projeto_interesse' | 'orcamento_min' | 'orcamento_max' | 'responsavel_id'> & {
          id?: string; created_at?: string; updated_at?: string
          imovel_id?: string | null; notas?: string | null
          telefone?: string | null; mensagem?: string | null
          imovel_titulo?: string | null; fonte?: string | null
          temperatura?: LeadTemperatura; score?: number
          tags?: string[] | null; projeto_interesse?: string | null
          orcamento_min?: number | null; orcamento_max?: number | null
          responsavel_id?: string | null
        }
        Update: Partial<Omit<Lead, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      lead_atividades: {
        Row: LeadAtividade
        Insert: Omit<LeadAtividade, 'id' | 'created_at' | 'conteudo' | 'estado_anterior' | 'estado_novo'> & {
          id?: string; created_at?: string
          conteudo?: string | null; estado_anterior?: string | null; estado_novo?: string | null
        }
        Update: Partial<Omit<LeadAtividade, 'id' | 'created_at'>>
        Relationships: []
      }
      projetos: {
        Row: Projeto
        Insert: Omit<Projeto, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Projeto, 'id' | 'created_at'>>
        Relationships: []
      }
      blog_posts: {
        Row: Artigo
        Insert: Omit<Artigo, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<Artigo, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      videos_obra: {
        Row: VideoObra
        Insert: Omit<VideoObra, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<VideoObra, 'id' | 'created_at'>>
        Relationships: []
      }
      site_settings: {
        Row: { key: string; value: string | null; updated_at: string }
        Insert: { key: string; value?: string | null; updated_at?: string }
        Update: { value?: string | null; updated_at?: string }
        Relationships: []
      }
      admin_users: {
        Row: { id: string; email: string; nome: string; password_hash: string; role: string; ativo: boolean; ultimo_login: string | null; created_at: string }
        Insert: { id?: string; email: string; nome: string; password_hash: string; role: string; ativo?: boolean; ultimo_login?: string | null; created_at?: string }
        Update: { email?: string; nome?: string; password_hash?: string; role?: string; ativo?: boolean; ultimo_login?: string | null }
        Relationships: []
      }
      unidades: {
        Row: Unidade
        Insert: Omit<Unidade, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Unidade, 'id' | 'created_at'>>
        Relationships: []
      }
      atualizacoes_obra: {
        Row: AtualizacaoObra
        Insert: Omit<AtualizacaoObra, 'id' | 'created_at'> & { id?: string; created_at?: string; fotos?: string[] }
        Update: Partial<Omit<AtualizacaoObra, 'id' | 'created_at'>>
        Relationships: []
      }
      testemunhos: {
        Row: Testemunho
        Insert: Omit<Testemunho, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Testemunho, 'id' | 'created_at'>>
        Relationships: []
      }
      equipa: {
        Row: MembroEquipa
        Insert: Omit<MembroEquipa, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<MembroEquipa, 'id' | 'created_at'>>
        Relationships: []
      }
      parceiros: {
        Row: Parceiro
        Insert: Omit<Parceiro, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Parceiro, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
