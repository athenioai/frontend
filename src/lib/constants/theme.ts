export const COLORS = {
  accent: '#4FD1C5',
  accentLight: '#81E6D9',
  amber: '#FBBF24',
  violet: '#A78BFA',
  bgBase: '#090F0F',
  surface1: '#111919',
  surface2: '#162020',
  danger: '#E07070',
  dangerBg: 'rgba(224, 112, 112, 0.12)',
  warning: '#FBBF24',
  success: '#4FD1C5',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textSubtle: 'rgba(255, 255, 255, 0.4)',
  border: 'rgba(79, 209, 197, 0.08)',
  borderHover: 'rgba(79, 209, 197, 0.20)',
} as const

export const CHART_COLORS = {
  primary: '#4FD1C5',
  secondary: '#81E6D9',
  tertiary: '#0F3D3E',
  amber: '#FBBF24',
  violet: '#A78BFA',
  grid: 'rgba(255, 255, 255, 0.05)',
  tooltipBg: '#111919',
} as const

export const AGENT_COLORS = {
  hermes: '#4FD1C5',
  ares: '#FBBF24',
  athena: '#A78BFA',
} as const

export const TEMPERATURA_COLORS = {
  frio: '#60A5FA',
  morno: '#F6E05E',
  quente: '#E07070',
} as const

export const HEALTH_SCORE_COLORS = {
  good: '#4FD1C5',
  warning: '#F6E05E',
  danger: '#E07070',
} as const

export function getHealthScoreColor(score: number): string {
  if (score > 80) return HEALTH_SCORE_COLORS.good
  if (score >= 60) return HEALTH_SCORE_COLORS.warning
  return HEALTH_SCORE_COLORS.danger
}
