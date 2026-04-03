import { AlertTriangle } from 'lucide-react'

interface HealthBannerProps {
  score: number
  alertReason?: string
  recommendedAction?: string
}

export function HealthBanner({ score, alertReason, recommendedAction }: HealthBannerProps) {
  if (score >= 60) return null

  return (
    <div className="border-b border-danger/20 bg-danger-bg px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
        <div>
          <p className="text-sm font-semibold text-danger">
            Health Score em {score} — sua operação precisa de atenção
          </p>
          {alertReason && <p className="mt-1 text-xs text-text-muted">{alertReason}</p>}
          {recommendedAction && <p className="mt-0.5 text-xs text-accent">{recommendedAction}</p>}
        </div>
      </div>
    </div>
  )
}
