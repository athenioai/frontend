'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/format'
import type { LeadPublic } from '@/lib/services/interfaces/lead-service'

interface LeadCardProps {
  lead: LeadPublic
}

export function LeadCard({ lead }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id, data: { lead } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative rounded-xl border border-border-default bg-surface-1 p-3.5 transition-all duration-150',
        'hover:border-border-hover hover:shadow-[0_2px_8px_rgba(28,27,24,0.06)]',
        'cursor-grab active:cursor-grabbing',
        isDragging && 'z-50 rotate-[2deg] scale-[1.02] shadow-[0_8px_32px_rgba(28,27,24,0.12)] border-accent/30',
      )}
    >
      <Link
        href={`/crm/${lead.id}`}
        className="absolute inset-0 z-10 rounded-xl"
        onClick={(e) => {
          if (isDragging) e.preventDefault()
        }}
        draggable={false}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-text-primary">
            {lead.name}
          </p>
        </div>
        <span className="shrink-0 text-[11px] text-text-subtle">
          {formatRelativeTime(lead.updated_at)}
        </span>
      </div>

      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-1.5">
          <Mail className="h-3 w-3 shrink-0 text-text-subtle" />
          <span className="truncate text-[12px] text-text-muted">{lead.email}</span>
        </div>
        {lead.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3 shrink-0 text-text-subtle" />
            <span className="truncate text-[12px] text-text-muted">{lead.phone}</span>
          </div>
        )}
      </div>
    </div>
  )
}
