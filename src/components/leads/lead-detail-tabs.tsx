'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { COLORS, AGENT_COLORS } from '@/lib/constants/theme'
import { formatCurrency, formatPhone, formatRelativeTime, formatDate } from '@/lib/utils/format'
import { MOTION } from '@/lib/motion'
import {
  MessageSquare, CreditCard, Megaphone, Calendar, Clock,
  ExternalLink, MapPin, Tag, AlertTriangle, Phone, LayoutGrid,
  TrendingUp, Package, CheckCircle2, Hourglass,
} from 'lucide-react'
import type { Lead, Campaign, PaymentLog, Conversation, Message } from '@/lib/types'

interface ConversationWithMessages extends Conversation {
  messages: Message[]
}

interface LeadDetailTabsProps {
  lead: Lead
  conversations: ConversationWithMessages[]
  payments: PaymentLog[]
  campaign: Campaign | null
  scoreColor: string
}

const TABS = [
  { key: 'geral', label: 'Visão Geral', Icon: LayoutGrid },
  { key: 'conversas', label: 'Conversas', Icon: MessageSquare },
  { key: 'pagamentos', label: 'Pagamentos', Icon: CreditCard },
] as const

type TabKey = (typeof TABS)[number]['key']

export function LeadDetailTabs({ lead, conversations, payments, campaign, scoreColor }: LeadDetailTabsProps) {
  const [active, setActive] = useState<TabKey>('geral')
  const totalPago = payments.filter(p => p.status === 'confirmed').reduce((s, p) => s + p.amount, 0)

  const counts: Record<TabKey, number | null> = {
    geral: null,
    conversas: conversations.length,
    pagamentos: payments.length,
  }

  return (
    <div>
      {/* ─── Tab bar ─── */}
      <div className="flex gap-1 rounded-xl bg-[rgba(240,237,232,0.03)] p-1 ring-1 ring-[rgba(240,237,232,0.06)]">
        {TABS.map((tab) => {
          const isActive = active === tab.key
          const count = counts[tab.key]

          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-colors duration-200 ${
                isActive ? 'text-text-primary' : 'text-text-subtle hover:text-text-muted'
              }`}
            >
              {/* Active pill background */}
              {isActive && (
                <motion.span
                  layoutId="lead-tab-pill"
                  className="absolute inset-0 rounded-lg bg-surface-2 ring-1 ring-[rgba(240,237,232,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
                  transition={{ duration: 0.25, ease: MOTION.ease.out }}
                />
              )}

              <span className="relative z-10 flex items-center gap-2">
                <tab.Icon className={`h-3.5 w-3.5 ${isActive ? 'text-accent' : ''}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                {count !== null && (
                  <span
                    className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums ${
                      isActive
                        ? 'bg-accent/15 text-accent'
                        : 'bg-[rgba(240,237,232,0.06)] text-text-subtle'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* ─── Tab content ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: MOTION.ease.out }}
          className="mt-6"
        >
          {active === 'geral' && (
            <TabGeral lead={lead} conversations={conversations} payments={payments} campaign={campaign} scoreColor={scoreColor} totalPago={totalPago} />
          )}
          {active === 'conversas' && <TabConversas conversations={conversations} />}
          {active === 'pagamentos' && <TabPagamentos payments={payments} totalPago={totalPago} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ───────────────────────────────────────────────── */
/*  Tab: Visão Geral                                 */
/* ───────────────────────────────────────────────── */

function TabGeral({
  lead, conversations, campaign, scoreColor, totalPago,
}: {
  lead: Lead
  conversations: ConversationWithMessages[]
  payments: PaymentLog[]
  campaign: Campaign | null
  scoreColor: string
  totalPago: number
}) {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Produto', value: lead.product_interest, Icon: Package, color: COLORS.accent },
          { label: 'Conversas', value: String(conversations.length), Icon: MessageSquare, color: COLORS.accent },
          { label: 'Objeções', value: String(lead.objections.length), Icon: AlertTriangle, color: lead.objections.length > 0 ? COLORS.danger : COLORS.textSubtle },
          { label: 'Total pago', value: formatCurrency(totalPago), Icon: TrendingUp, color: COLORS.emerald },
        ].map((kpi) => (
          <div key={kpi.label} className="card-surface group relative overflow-hidden p-4">
            <div className="pointer-events-none absolute -right-3 -top-3 h-16 w-16 rounded-full opacity-[0.04]" style={{ background: kpi.color }} />
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${kpi.color}10` }}>
                <kpi.Icon className="h-4 w-4" style={{ color: kpi.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">{kpi.label}</p>
                <p className="mt-0.5 truncate text-[15px] font-bold leading-tight text-text-primary">{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Origem / UTM */}
        <div className="lg:col-span-7">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
            Origem & Rastreamento
          </p>
          <div className="card-surface divide-y divide-border-default overflow-hidden">
            {[
              { label: 'Fonte', value: lead.utm_source.source, Icon: ExternalLink },
              { label: 'Meio', value: lead.utm_source.medium, Icon: MapPin },
              { label: 'Conteúdo', value: lead.utm_source.content, Icon: Tag },
              { label: 'Telefone', value: formatPhone(lead.phone), Icon: Phone },
              { label: 'Captado em', value: formatDate(lead.created_at), Icon: Calendar },
              { label: 'Atualizado', value: formatRelativeTime(lead.updated_at), Icon: Clock },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 px-3 py-3 sm:px-5">
                <item.Icon className="hidden h-3.5 w-3.5 shrink-0 text-text-subtle/50 sm:block" />
                <span className="w-20 shrink-0 text-[11px] font-medium uppercase tracking-wider text-text-subtle sm:w-24">{item.label}</span>
                <span className="min-w-0 truncate text-[13px] font-medium text-text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5 lg:col-span-5">
          {campaign && (
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
                Campanha de Origem
              </p>
              <div className="card-surface relative overflow-hidden p-5">
                <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: `linear-gradient(180deg, ${COLORS.gold}, transparent)` }} />
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${COLORS.gold}10` }}>
                    <Megaphone className="h-[18px] w-[18px]" style={{ color: COLORS.gold }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-text-primary">{campaign.name}</p>
                    <div className="mt-2 flex gap-4">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-text-subtle">ROAS</p>
                        <p className="font-title text-[16px] font-bold" style={{ color: COLORS.gold }}>{campaign.roas.toFixed(1)}×</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-text-subtle">CPL</p>
                        <p className="font-title text-[16px] font-bold text-text-primary">{formatCurrency(campaign.cpl)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {lead.objections.length > 0 && (
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
                Objeções Ativas
              </p>
              <div className="flex flex-wrap gap-2">
                {lead.objections.map((obj) => (
                  <span
                    key={obj}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-danger/12 bg-danger/5 px-3 py-2 text-[12px] font-medium text-danger"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {obj.charAt(0).toUpperCase() + obj.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────────────────────────────── */
/*  Tab: Conversas                                   */
/* ───────────────────────────────────────────────── */

function TabConversas({ conversations }: { conversations: ConversationWithMessages[] }) {
  if (conversations.length === 0) {
    return (
      <div className="card-surface flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(240,237,232,0.04)]">
          <MessageSquare className="h-5 w-5 text-text-subtle/30" />
        </div>
        <p className="text-[14px] font-medium text-text-muted">Nenhuma conversa registrada</p>
        <p className="mt-1 text-[12px] text-text-subtle">As conversas com agentes IA aparecerão aqui</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {conversations.map((conv) => {
        const agentColor = conv.agent === 'hermes' ? AGENT_COLORS.hermes : AGENT_COLORS.ares
        const agentLabel = conv.agent === 'hermes' ? 'Hermes (Marketing)' : 'Ares (Comercial)'
        const agentInitial = conv.agent === 'hermes' ? 'H' : 'A'

        return (
          <div key={conv.id} className="card-surface overflow-hidden">
            {/* Conversation header */}
            <div className="relative border-b border-border-default">
              <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ background: `linear-gradient(135deg, ${agentColor}, transparent 60%)` }} />
              <div className="relative flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${agentColor}12` }}>
                    <span className="font-title text-[14px] font-bold" style={{ color: agentColor }}>{agentInitial}</span>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface-1" style={{ backgroundColor: agentColor }} />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-text-primary">{agentLabel}</p>
                    <p className="text-[12px] text-text-subtle">{formatRelativeTime(conv.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-lg bg-[rgba(240,237,232,0.04)] px-2.5 py-1.5">
                    <MessageSquare className="h-3 w-3 text-text-subtle" />
                    <span className="text-[12px] font-semibold tabular-nums text-text-muted">{conv.messages_count}</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-[rgba(240,237,232,0.04)] px-2.5 py-1.5">
                    <Clock className="h-3 w-3 text-text-subtle" />
                    <span className="text-[12px] font-semibold tabular-nums text-text-muted">{conv.duration_minutes}m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat messages */}
            {conv.messages.length > 0 && (
              <div className="relative">
                <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-4 bg-gradient-to-b from-surface-1 to-transparent" />
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-4 bg-gradient-to-t from-surface-1 to-transparent" />

                <div className="max-h-[480px] space-y-3 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5">
                  {conv.messages.map((msg) => {
                    const isAgent = msg.sender === 'agent'
                    return (
                      <div key={msg.id} className={`flex gap-2.5 ${isAgent ? 'justify-start' : 'justify-end'}`}>
                        {isAgent && (
                          <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `${agentColor}10` }}>
                            <span className="text-[10px] font-bold" style={{ color: agentColor }}>{agentInitial}</span>
                          </div>
                        )}
                        <div
                          className={`max-w-[90%] rounded-2xl px-3 py-2.5 sm:max-w-[78%] sm:px-4 sm:py-3 ${
                            isAgent
                              ? 'rounded-tl-md bg-[rgba(240,237,232,0.04)] ring-1 ring-[rgba(240,237,232,0.06)]'
                              : 'rounded-tr-md ring-1'
                          }`}
                          style={!isAgent ? { backgroundColor: `${agentColor}08`, '--tw-ring-color': `${agentColor}15` } as React.CSSProperties : {}}
                        >
                          <p className="text-[13px] leading-relaxed text-text-primary">{msg.text}</p>
                          <p className={`mt-1.5 text-[10px] ${isAgent ? 'text-text-subtle' : ''}`} style={!isAgent ? { color: `${agentColor}80` } : {}}>
                            {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            {isAgent && <span className="ml-1 opacity-60">· {conv.agent === 'hermes' ? 'Hermes' : 'Ares'}</span>}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ───────────────────────────────────────────────── */
/*  Tab: Pagamentos                                  */
/* ───────────────────────────────────────────────── */

function TabPagamentos({ payments, totalPago }: { payments: PaymentLog[]; totalPago: number }) {
  if (payments.length === 0) {
    return (
      <div className="card-surface flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(240,237,232,0.04)]">
          <CreditCard className="h-5 w-5 text-text-subtle/30" />
        </div>
        <p className="text-[14px] font-medium text-text-muted">Nenhum pagamento registrado</p>
        <p className="mt-1 text-[12px] text-text-subtle">Os pagamentos do lead aparecerão aqui</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {payments.map((pay) => {
        const isConfirmed = pay.status === 'confirmed'
        const statusColor = isConfirmed ? COLORS.emerald : COLORS.gold
        const StatusIcon = isConfirmed ? CheckCircle2 : Hourglass

        return (
          <div key={pay.id} className="card-surface relative overflow-hidden p-5">
            <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ backgroundColor: statusColor }} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${statusColor}10` }}>
                  <CreditCard className="h-5 w-5" style={{ color: statusColor }} />
                </div>
                <div>
                  <p className="font-title text-[22px] font-bold" style={{ color: statusColor }}>
                    {formatCurrency(pay.amount)}
                  </p>
                  <p className="mt-0.5 text-[12px] text-text-subtle">{formatDate(pay.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ backgroundColor: `${statusColor}08` }}>
                <StatusIcon className="h-3.5 w-3.5" style={{ color: statusColor }} />
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: statusColor }}>
                  {pay.status}
                </span>
              </div>
            </div>
          </div>
        )
      })}

      <div className="mt-2 flex items-center justify-between rounded-xl border border-dashed border-border-default px-5 py-4">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-text-subtle">Total confirmado</span>
        <span className="font-title text-[20px] font-bold text-emerald">{formatCurrency(totalPago)}</span>
      </div>
    </div>
  )
}
