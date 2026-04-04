import { adminService } from '@/lib/services'
import { DLQTable } from '@/components/admin/dlq-table'
import { AlertTriangle } from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'

export default async function DLQPage() {
  const entries = await adminService.getDLQ()

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-danger/15 to-danger/5">
          <AlertTriangle className="h-[18px] w-[18px] text-danger" />
        </div>
        <div>
          <h1 className="font-title text-[22px] font-bold text-text-primary">
            Dead-Letter Queue
          </h1>
          <p className="text-[13px] text-text-muted">
            Eventos que falharam e podem ser reprocessados
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="DLQ vazia"
          description="Nenhum evento falho no momento. Tudo funcionando normalmente."
        />
      ) : (
        <DLQTable initialEntries={entries} />
      )}
    </div>
  )
}
