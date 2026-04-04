import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type BadgeColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange' | 'purple'

const COLOR_CLASSES: Record<BadgeColor, string> = {
  green: 'border-emerald/30 bg-emerald/10 text-emerald',
  yellow: 'border-gold/30 bg-gold/10 text-gold',
  red: 'border-danger/30 bg-danger/10 text-danger',
  blue: 'border-accent/30 bg-accent/10 text-accent',
  gray: 'border-border-default bg-surface-2 text-text-muted',
  orange: 'border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]',
  purple: 'border-violet/30 bg-violet/10 text-violet',
}

interface StatusBadgeProps {
  status: string
  colorMap?: Record<string, BadgeColor>
  className?: string
}

export function StatusBadge({ status, colorMap, className }: StatusBadgeProps) {
  const color = colorMap?.[status] ?? 'gray'
  return (
    <Badge variant="outline" className={cn(COLOR_CLASSES[color], className)}>
      {status}
    </Badge>
  )
}

export const FUNNEL_COLORS: Record<string, BadgeColor> = {
  greeting: 'gray',
  captured: 'gray',
  qualifying: 'blue',
  qualified: 'blue',
  consulting: 'purple',
  negotiation: 'orange',
  negotiating: 'orange',
  closing: 'yellow',
  converted: 'green',
  lost: 'red',
}

export const TEMPERATURE_COLORS: Record<string, BadgeColor> = {
  cold: 'blue',
  warm: 'yellow',
  hot: 'red',
}

export const CAMPAIGN_STATUS_COLORS: Record<string, BadgeColor> = {
  active: 'green',
  paused: 'yellow',
  killed: 'red',
  scaling: 'blue',
}

export const DECISION_TYPE_COLORS: Record<string, BadgeColor> = {
  scale_budget: 'green',
  pause_campaigns: 'yellow',
  reduce_bids: 'orange',
  whale_detected: 'blue',
  handoff: 'purple',
  cycle_summary: 'gray',
  tenant_config_invalid: 'red',
  reflection_failed: 'red',
}
