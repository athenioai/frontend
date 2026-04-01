'use client'

import { useEffect, useState } from 'react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { COLORS, TEMPERATURA_COLORS, AGENT_COLORS } from '@/lib/constants/theme'
import { formatCurrency, formatPhone, formatRelativeTime, formatDate } from '@/lib/utils/format'
import {
  Flame, Thermometer, Snowflake, SmilePlus, Meh, Frown,
  MessageSquare, CreditCard, Megaphone, Calendar, Clock,
  User, MapPin, Tag, AlertTriangle, ExternalLink,
} from 'lucide-react'
import type { Lead, Conversation, Campaign } from '@/lib/types'
import type { PaymentLog } from '@/lib/types'

const TEMP_CONFIG = {
  quente: { color: TEMPERATURA_COLORS.quente, icon: Flame, label: 'Quente' },
  morno: { color: TEMPERATURA_COLORS.morno, icon: Thermometer, label: 'Morno' },
  frio: { color: TEMPERATURA_COLORS.frio, icon: Snowflake, label: 'Frio' },
} as const

const ESTAGIO_CONFIG: Record<string, { label: string; color: string }> = {
  captado: { label: 'Captado', color: COLORS.accent },
  qualificado: { label: 'Qualificado', color: '#3BBEB2' },
  negociacao: { label: 'Negociação', color: COLORS.emerald },
  convertido: { label: 'Convertido', color: COLORS.gold },
  perdido: { label: 'Perdido', color: COLORS.danger },
}

const SENT_CONFIG = {
  positivo: { icon: SmilePlus, color: COLORS.emerald, label: 'Positivo' },
  neutro: { icon: Meh, color: COLORS.textMuted, label: 'Neutro' },
  negativo: { icon: Frown, color: COLORS.danger, label: 'Negativo' },
} as const

interface LeadDetailDrawerProps {
  leadId: string | null
  onClose: () => void
}

interface LeadDetail {
  lead: Lead
  conversations: Conversation[]
  payments: PaymentLog[]
  campaign: Campaign | null
}

