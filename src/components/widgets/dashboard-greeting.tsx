'use client'

import { useEffect, useState } from 'react'
import { AnimateIn } from '@/components/ui/animate-in'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function getFirstName(fullName: string): string {
  return fullName.split(' ')[0]
}

interface DashboardGreetingProps {
  userName: string
  healthScore: number
}

export function DashboardGreeting({ userName, healthScore }: DashboardGreetingProps) {
  const [greeting, setGreeting] = useState('Olá')

  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  const statusMessage =
    healthScore >= 80
      ? 'Seus agentes estão operando normalmente.'
      : healthScore >= 60
        ? 'Alguns indicadores precisam de atenção.'
        : 'Sua operação precisa de atenção imediata.'

  const statusColor =
    healthScore >= 80 ? 'text-emerald' : healthScore >= 60 ? 'text-gold' : 'text-danger'

  return (
    <AnimateIn>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-title text-[22px] font-bold text-text-primary">
            {greeting}, {getFirstName(userName)}
          </h1>
          <p className="mt-1 text-[13px] text-text-muted">
            <span className={statusColor}>&bull;</span>{' '}
            {statusMessage}
          </p>
        </div>
        <p className="hidden text-[12px] text-text-subtle sm:block">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>
    </AnimateIn>
  )
}
