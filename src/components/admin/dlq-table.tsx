'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { clientApi } from '@/lib/api/client-api'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils/format'
import { ChevronDown, RotateCcw } from 'lucide-react'
import type { DLQEntry } from '@/lib/types'

interface DLQTableProps {
  initialEntries: DLQEntry[]
}

export function DLQTable({ initialEntries }: DLQTableProps) {
  const [entries, setEntries] = useState(initialEntries)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [replayTarget, setReplayTarget] = useState<DLQEntry | null>(null)
  const [replaying, setReplaying] = useState(false)

  const handleReplay = useCallback(async () => {
    if (!replayTarget) return
    setReplaying(true)
    try {
      await clientApi(`/admin/dlq/${replayTarget.id}/replay`, { method: 'POST' })
      toast.success('Evento reprocessado com sucesso')
      setEntries((prev) => prev.filter((e) => e.id !== replayTarget.id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao reprocessar evento')
    } finally {
      setReplaying(false)
      setReplayTarget(null)
    }
  }, [replayTarget])

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  return (
    <>
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default bg-surface-2/50">
                <th className="w-8 px-2 py-3" />
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Erro
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const isExpanded = expandedId === entry.id
                return (
                  <AnimatePresence key={entry.id}>
                    <tr
                      className="border-b border-border-default/50 cursor-pointer transition-colors hover:bg-accent/5"
                      onClick={() => toggleExpand(entry.id)}
                    >
                      <td className="px-2 py-3 text-center">
                        <motion.span
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="inline-block"
                        >
                          <ChevronDown className="h-4 w-4 text-text-subtle" />
                        </motion.span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] text-text-muted">
                        {entry.id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {entry.job_type}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {formatDate(entry.created_at)}
                      </td>
                      <td className="px-4 py-3 text-text-muted" title={entry.error}>
                        {entry.error.length > 60
                          ? `${entry.error.slice(0, 60)}...`
                          : entry.error}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setReplayTarget(entry)
                          }}
                          className="text-[12px]"
                        >
                          <RotateCcw className="mr-1 h-3 w-3" />
                          Reprocessar
                        </Button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td colSpan={6} className="px-4 py-4">
                          <div className="rounded-lg bg-surface-2 p-4">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
                              Payload
                            </p>
                            <pre className="overflow-auto rounded-lg bg-[rgba(0,0,0,0.2)] p-4 font-mono text-[12px] text-text-muted leading-relaxed">
                              {JSON.stringify(entry.data, null, 2)}
                            </pre>
                            <p className="mt-3 mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
                              Erro completo
                            </p>
                            <p className="text-[13px] text-danger">{entry.error}</p>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!replayTarget}
        onOpenChange={(open) => {
          if (!open) setReplayTarget(null)
        }}
        title="Reprocessar evento"
        message="Tem certeza que deseja reprocessar este evento?"
        confirmLabel="Reprocessar"
        variant="default"
        onConfirm={handleReplay}
        loading={replaying}
      />
    </>
  )
}
