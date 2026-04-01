'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { MOTION } from '@/lib/motion'

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setGreeting(getGreeting())
    requestAnimationFrame(() => setMounted(true))
  }, [])

  const statusMessage =
    healthScore >= 80
      ? 'Todos os agentes operando normalmente'
      : healthScore >= 60
        ? 'Alguns indicadores precisam de atenção'
        : 'Operação precisa de atenção imediata'

  const statusColor =
    healthScore >= 80 ? '#34D399' : healthScore >= 60 ? '#E8C872' : '#F07070'

  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <motion.h1
          initial={mounted ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
          className="font-title text-[26px] font-bold text-text-primary"
        >
          {greeting},{' '}
          <span className="text-accent">{getFirstName(userName)}</span>
        </motion.h1>
        <motion.div
          initial={mounted ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out, delay: 0.08 }}
          className="mt-1.5 flex items-center gap-2"
        >
          <span
            className="flex h-2 w-2 rounded-full"
            style={{
              backgroundColor: statusColor,
              boxShadow: `0 0 6px ${statusColor}50`,
            }}
          />
          <span className="text-[13px] text-text-muted">{statusMessage}</span>
        </motion.div>
      </div>

      <motion.p
        initial={mounted ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out, delay: 0.15 }}
        className="hidden text-right text-[12px] leading-relaxed text-text-subtle sm:block"
      >
        {new Date().toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </motion.p>
    </div>
  )
}
