import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/lib/services'
import { mockLeads, mockConversations, mockPayments, mockCampaigns, mockMessages } from '@/lib/services/mock/data'
import { COLORS, TEMPERATURA_COLORS, AGENT_COLORS } from '@/lib/constants/theme'
import { formatCurrency, formatPhone, formatRelativeTime, formatDate } from '@/lib/utils/format'
import {
  ArrowLeft, Flame, Thermometer, Snowflake, SmilePlus, Meh, Frown,
  MessageSquare, CreditCard, Megaphone, Calendar, Clock,
  User, MapPin, Tag, AlertTriangle, ExternalLink, Phone, Package,
} from 'lucide-react'

const TEMP_CONFIG = {
  quente: { color: TEMPERATURA_COLORS.quente, Icon: Flame, label: 'Quente' },
  morno: { color: TEMPERATURA_COLORS.morno, Icon: Thermometer, label: 'Morno' },
  frio: { color: TEMPERATURA_COLORS.frio, Icon: Snowflake, label: 'Frio' },
} as const

const ESTAGIO_CONFIG: Record<string, { label: string; color: string }> = {
  captado: { label: 'Captado', color: COLORS.accent },
  qualificado: { label: 'Qualificado', color: '#3BBEB2' },
  negociacao: { label: 'Negociação', color: COLORS.emerald },
  convertido: { label: 'Convertido', color: COLORS.gold },
  perdido: { label: 'Perdido', color: COLORS.danger },
}

