import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/lib/services'
import { mockLeads, mockConversations, mockPayments, mockCampaigns, mockMessages } from '@/lib/services/mock/data'
import { COLORS, TEMPERATURA_COLORS, AGENT_COLORS } from '@/lib/constants/theme'
import { formatPhone, formatCurrency } from '@/lib/utils/format'
import {
  ArrowLeft, Flame, Thermometer, Snowflake, SmilePlus, Meh, Frown, User, Phone,
} from 'lucide-react'
import { LeadDetailTabs } from '@/components/leads/lead-detail-tabs'

const TEMP_CONFIG = {
  hot: { color: TEMPERATURA_COLORS.hot, Icon: Flame, label: 'Quente' },
  warm: { color: TEMPERATURA_COLORS.warm, Icon: Thermometer, label: 'Morno' },
  cold: { color: TEMPERATURA_COLORS.cold, Icon: Snowflake, label: 'Frio' },
} as const

const ESTAGIO_CONFIG: Record<string, { label: string; color: string }> = {
  captured: { label: 'Captado', color: COLORS.accent },
  qualified: { label: 'Qualificado', color: '#3BBEB2' },
  negotiation: { label: 'Negociação', color: COLORS.emerald },
  converted: { label: 'Convertido', color: COLORS.gold },
  lost: { label: 'Perdido', color: COLORS.danger },
}

const SENT_CONFIG = {
  positive: { Icon: SmilePlus, color: COLORS.emerald, label: 'Positivo' },
  neutral: { Icon: Meh, color: COLORS.textMuted, label: 'Neutro' },
  negative: { Icon: Frown, color: COLORS.danger, label: 'Negativo' },
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
    .map((conv) => ({
      ...conv,
      messages: mockMessages.filter((m) => m.conversation_id === conv.id),
    }))

  const payments = mockPayments
    .filter((p) => p.lead_id === id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const campaign = lead.utm_source.campaign
    ? mockCampaigns.find((c) => c.id === lead.utm_source.campaign) ?? null
    : null

  const temp = TEMP_CONFIG[lead.temperature]
  const estagio = ESTAGIO_CONFIG[lead.funnel_stage]
  const sent = SENT_CONFIG[lead.sentiment]
  const scoreColor = lead.score >= 70 ? COLORS.emerald : lead.score >= 40 ? COLORS.gold : COLORS.danger
  const initials = lead.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  const totalPago = payments.filter(p => p.status === 'confirmed').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/leads"
        className="inline-flex items-center gap-2 text-[13px] font-medium text-text-muted transition-colors duration-200 hover:text-text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Leads
      </Link>

      {/* Hero header card */}
      <div className="card-surface relative overflow-hidden">
        {/* Top accent line */}
        <div
          className="absolute left-0 right-0 top-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, ${temp.color}, ${scoreColor} 50%, transparent)` }}
        />

        {/* Subtle radial glow behind avatar */}
        <div
          className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full opacity-[0.07] blur-3xl"
          style={{ background: scoreColor }}
        />

        <div className="relative flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
          {/* Avatar with score ring */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <svg className="h-[72px] w-[72px] -rotate-90" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="32" fill="none" stroke="rgba(240,237,232,0.05)" strokeWidth="3" />
                <circle
                  cx="36" cy="36" r="32" fill="none" stroke={scoreColor} strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(lead.score / 100) * 201.06} 201.06`}
                  style={{ filter: `drop-shadow(0 0 6px ${scoreColor}40)` }}
                />
              </svg>
              <div className="absolute inset-[6px] flex items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent/5 ring-1 ring-accent/10">
                <span className="font-title text-[20px] font-bold text-accent">{initials}</span>
              </div>
            </div>

            <div className="sm:hidden">
              <h1 className="font-title text-[20px] font-bold text-text-primary">{lead.name}</h1>
              <div className="mt-1 flex items-center gap-1.5 text-[12px] text-text-muted">
                <Phone className="h-3 w-3" />
                {formatPhone(lead.phone)}
              </div>
            </div>
          </div>

          {/* Info section */}
          <div className="flex-1 space-y-3">
            <div className="hidden sm:block">
              <h1 className="font-title text-[22px] font-bold text-text-primary">{lead.name}</h1>
              <div className="mt-1 flex items-center gap-1.5 text-[13px] text-text-muted">
                <Phone className="h-3 w-3" />
                {formatPhone(lead.phone)}
              </div>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold"
                style={{ backgroundColor: `${temp.color}12`, color: temp.color }}
              >
                <temp.Icon className="h-3 w-3" />
                {temp.label}
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold"
                style={{ backgroundColor: `${estagio.color}10`, color: estagio.color }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: estagio.color }} />
                {estagio.label}
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-lg bg-[rgba(240,237,232,0.04)] px-2.5 py-1 text-[11px] font-medium"
                style={{ color: sent.color }}
              >
                <sent.Icon className="h-3 w-3" />
                {sent.label}
              </span>
              {lead.assigned_agent && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[rgba(240,237,232,0.04)] px-2.5 py-1 text-[11px] font-medium text-text-muted">
                  <User className="h-3 w-3" style={{ color: AGENT_COLORS[lead.assigned_agent] }} />
                  {lead.assigned_agent === 'hermes' ? 'Hermes' : lead.assigned_agent === 'ares' ? 'Ares' : 'Athena'}
                </span>
              )}
            </div>
          </div>

          {/* Score + total pago */}
          <div className="flex gap-6 border-t border-border-default pt-4 sm:border-0 sm:pt-0">
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">Score</p>
              <p className="mt-1 font-title text-[24px] font-bold leading-none sm:text-[28px]" style={{ color: scoreColor }}>{lead.score}</p>
            </div>
            <div className="h-10 w-px self-center bg-gradient-to-b from-transparent via-border-default to-transparent" />
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">Total pago</p>
              <p className="mt-1 font-title text-[24px] font-bold leading-none text-emerald sm:text-[28px]">
                {totalPago > 0 ? formatCurrency(totalPago) : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <LeadDetailTabs
        lead={lead}
        conversations={conversations}
        payments={payments}
        campaign={campaign}
        scoreColor={scoreColor}
      />
    </div>
  )
}
