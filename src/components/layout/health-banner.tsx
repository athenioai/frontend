import { AlertTriangle } from 'lucide-react'

interface HealthBannerProps {
  score: number
  motivo?: string
  acao?: string
}

export function HealthBanner({ score, motivo, acao }: HealthBannerProps) {
  if (score >= 60) return null

  return (
    <div className="border-b border-danger/20 bg-danger-bg px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
        <div>
          <p className="text-sm font-semibold text-danger">
            Health Score em {score} — sua operação precisa de atenção
          </p>
          {motivo && <p className="mt-1 text-xs text-text-muted">{motivo}</p>}
          {acao && <p className="mt-0.5 text-xs text-accent">{acao}</p>}
        </div>
      </div>
    </div>
  )
}
