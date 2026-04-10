'use client'

import { useState, useMemo, useTransition } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { motion } from 'motion/react'
import { Plus, Sparkles, Phone, MessageSquare, Trophy, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOTION } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { LeadBoard, LeadPublic, LeadStatus } from '@/lib/services/interfaces/lead-service'
import { LeadCard } from './lead-card'
import { CreateLeadDialog } from './create-lead-dialog'
import { updateLeadStatus } from '../actions'

const COLUMNS: {
  id: LeadStatus
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgAccent: string
}[] = [
  {
    id: 'new',
    label: 'Novos',
    icon: Sparkles,
    color: 'text-teal',
    bgAccent: 'bg-teal/[0.08]',
  },
  {
    id: 'contacted',
    label: 'Contactados',
    icon: Phone,
    color: 'text-amber',
    bgAccent: 'bg-amber/[0.08]',
  },
  {
    id: 'qualified',
    label: 'Qualificados',
    icon: MessageSquare,
    color: 'text-violet',
    bgAccent: 'bg-violet/[0.08]',
  },
  {
    id: 'converted',
    label: 'Convertidos',
    icon: Trophy,
    color: 'text-emerald',
    bgAccent: 'bg-emerald/[0.08]',
  },
  {
    id: 'lost',
    label: 'Perdidos',
    icon: XCircle,
    color: 'text-danger',
    bgAccent: 'bg-danger/[0.06]',
  },
]

interface CrmBoardProps {
  initialBoard: LeadBoard
}

export function CrmBoard({ initialBoard }: CrmBoardProps) {
  const [board, setBoard] = useState<LeadBoard>(initialBoard)
  const [activeLead, setActiveLead] = useState<LeadPublic | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const totalLeads = useMemo(
    () =>
      board.new.length +
      board.contacted.length +
      board.qualified.length +
      board.converted.length +
      board.lost.length,
    [board],
  )

  function handleDragStart(event: DragStartEvent) {
    const lead = event.active.data.current?.lead as LeadPublic | undefined
    if (lead) setActiveLead(lead)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveLead(null)
    const { active, over } = event
    if (!over) return

    const lead = active.data.current?.lead as LeadPublic | undefined
    if (!lead) return

    const targetColumn = over.id as LeadStatus
    if (!COLUMNS.some((c) => c.id === targetColumn)) return
    if (lead.status === targetColumn) return

    const oldStatus = lead.status
    setBoard((prev) => {
      const next = { ...prev }
      next[oldStatus] = prev[oldStatus].filter((l) => l.id !== lead.id)
      const updatedLead = { ...lead, status: targetColumn, updated_at: new Date().toISOString() }
      next[targetColumn] = [updatedLead, ...prev[targetColumn]]
      return next
    })

    startTransition(async () => {
      const result = await updateLeadStatus(lead.id, targetColumn)
      if (!result.success) {
        setBoard((prev) => {
          const next = { ...prev }
          next[targetColumn] = prev[targetColumn].filter((l) => l.id !== lead.id)
          next[oldStatus] = [lead, ...prev[oldStatus]]
          return next
        })
        toast.error(result.error ?? 'Erro ao mover lead.')
      }
    })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 lg:px-8">
        <div>
          <h1 className="text-2xl text-text-primary">CRM</h1>
          <p className="mt-0.5 text-[13px] text-text-subtle">
            {totalLeads} {totalLeads === 1 ? 'lead' : 'leads'} no pipeline
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" data-icon="inline-start" />
          Novo Lead
        </Button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-6 lg:px-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full gap-4" style={{ minWidth: COLUMNS.length * 272 }}>
            {COLUMNS.map((col, idx) => (
              <KanbanColumn
                key={col.id}
                column={col}
                leads={board[col.id]}
                index={idx}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
            {activeLead ? (
              <div className="w-[260px] rotate-[3deg] scale-[1.03]">
                <LeadCard lead={activeLead} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <CreateLeadDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}

function KanbanColumn({
  column,
  leads,
  index,
}: {
  column: (typeof COLUMNS)[number]
  leads: LeadPublic[]
  index: number
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const Icon = column.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: MOTION.duration.normal,
        delay: index * 0.06,
        ease: MOTION.ease.out,
      }}
      ref={setNodeRef}
      className={cn(
        'flex h-full min-w-[260px] flex-1 flex-col rounded-2xl border border-border-default bg-surface-2/50 transition-colors duration-200',
        isOver && 'border-accent/40 bg-accent/[0.03]',
      )}
    >
      {/* Column header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', column.bgAccent)}>
          <Icon className={cn('h-3.5 w-3.5', column.color)} />
        </div>
        <span className="text-[13px] font-semibold text-text-primary">
          {column.label}
        </span>
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-1 px-1.5 text-[11px] font-medium text-text-muted">
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        <SortableContext
          items={leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.length === 0 ? (
            <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-border-default/60">
              <p className="text-[12px] text-text-subtle">Nenhum lead</p>
            </div>
          ) : (
            leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
          )}
        </SortableContext>
      </div>
    </motion.div>
  )
}
