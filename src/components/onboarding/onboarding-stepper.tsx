'use client'

import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { MOTION } from '@/lib/motion'

const STEPS = [
  { number: 1, label: 'Perfil da Empresa' },
  { number: 2, label: 'Produtos' },
  { number: 3, label: 'Knowledge Base' },
  { number: 4, label: 'Checklist' },
]

interface OnboardingStepperProps {
  currentStep: number
  onStepClick: (step: number) => void
}

export function OnboardingStepper({ currentStep, onStepClick }: OnboardingStepperProps) {
  return (
    <nav className="flex items-center justify-center gap-0" aria-label="Progresso do onboarding">
      {STEPS.map((step, i) => {
        const status = step.number < currentStep
          ? 'completed'
          : step.number === currentStep
            ? 'current'
            : 'upcoming'

        const canClick = step.number <= currentStep

        return (
          <div key={step.number} className="flex items-center">
            {i > 0 && (
              <div className="relative mx-2 h-[2px] w-12 sm:w-20 bg-border-default overflow-hidden rounded-full">
                {step.number <= currentStep && (
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
                  />
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => canClick && onStepClick(step.number)}
              disabled={!canClick}
              className="flex flex-col items-center gap-1.5 disabled:cursor-default"
              aria-current={status === 'current' ? 'step' : undefined}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold transition-all duration-300 ${
                  status === 'completed'
                    ? 'bg-accent text-primary-foreground shadow-[0_0_16px_rgba(79,209,197,0.25)]'
                    : status === 'current'
                      ? 'border-2 border-accent text-accent shadow-[0_0_16px_rgba(79,209,197,0.15)]'
                      : 'border border-border-default text-text-subtle'
                }`}
              >
                {status === 'completed' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-[11px] font-medium whitespace-nowrap transition-colors duration-200 ${
                  status === 'upcoming' ? 'text-text-subtle' : 'text-text-muted'
                }`}
              >
                {step.label}
              </span>
            </button>
          </div>
        )
      })}
    </nav>
  )
}
