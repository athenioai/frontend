'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { fadeInUp, MOTION } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default py-16 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2">
        <Icon className="h-6 w-6 text-text-subtle" />
      </div>
      <h3 className="font-title text-[16px] font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] text-text-muted">{description}</p>
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-5">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-accent px-5 text-[13px] font-semibold text-primary-foreground transition-all hover:brightness-110"
            >
              {actionLabel}
            </Link>
          ) : (
            <Button onClick={onAction} className="h-10 rounded-xl bg-accent px-5 text-[13px] font-semibold text-primary-foreground hover:brightness-110">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}
