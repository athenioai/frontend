'use client'

import { motion } from 'motion/react'
import { MessagesSquare, CalendarCheck, TrendingUp, ArrowRight } from 'lucide-react'
import { MOTION, fadeInUp, staggerContainer } from '@/lib/motion'
import Link from 'next/link'

const QUICK_LINKS = [
  {
    href: '/conversas',
    label: 'Conversas',
    description: 'Veja o historico de chats entre leads e seus agentes',
    icon: MessagesSquare,
    accent: 'from-accent/20 to-accent/5',
    iconColor: 'text-accent',
    ring: 'ring-accent/15',
    hoverBorder: 'hover:border-accent/20',
  },
  {
    href: '/dashboard',
    label: 'Agendamentos',
    description: 'Consultas e reunioes agendadas pelos agentes',
    icon: CalendarCheck,
    accent: 'from-emerald/20 to-emerald/5',
    iconColor: 'text-emerald',
    ring: 'ring-emerald/15',
    hoverBorder: 'hover:border-emerald/20',
  },
  {
    href: '/dashboard',
    label: 'Performance',
    description: 'Metricas de conversao e eficiencia dos agentes',
    icon: TrendingUp,
    accent: 'from-gold/20 to-gold/5',
    iconColor: 'text-gold',
    ring: 'ring-gold/15',
    hoverBorder: 'hover:border-gold/20',
  },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function DashboardPage() {
  const greeting = getGreeting()

  return (
    <div className="px-6 py-8 lg:py-10">
      {/* Hero */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
        >
          <p className="text-sm font-medium text-accent">{greeting}</p>
          <h1 className="mt-1 font-title text-3xl font-bold tracking-tight text-text-primary">
            Painel de controle
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Acompanhe a operacao dos seus agentes de IA em tempo real.
          </p>
        </motion.div>

        {/* Stats overview */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
          className="mt-10 grid gap-4 sm:grid-cols-3"
        >
          {[
            { label: 'Conversas hoje', value: '--', color: 'text-accent' },
            { label: 'Agendamentos', value: '--', color: 'text-emerald' },
            { label: 'Taxa conversao', value: '--', color: 'text-gold' },
          ].map((stat) => (
            <div key={stat.label} className="card-surface p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                {stat.label}
              </p>
              <p
                className={`mt-2 font-title text-2xl font-bold ${stat.color}`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Quick links */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
          className="mt-10"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
            Acesso rapido
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`card-surface card-surface-interactive group flex flex-col p-5 transition-all duration-200 ${link.hoverBorder}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${link.accent} ring-1 ${link.ring}`}
                >
                  <link.icon className={`h-5 w-5 ${link.iconColor}`} />
                </div>

                <p className="mt-4 font-title text-sm font-semibold text-text-primary">
                  {link.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-text-muted">
                  {link.description}
                </p>

                <div className="mt-auto flex items-center gap-1 pt-4 text-[11px] font-medium text-text-subtle transition-colors group-hover:text-text-muted">
                  Acessar
                  <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
