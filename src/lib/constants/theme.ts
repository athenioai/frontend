export const COLORS = {
  accent: '#4FD1C5',
  accentLight: '#81E6D9',
  bgBase: '#070C0C',
  bgElevated: 'rgba(15, 61, 62, 0.2)',
  danger: '#E07070',
  dangerBg: 'rgba(161, 92, 92, 0.15)',
  warning: '#F6E05E',
  success: '#4FD1C5',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textSubtle: 'rgba(255, 255, 255, 0.4)',
  border: 'rgba(79, 209, 197, 0.15)',
  borderStrong: 'rgba(79, 209, 197, 0.3)',
  gridSubtle: 'rgba(255, 255, 255, 0.05)',
} as const

export const CHART_COLORS = {
  primary: '#4FD1C5',
  secondary: '#81E6D9',
  tertiary: '#0F3D3E',
  grid: 'rgba(255, 255, 255, 0.05)',
  tooltipBg: '#0C1818',
} as const

export const ALERT_ICONS: Record<string, string> = {
  venda: 'DollarSign',
  campanha_pausada: 'Pause',
  campanha_escalada: 'TrendingUp',
  baleia: 'Star',
  humano_solicitado: 'User',
  anomalia: 'Shield',
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
