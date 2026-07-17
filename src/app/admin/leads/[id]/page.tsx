import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { ESTADOS, PRIORIDADES, formatFullDate, formatRelativeDate } from '@/lib/crm'
import { ChevronRight, Mail, Phone, Calendar, Pencil, Archive, UserCircle2 } from 'lucide-react'
// Mail/Phone still used in contact links below
import { cn } from '@/lib/utils'
import LeadStageSelector from '@/components/crm/LeadStageSelector'
import LeadPrioritySelector from '@/components/crm/LeadPrioritySelector'
import AddActivityForm from '@/components/crm/AddActivityForm'
import LeadNotesEditor from '@/components/crm/LeadNotesEditor'
import LeadTimeline from '@/components/crm/LeadTimeline'
import LeadArchivarButton from '@/components/crm/LeadArchivarButton'
import LeadInteresseEditor from '@/components/crm/LeadInteresseEditor'
import LeadTransferirButton from '@/components/crm/LeadTransferirButton'
import { getCurrentUser } from '@/lib/auth-server'
import { canUser } from '@/lib/permissions'

interface Props { params: Promise<{ id: string }> }

async function getLead(id: string) {
  const { data } = await supabaseAdmin
    .from('contactos_imoveis')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

async function getAtividades(leadId: string) {
  const { data } = await supabaseAdmin
    .from('lead_atividades')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
  return data ?? []
}

async function getAdminUser(id: string | null) {
  if (!id) return null
  const { data } = await supabaseAdmin
    .from('admin_users')
    .select('id, nome, email')
    .eq('id', id)
    .single()
  return data
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params
  const [lead, me] = await Promise.all([getLead(id), getCurrentUser()])
  if (!lead) notFound()

  const isSuperAdmin = me?.role === 'super_admin'
  const canTransfer = me ? canUser(me, 'leads.comerciais') : false

  // Filtrar atividades de arquivamento para não-super_admin
  const todasAtividades = await getAtividades(id)
  const atividades = isSuperAdmin
    ? todasAtividades
    : todasAtividades.filter(a => a.tipo !== 'arquivamento')

  const [criadoPor, responsavel] = await Promise.all([
    getAdminUser(lead.criado_por),
    getAdminUser(lead.responsavel_id),
  ])

  // Fetch users for transfer button
  const { data: adminUsersRaw } = canTransfer
    ? await supabaseAdmin.from('admin_users').select('id, nome').order('nome')
    : { data: [] }
  const adminUsers = (adminUsersRaw ?? []).map(u => ({ id: u.id, nome: u.nome ?? '' }))

  const est = ESTADOS.find((e) => e.value === lead.estado) ?? ESTADOS[0]
  const pri = PRIORIDADES.find((p) => p.value === lead.prioridade) ?? PRIORIDADES[1]

  return (
    <div className="max-w-5xl mx-auto">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#94a3b8] mb-6">
        <Link href="/admin/leads" className="hover:text-[#1F3F44] transition-colors">Leads</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#1F3F44] font-medium">{lead.nome}</span>
      </nav>

      {/* Badge arquivado */}
      {lead.arquivado && (
        <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <Archive className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">Lead arquivado</p>
            {lead.arquivado_em && (
              <p className="text-xs text-amber-600">
                {formatRelativeDate(lead.arquivado_em)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 sm:p-6 mb-6">
        <div className="flex items-start gap-3 sm:gap-4 flex-wrap">
          {/* Avatar */}
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-[#1F3F44] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-serif font-bold text-lg sm:text-xl">{lead.nome.charAt(0).toUpperCase()}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-1.5">
              <h1 className="font-serif text-lg sm:text-2xl font-bold text-[#1F3F44] leading-tight">{lead.nome}</h1>
              <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', est.bg, est.color)}>
                <span className={cn('w-1.5 h-1.5 rounded-full', est.dot)} />{est.label}
              </span>
              <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', pri.color)}>
                {pri.emoji} {pri.label}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1.5 sm:gap-4">
              <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#00545F] transition-colors min-w-0">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{lead.email}</span>
              </a>
              {lead.telefone && (
                <a href={`tel:${lead.telefone}`} className="flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#00545F] transition-colors">
                  <Phone className="w-3.5 h-3.5" />{lead.telefone}
                </a>
              )}
              <span className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                <Calendar className="w-3.5 h-3.5" />Entrada {formatRelativeDate(lead.created_at)}
              </span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            {!lead.arquivado && (
              <Link
                href={`/admin/leads/${lead.id}/editar`}
                className="p-2 sm:px-4 rounded-xl border border-[#e2e8f0] text-[#475569] text-sm font-semibold hover:bg-[#f8fafc] transition-colors flex items-center gap-2"
                title="Editar"
              >
                <Pencil className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Editar</span>
              </Link>
            )}
            {canTransfer && !lead.arquivado && (
              <LeadTransferirButton
                leadId={lead.id}
                responsavelId={lead.responsavel_id}
                users={adminUsers}
              />
            )}
            <LeadArchivarButton
              leadId={lead.id}
              arquivado={lead.arquivado ?? false}
              isSuperAdmin={isSuperAdmin}
            />
          </div>
        </div>

        {/* Mensagem inicial */}
        {lead.mensagem && (
          <div className="mt-5 pt-5 border-t border-[#e2e8f0]">
            <div className="bg-[#f8fafc] rounded-xl p-4">
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">Mensagem inicial</p>
              <p className="text-sm text-[#475569] leading-relaxed">{lead.mensagem}</p>
            </div>
          </div>
        )}

        {/* Imóvel de interesse + notas de interesse */}
        <LeadInteresseEditor
          leadId={lead.id}
          imovelTitulo={lead.imovel_titulo}
          imovelId={lead.imovel_id}
          notasInteresse={lead.notas_interesse}
          readOnly={lead.arquivado ?? false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* LEFT: CRM controls */}
        <div className="space-y-5">

          {/* Pipeline stage */}
          {!lead.arquivado && (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-4">Fase do Pipeline</p>
              <LeadStageSelector leadId={lead.id} current={lead.estado} />
            </div>
          )}

          {/* Priority */}
          {!lead.arquivado && (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-4">Prioridade</p>
              <LeadPrioritySelector leadId={lead.id} current={lead.prioridade} />
            </div>
          )}

          {/* Internal notes */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-4">Notas Internas</p>
            <LeadNotesEditor leadId={lead.id} initialNotes={lead.notas ?? ''} />
          </div>

          {/* Meta */}
          <div className="bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] p-5 space-y-2.5">
            {[
              { label: 'Fonte', value: lead.fonte ?? 'site' },
              { label: 'Criado', value: formatFullDate(lead.created_at) },
              { label: 'Atualizado', value: formatFullDate(lead.updated_at) },
            ].map((m) => (
              <div key={m.label} className="flex justify-between items-center">
                <span className="text-xs text-[#94a3b8]">{m.label}</span>
                <span className="text-xs text-[#475569] font-medium">{m.value}</span>
              </div>
            ))}

            {/* Criado por */}
            {criadoPor && (
              <div className="pt-2 border-t border-[#e2e8f0]">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#94a3b8]">Criado por</span>
                  <span className="flex items-center gap-1.5 text-xs text-[#475569] font-medium">
                    <UserCircle2 className="w-3.5 h-3.5 text-[#00545F]" />
                    {criadoPor.nome}
                  </span>
                </div>
              </div>
            )}

            {/* Responsável */}
            {responsavel && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#94a3b8]">Responsável</span>
                <span className="flex items-center gap-1.5 text-xs text-[#475569] font-medium">
                  <UserCircle2 className="w-3.5 h-3.5 text-[#1F3F44]" />
                  {responsavel.nome}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Activity timeline */}
        <div className="lg:col-span-2 space-y-5">

          {/* Add activity */}
          {!lead.arquivado && (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-4">Registar Atividade</p>
              <AddActivityForm leadId={lead.id} />
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-5">Histórico</p>
            <LeadTimeline atividades={atividades} isSuperAdmin={isSuperAdmin} />
          </div>
        </div>
      </div>
    </div>
  )
}
