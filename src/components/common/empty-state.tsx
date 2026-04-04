'use client'

import { motion } from 'motion/react'
import { fadeInUp, MOTION } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default/60 py-16 px-6 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2/60">
        <Icon className="h-6 w-6 text-text-subtle" />
      </div>
      <h3 className="mb-1 font-title text-[16px] font-bold text-text-primary">{title}</h3>
      <p className="mb-6 max-w-sm text-[13px] text-text-muted">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild className="h-9 rounded-xl bg-accent px-5 text-[13px] font-semibold text-primary-foreground hover:brightness-110">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </motion.div>
  )
}
