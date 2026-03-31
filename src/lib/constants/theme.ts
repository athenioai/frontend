export const COLORS = {
  accent: '#4FD1C5',
  accentLight: '#6EE7D8',
  gold: '#E8C872',
  violet: '#A78BFA',
  emerald: '#34D399',
  bgBase: '#08090A',
  surface1: '#0F1114',
  surface2: '#161A1E',
  danger: '#F07070',
  dangerBg: 'rgba(240, 112, 112, 0.08)',
  warning: '#E8C872',
  success: '#34D399',
  textPrimary: '#F0EDE8',
  textMuted: 'rgba(240, 237, 232, 0.55)',
  textSubtle: 'rgba(240, 237, 232, 0.35)',
  border: 'rgba(240, 237, 232, 0.06)',
  borderHover: 'rgba(240, 237, 232, 0.12)',
} as const

export const CHART_COLORS = {
  primary: '#4FD1C5',
  secondary: '#34D399',
  tertiary: '#E8C872',
  violet: '#A78BFA',
  grid: 'rgba(240, 237, 232, 0.04)',
  tooltipBg: '#0F1114',
} as const

export const AGENT_COLORS = {
  hermes: '#4FD1C5',
  ares: '#E8C872',
  athena: '#A78BFA',
} as const

export const TEMPERATURA_COLORS = {
  frio: '#60A5FA',
  morno: '#E8C872',
  quente: '#F07070',
} as const

export const HEALTH_SCORE_COLORS = {
  good: '#34D399',
  warning: '#E8C872',
  danger: '#F07070',
} as const

export function getHealthScoreColor(score: number): string {
  if (score > 80) return HEALTH_SCORE_COLORS.good
  if (score >= 60) return HEALTH_SCORE_COLORS.warning
  return HEALTH_SCORE_COLORS.danger
}
