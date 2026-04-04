import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'
import type { ReadinessResult } from '@/lib/types'

interface ReadinessBannerProps {
  readiness: ReadinessResult
}

export function ReadinessBanner({ readiness }: ReadinessBannerProps) {
  if (readiness.ready) return null

  return (
    <div className="card-hero relative p-5 mb-8">
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-text-primary">Complete a configuração para ativar seus agentes</p>
            <p className="text-[12px] text-text-muted">Finalize o onboarding para que o sistema comece a operar</p>
          </div>
        </div>
        <Link
          href="/onboarding"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-accent px-5 text-[13px] font-semibold text-primary-foreground shadow-[0_0_24px_rgba(79,209,197,0.12)] transition-all hover:brightness-110 hover:shadow-[0_0_32px_rgba(79,209,197,0.18)]"
        >
          Continuar configuração
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