const SENT_CONFIG = {
  positivo: { Icon: SmilePlus, color: COLORS.emerald, label: 'Positivo' },
  neutro: { Icon: Meh, color: COLORS.textMuted, label: 'Neutro' },
  negativo: { Icon: Frown, color: COLORS.danger, label: 'Negativo' },
} as const

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const { id } = await params
  const lead = mockLeads.find((l) => l.id === id)
  if (!lead) redirect('/leads')

  const conversations = mockConversations
    .filter((c) => c.lead_id === id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const payments = mockPayments
    .filter((p) => p.lead_id === id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const campaign = lead.origem_utm.campaign
    ? mockCampaigns.find((c) => c.id === lead.origem_utm.campaign) ?? null
    : null

  const temp = TEMP_CONFIG[lead.temperatura]
  const estagio = ESTAGIO_CONFIG[lead.estagio_funil]
  const sent = SENT_CONFIG[lead.sentimento]
  const scoreColor = lead.score >= 70 ? COLORS.emerald : lead.score >= 40 ? COLORS.gold : COLORS.danger
  const initials = lead.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="space-y-8">
      {/* Back + header */}
      <div className="flex items-center gap-4">
        <Link href="/leads" className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-all duration-200 hover:bg-[rgba(255,255,255,0.04)] hover:text-text-primary">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 text-[18px] font-bold text-accent ring-1 ring-accent/10">
            {initials}
          </div>
          <div>
            <h1 className="font-title text-[22px] font-bold text-text-primary">{lead.nome}</h1>
            <p className="mt-0.5 text-[13px] text-text-muted">{formatPhone(lead.telefone)}</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: `${temp.color}15`, color: temp.color }}>
          <temp.Icon className="h-3 w-3" />
          {temp.label}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: `${estagio.color}12`, color: estagio.color }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: estagio.color }} />
          {estagio.label}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-[rgba(240,237,232,0.04)] px-2.5 py-1 text-[11px] font-medium" style={{ color: sent.color }}>
          <sent.Icon className="h-3 w-3" />
          {sent.label}
        </span>
        {lead.agente_responsavel && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[rgba(240,237,232,0.04)] px-2.5 py-1 text-[11px] font-medium text-text-muted">
            <User className="h-3 w-3" style={{ color: AGENT_COLORS[lead.agente_responsavel] }} />
            {lead.agente_responsavel === 'hermes' ? 'Hermes (Marketing)' : lead.agente_responsavel === 'ares' ? 'Ares (Comercial)' : 'Athena (Orquestrador)'}
          </span>
        )}
      </div>

      {/* KPI strip */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        <div className="card-surface p-5">
          <div className="mb-2 flex items-center gap-2">
            <div className="relative h-10 w-10">
              <svg className="h-10 w-10 -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(240,237,232,0.06)" strokeWidth="3.5" />
                <circle cx="20" cy="20" r="16" fill="none" stroke={scoreColor} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${(lead.score / 100) * 100.53} 100.53`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-title text-[12px] font-bold text-text-primary">{lead.score}</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">Score</p>
              <p className="font-title text-[18px] font-bold leading-none" style={{ color: scoreColor }}>{lead.score}/100</p>
            </div>
          </div>
        </div>
        <div className="card-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">Produto</p>
          <p className="mt-1.5 text-[15px] font-semibold leading-snug text-text-primary">{lead.produto_interesse}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">Conversas</p>
          <p className="mt-1.5 font-title text-[24px] font-bold leading-none text-accent">{conversations.length}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">Total pago</p>
          <p className="mt-1.5 font-title text-[24px] font-bold leading-none text-emerald">
            {formatCurrency(payments.filter(p => p.status === 'confirmado').reduce((s, p) => s + p.valor, 0))}
          </p>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: main info */}
        <div className="space-y-6 lg:col-span-8">
          {/* Conversas com IA */}
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
              Conversas com IA ({conversations.length})
            </p>
            {conversations.length > 0 ? (
              <div className="space-y-5">
                {conversations.map((conv) => {
                  const agentColor = conv.agente === 'hermes' ? AGENT_COLORS.hermes : AGENT_COLORS.ares
                  const agentLabel = conv.agente === 'hermes' ? 'Hermes (Marketing)' : 'Ares (Comercial)'
                  const messages = mockMessages.filter((m) => m.conversation_id === conv.id)

                  return (
                    <div key={conv.id} className="card-surface overflow-hidden">
                      {/* Conversation header */}
                      <div className="flex items-center justify-between border-b border-border-default p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${agentColor}12` }}>
                            <MessageSquare className="h-[18px] w-[18px]" style={{ color: agentColor }} />
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-text-primary">{agentLabel}</p>
                            <p className="text-[12px] text-text-subtle">{formatRelativeTime(conv.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-right">
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-subtle">Msgs</p>
                            <p className="font-title text-[16px] font-bold text-text-primary">{conv.mensagens_count}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-subtle">Tempo</p>
                            <p className="font-title text-[16px] font-bold text-text-primary">{conv.duracao_minutos}m</p>
                          </div>
                        </div>
                      </div>

                      {/* Chat messages */}
                      {messages.length > 0 && (
                        <div className="max-h-[400px] space-y-3 overflow-y-auto p-5">
                          {messages.map((msg) => {
                            const isAgent = msg.sender === 'agent'
                            return (
                              <div key={msg.id} className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
                                <div
                                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                                    isAgent
                                      ? 'rounded-bl-md bg-[rgba(240,237,232,0.05)]'
                                      : 'rounded-br-md'
                                  }`}
                                  style={!isAgent ? { backgroundColor: `${agentColor}15` } : {}}
                                >
                                  <p className="text-[13px] leading-relaxed text-text-primary">{msg.text}</p>
                                  <p className={`mt-1 text-[10px] ${isAgent ? 'text-text-subtle' : ''}`} style={!isAgent ? { color: `${agentColor}90` } : {}}>
                                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    {isAgent && <span className="ml-1">· {conv.agente === 'hermes' ? 'Hermes' : 'Ares'}</span>}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="card-surface flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="mb-2 h-5 w-5 text-text-subtle/40" />
                <p className="text-[13px] text-text-subtle">Nenhuma conversa registrada</p>
              </div>
            )}
          </div>

          {/* Pagamentos */}
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
              Pagamentos ({payments.length})
            </p>
            {payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((pay) => (
                  <div key={pay.id} className="card-surface p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${COLORS.emerald}12` }}>
                          <CreditCard className="h-[18px] w-[18px]" style={{ color: COLORS.emerald }} />
                        </div>
                        <div>
                          <p className="font-title text-[20px] font-bold text-emerald">{formatCurrency(pay.valor)}</p>
                          <p className="text-[12px] text-text-subtle">{formatDate(pay.created_at)}</p>
                        </div>
                      </div>
                      <span
                        className="rounded-lg px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
                        style={{
                          backgroundColor: pay.status === 'confirmado' ? `${COLORS.emerald}12` : `${COLORS.gold}12`,
                          color: pay.status === 'confirmado' ? COLORS.emerald : COLORS.gold,
                        }}
                      >
                        {pay.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-surface flex flex-col items-center justify-center py-12 text-center">
                <CreditCard className="mb-2 h-5 w-5 text-text-subtle/40" />
                <p className="text-[13px] text-text-subtle">Nenhum pagamento registrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: sidebar info */}
        <div className="space-y-6 lg:col-span-4">
          {/* Origem / UTM */}
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
              Origem do Lead
            </p>
            <div className="space-y-3">
              {[
                { label: 'Fonte', value: lead.origem_utm.source, Icon: ExternalLink },
                { label: 'Meio', value: lead.origem_utm.medium, Icon: MapPin },
                { label: 'Conteúdo', value: lead.origem_utm.content, Icon: Tag },
                { label: 'Telefone', value: formatPhone(lead.telefone), Icon: Phone },
                { label: 'Captado em', value: formatDate(lead.created_at), Icon: Calendar },
                { label: 'Atualizado', value: formatRelativeTime(lead.updated_at), Icon: Clock },
              ].map((item) => (
                <div key={item.label} className="card-surface p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(240,237,232,0.04)]">
                      <item.Icon className="h-3.5 w-3.5 text-text-subtle" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-subtle">{item.label}</p>
                      <p className="text-[13px] font-medium text-text-primary">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campanha de origem */}
          {campaign && (
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
                Campanha de Origem
              </p>
              <div className="card-surface relative overflow-hidden p-5">
                <div className="absolute left-0 right-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${COLORS.gold}, transparent 70%)` }} />
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${COLORS.gold}12` }}>
                    <Megaphone className="h-4 w-4" style={{ color: COLORS.gold }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-text-primary">{campaign.nome}</p>
                    <p className="text-[11px] text-text-subtle">ROAS {campaign.roas.toFixed(1)}× · CPL {formatCurrency(campaign.cpl)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Objeções */}
          {lead.objecoes.length > 0 && (
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
                Objeções Ativas ({lead.objecoes.length})
              </p>
              <div className="space-y-2">
                {lead.objecoes.map((obj) => (
                  <div key={obj} className="flex items-center gap-3 rounded-xl border border-danger/15 bg-danger/5 px-4 py-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
                    <p className="text-[13px] font-medium text-danger">{obj.charAt(0).toUpperCase() + obj.slice(1)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
