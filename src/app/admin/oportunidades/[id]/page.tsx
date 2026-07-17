import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'
import { getEstado, getTipo, formatPreco, formatFullDate, mapaLink, moradaCompleta } from '@/lib/oportunidades'
import { ChevronLeft, Mail, Phone, MapPin, Pencil, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import OportunidadeEstadoSelector from '@/components/oportunidades/OportunidadeEstadoSelector'
import FollowUpEditor from '@/components/oportunidades/FollowUpEditor'
import ConverterButtons from '@/components/oportunidades/ConverterButtons'
import MediaUpload from '@/components/oportunidades/MediaUpload'
import EstimativaEditor from '@/components/oportunidades/EstimativaEditor'
import NotasEditor from '@/components/oportunidades/NotasEditor'
import AddNotaForm from '@/components/oportunidades/AddNotaForm'
import OportunidadeTimeline from '@/components/oportunidades/OportunidadeTimeline'
import ApagarOportunidadeButton from '@/components/oportunidades/ApagarOportunidadeButton'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ id: string }> }

function Card({ titulo, children, className }: { titulo: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-[#e2e8f0] p-4 sm:p-5', className)}>
      <h3 className="text-sm font-semibold text-[#1F3F44] mb-3">{titulo}</h3>
      {children}
    </div>
  )
}

export default async function OportunidadeDetailPage({ params }: Props) {
  const { id } = await params
  const me = await getCurrentUser()
  if (!me) redirect('/admin/login')
  if (!canUser(me, 'oportunidades.view')) redirect('/admin/dashboard')

  const { data: op } = await supabaseAdmin.from('oportunidades').select('*').eq('id', id).single()
  if (!op) notFound()

  const { data: atividades } = await supabaseAdmin
    .from('oportunidade_atividades')
    .select('*')
    .eq('oportunidade_id', id)
    .order('created_at', { ascending: false })

  const est = getEstado(op.estado)
  const tipo = getTipo(op.tipo)
  const maps = mapaLink(op)
  const canDelete = canUser(me, 'oportunidades.delete')

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/admin/oportunidades" className="inline-flex items-center gap-1 text-sm text-[#64748b] hover:text-[#00545F] mb-4">
        <ChevronLeft className="w-4 h-4" /> Oportunidades
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 sm:p-6 mb-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">{tipo.emoji}</div>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-lg sm:text-2xl font-bold text-[#1F3F44] leading-tight">{op.pessoa_nome}</h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border', est.bg, est.color)}>
                <span className={cn('w-1.5 h-1.5 rounded-full', est.dot)} />{est.label}
              </span>
              <span className="text-[#64748b] text-sm">{tipo.label}</span>
            </div>
          </div>
          {/* Ações: só ícones em mobile, ícone+texto em ecrãs maiores */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Link href={`/admin/oportunidades/${id}/editar`} className="flex items-center gap-1.5 p-2 sm:px-3 rounded-xl border border-[#e2e8f0] text-[#1F3F44] text-sm font-semibold hover:bg-[#f8fafc] transition-colors" title="Editar">
              <Pencil className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Editar</span>
            </Link>
            {canDelete && <ApagarOportunidadeButton oportunidadeId={id} />}
          </div>
        </div>

        {/* Contactos */}
        {(op.pessoa_email || op.pessoa_telefone) && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3">
            {op.pessoa_email && <a href={`mailto:${op.pessoa_email}`} className="flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#00545F] min-w-0"><Mail className="w-4 h-4 flex-shrink-0" /><span className="truncate">{op.pessoa_email}</span></a>}
            {op.pessoa_telefone && <a href={`tel:${op.pessoa_telefone}`} className="flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#00545F]"><Phone className="w-4 h-4 flex-shrink-0" />{op.pessoa_telefone}</a>}
          </div>
        )}

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-[#f1f5f9]">
          <div>
            <p className="text-xs text-[#94a3b8] uppercase tracking-wider">Tipologia</p>
            <p className="text-sm font-semibold text-[#1F3F44] mt-0.5">{op.tipologia ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[#94a3b8] uppercase tracking-wider">Área</p>
            <p className="text-sm font-semibold text-[#1F3F44] mt-0.5">{op.area_m2 ? `${op.area_m2} m²` : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[#94a3b8] uppercase tracking-wider">Preço esperado</p>
            <p className="text-sm font-semibold text-[#1F3F44] mt-0.5">{formatPreco(op.preco_esperado_min, op.preco_esperado_max)}</p>
          </div>
          <div>
            <p className="text-xs text-[#94a3b8] uppercase tracking-wider">Criada</p>
            <p className="text-sm font-semibold text-[#1F3F44] mt-0.5">{formatFullDate(op.created_at)}</p>
          </div>
        </div>

        {/* Localização */}
        <div className="mt-5 pt-5 border-t border-[#f1f5f9] flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#94a3b8] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider">Localização</p>
              <p className="text-sm text-[#1F3F44] mt-0.5">{moradaCompleta(op)}</p>
            </div>
          </div>
          {maps && (
            <a href={maps} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e2e8f0] text-[#00545F] text-sm font-semibold hover:bg-[#f8fafc] transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Ver no mapa
            </a>
          )}
        </div>

        {op.descricao && (
          <div className="mt-5 pt-5 border-t border-[#f1f5f9]">
            <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">Descrição</p>
            <p className="text-sm text-[#475569] whitespace-pre-wrap">{op.descricao}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Coluna esquerda — ações */}
        <div className="space-y-4 sm:space-y-6">
          <Card titulo="Conversão">
            <ConverterButtons oportunidadeId={id} jaConvertida={op.estado === 'convertida'} convertidoTipo={op.convertido_tipo} convertidoId={op.convertido_id} />
          </Card>
          <Card titulo="Estado">
            <OportunidadeEstadoSelector oportunidadeId={id} current={op.estado} />
          </Card>
          <Card titulo="Follow-up">
            <FollowUpEditor oportunidadeId={id} initialData={op.follow_up_data} initialNota={op.follow_up_nota} hasEvent={!!op.gcal_event_id} />
          </Card>
        </div>

        {/* Coluna direita — trabalho */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card titulo="Estimativa / Orçamento">
            <EstimativaEditor oportunidadeId={id} initial={op.estimativa ?? []} />
          </Card>

          <Card titulo="Notas">
            <NotasEditor oportunidadeId={id} initialNotas={op.notas ?? ''} />
          </Card>

          <Card titulo="Fotos">
            <MediaUpload oportunidadeId={id} initial={op.fotos ?? []} campo="fotos" />
          </Card>

          <Card titulo="Documentos">
            <MediaUpload oportunidadeId={id} initial={op.documentos ?? []} campo="documentos" />
          </Card>

          <Card titulo="Registar atividade">
            <AddNotaForm oportunidadeId={id} />
          </Card>

          <Card titulo="Histórico">
            <OportunidadeTimeline atividades={atividades ?? []} />
          </Card>
        </div>
      </div>
    </div>
  )
}
