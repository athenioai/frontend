'use client'

import { motion } from 'motion/react'
import { CheckCircle2, XCircle, Rocket, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ReadinessCheck } from '@/lib/types'

const CLIENT_CHECKS = ['company_profile', 'products', 'knowledge_base'] as const

const CHECK_LABELS: Record<string, string> = {
  company_profile: 'Perfil da Empresa',
  products: 'Produtos Cadastrados',
  knowledge_base: 'Knowledge Base',
}

const CHECK_STEP_MAP: Record<string, number> = {
  company_profile: 1,
  products: 2,
  knowledge_base: 3,
}

interface ReadinessChecklistProps {
  checks: ReadinessCheck[]
  isLoading?: boolean
  onGoToDashboard: () => void
  onGoToStep?: (step: number) => void
}

export function ReadinessChecklist({ checks, isLoading, onGoToDashboard, onGoToStep }: ReadinessChecklistProps) {
  const clientChecks = checks.filter((c) => (CLIENT_CHECKS as readonly string[]).includes(c.name))
  const allReady = clientChecks.every((c) => c.ready)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {clientChecks.map((check, i) => (
          <motion.div
            key={check.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-surface flex items-center gap-4 p-4"
          >
            <motion.div
              initial={false}
              animate={{ scale: check.ready ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              {check.ready ? (
                <CheckCircle2 className="h-6 w-6 text-success shrink-0" />
              ) : (
                <XCircle className="h-6 w-6 text-danger shrink-0" />
              )}
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-text-primary">
                {CHECK_LABELS[check.name] ?? check.name}
              </p>
              <p className="text-[12px] text-text-subtle">{check.detail}</p>
            </div>
            {!check.ready && onGoToStep && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onGoToStep(CHECK_STEP_MAP[check.name] ?? 1)}
                className="shrink-0 text-[12px] text-accent"
              >
                Resolver
              </Button>
            )}
          </motion.div>
        ))}
      </div>

      {allReady && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-hero p-6 text-center"
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10">
            <Rocket className="h-7 w-7 text-success" />
          </div>
          <h3 className="font-title text-[18px] font-bold text-text-primary">Sistema pronto!</h3>
          <p className="mt-1 text-[13px] text-text-muted">
            Tudo configurado. Seus agentes de IA estão prontos para operar.
          </p>
          <Button
            onClick={onGoToDashboard}
            className="mt-4 h-11 rounded-xl bg-accent px-8 text-[14px] font-semibold text-primary-foreground shadow-[0_0_24px_rgba(79,209,197,0.12)] hover:brightness-110 hover:shadow-[0_0_32px_rgba(79,209,197,0.18)]"
          >
            Ir para o Dashboard
          </Button>
        </motion.div>
      )}
    </div>
  )
}