export function LeadDetailDrawer({ leadId, onClose }: LeadDetailDrawerProps) {
  const [data, setData] = useState<LeadDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!leadId) { setData(null); return }
    setLoading(true)
    fetch(`/api/leads/${leadId}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false))
  }, [leadId])

  const lead = data?.lead
  const temp = lead ? TEMP_CONFIG[lead.temperatura] : null
  const estagio = lead ? ESTAGIO_CONFIG[lead.estagio_funil] : null
  const sent = lead ? SENT_CONFIG[lead.sentimento] : null

  return (
    <Sheet open={!!leadId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto border-border-default bg-bg-base p-0 sm:max-w-xl">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : lead && temp && estagio && sent ? (
          <div>
            {/* Hero header */}
            <div className="relative overflow-hidden px-8 pt-10 pb-8">
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: `linear-gradient(135deg, ${estagio.color}08, transparent 60%)` }}
              />
              <div className="relative z-10">
                {/* Avatar + name */}
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 text-[18px] font-bold text-accent ring-1 ring-accent/10">
                    {lead.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-title text-[22px] font-bold text-text-primary">{lead.nome}</h2>
                    <p className="mt-1 text-[13px] text-text-muted">{formatPhone(lead.telefone)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {/* Temperatura badge */}
                      <span
                        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold"
                        style={{ backgroundColor: `${temp.color}15`, color: temp.color }}
                      >
                        <temp.icon className="h-2.5 w-2.5" />
                        {temp.label}
                      </span>
                      {/* Estagio badge */}
                      <span
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold"
                        style={{ backgroundColor: `${estagio.color}12`, color: estagio.color }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: estagio.color }} />
                        {estagio.label}
                      </span>
                      {/* Sentimento */}
                      <span className="inline-flex items-center gap-1 rounded-md bg-[rgba(240,237,232,0.04)] px-2 py-0.5 text-[11px] font-medium" style={{ color: sent.color }}>
                        <sent.icon className="h-2.5 w-2.5" />
                        {sent.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score ring */}
                <div className="mt-6 flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12">
                      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(240,237,232,0.06)" strokeWidth="4" />
                        <circle
                          cx="24" cy="24" r="20" fill="none"
                          stroke={lead.score >= 70 ? COLORS.emerald : lead.score >= 40 ? COLORS.gold : COLORS.danger}
                          strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={`${(lead.score / 100) * 125.66} 125.66`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center font-title text-[14px] font-bold text-text-primary">
                        {lead.score}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-subtle">Score</p>
                      <p className="text-[13px] font-semibold text-text-primary">{lead.score}/100</p>
                    </div>
                  </div>
                  <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-border-default to-transparent" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-subtle">Produto</p>
                    <p className="text-[13px] font-semibold text-text-primary">{lead.produto_interesse}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-8 h-[1px] bg-gradient-to-r from-transparent via-border-default to-transparent" />

            {/* Info cards */}
            <div className="space-y-5 px-8 py-8">
              {/* Origem / UTM */}
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
                  Origem do Lead
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Fonte', value: lead.origem_utm.source, icon: ExternalLink },
                    { label: 'Meio', value: lead.origem_utm.medium, icon: MapPin },
                    { label: 'Conteúdo', value: lead.origem_utm.content, icon: Tag },
                    { label: 'Desde', value: formatDate(lead.created_at), icon: Calendar },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-border-default bg-[rgba(240,237,232,0.02)] p-3">
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <item.icon className="h-3 w-3 text-text-subtle" />
                        <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-subtle">{item.label}</span>
                      </div>
                      <p className="text-[13px] font-medium text-text-primary">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campanha de origem */}
              {data.campaign && (
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
                    Campanha de Origem
                  </p>
                  <div className="card-surface overflow-hidden p-5">
                    <div
                      className="absolute left-0 right-0 top-0 h-[2px]"
                      style={{ background: `linear-gradient(90deg, ${COLORS.gold}, transparent 70%)` }}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${COLORS.gold}12` }}>
                          <Megaphone className="h-4 w-4" style={{ color: COLORS.gold }} />
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-text-primary">{data.campaign.nome}</p>
                          <p className="text-[11px] text-text-subtle">
                            ROAS {data.campaign.roas.toFixed(1)}× · CPL {formatCurrency(data.campaign.cpl)}
                          </p>
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          backgroundColor: data.campaign.status === 'ativa' ? `${COLORS.emerald}12` : `${COLORS.textSubtle}15`,
                          color: data.campaign.status === 'ativa' ? COLORS.emerald : COLORS.textSubtle,
                        }}
                      >
                        {data.campaign.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Objeções */}
              {lead.objecoes.length > 0 && (
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
                    Objeções Ativas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {lead.objecoes.map((obj) => (
                      <span
                        key={obj}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-danger/20 bg-danger/5 px-3 py-1.5 text-[12px] font-medium text-danger"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {obj.charAt(0).toUpperCase() + obj.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mx-0 h-[1px] bg-gradient-to-r from-transparent via-border-default to-transparent" />

              {/* Conversas com IA */}
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
                  Conversas com IA ({data.conversations.length})
                </p>
                {data.conversations.length > 0 ? (
                  <div className="space-y-3">
                    {data.conversations.map((conv) => {
                      const agentColor = conv.agente === 'hermes' ? AGENT_COLORS.hermes : AGENT_COLORS.ares
                      const agentLabel = conv.agente === 'hermes' ? 'Hermes (Marketing)' : 'Ares (Comercial)'
                      return (
                        <div key={conv.id} className="rounded-xl border border-border-default bg-[rgba(240,237,232,0.02)] p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="flex h-8 w-8 items-center justify-center rounded-lg"
                                style={{ backgroundColor: `${agentColor}12` }}
                              >
                                <MessageSquare className="h-3.5 w-3.5" style={{ color: agentColor }} />
                              </div>
                              <div>
                                <p className="text-[13px] font-semibold text-text-primary capitalize">{agentLabel}</p>
                                <p className="text-[11px] text-text-subtle">{formatRelativeTime(conv.created_at)}</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-4">
                            <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
                              <MessageSquare className="h-3 w-3 text-text-subtle" />
                              {conv.mensagens_count} mensagens
                            </div>
                            <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
                              <Clock className="h-3 w-3 text-text-subtle" />
                              {conv.duracao_minutos} min
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquare className="mb-2 h-5 w-5 text-text-subtle/40" />
                    <p className="text-[13px] text-text-subtle">Nenhuma conversa registrada</p>
                  </div>
                )}
              </div>

              {/* Pagamentos */}
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
                  Pagamentos ({data.payments.length})
                </p>
                {data.payments.length > 0 ? (
                  <div className="space-y-3">
                    {data.payments.map((pay) => (
                      <div key={pay.id} className="rounded-xl border border-border-default bg-[rgba(240,237,232,0.02)] p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${COLORS.emerald}12` }}>
                              <CreditCard className="h-3.5 w-3.5" style={{ color: COLORS.emerald }} />
                            </div>
                            <div>
                              <p className="font-title text-[16px] font-bold text-emerald">{formatCurrency(pay.valor)}</p>
                              <p className="text-[11px] text-text-subtle">{formatRelativeTime(pay.created_at)}</p>
                            </div>
                          </div>
                          <span
                            className="rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
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
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CreditCard className="mb-2 h-5 w-5 text-text-subtle/40" />
                    <p className="text-[13px] text-text-subtle">Nenhum pagamento registrado</p>
                  </div>
                )}
              </div>

              {/* Agente responsável */}
              {lead.agente_responsavel && (
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
                    Agente Responsável
                  </p>
                  <div className="flex items-center gap-3 rounded-xl border border-border-default bg-[rgba(240,237,232,0.02)] p-4">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${AGENT_COLORS[lead.agente_responsavel]}12` }}
                    >
                      <User className="h-4 w-4" style={{ color: AGENT_COLORS[lead.agente_responsavel] }} />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold capitalize text-text-primary">{lead.agente_responsavel}</p>
                      <p className="text-[11px] text-text-subtle">
                        {lead.agente_responsavel === 'hermes' ? 'Agente de Marketing' : lead.agente_responsavel === 'ares' ? 'Agente Comercial' : 'Orquestrador'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
