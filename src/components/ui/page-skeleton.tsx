export function PageSkeleton({ title }: { title: string }) {
  return (
    <div className="animate-pulse p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-title text-2xl font-bold text-text-primary">{title}</h1>
      </div>
      <div className="space-y-4">
        <div className="h-32 rounded-xl bg-surface-2" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-24 rounded-xl bg-surface-2" />
          <div className="h-24 rounded-xl bg-surface-2" />
          <div className="h-24 rounded-xl bg-surface-2" />
        </div>
        <div className="h-64 rounded-xl bg-surface-2" />
      </div>
    </div>
  )
}

const KANBAN_COLUMNS = [
  { label: 'Novos', color: 'bg-teal/[0.08]', dot: 'bg-teal', cards: 3 },
  { label: 'Contactados', color: 'bg-amber/[0.08]', dot: 'bg-amber', cards: 2 },
  { label: 'Qualificados', color: 'bg-violet/[0.08]', dot: 'bg-violet', cards: 2 },
  { label: 'Convertidos', color: 'bg-emerald/[0.08]', dot: 'bg-emerald', cards: 1 },
  { label: 'Perdidos', color: 'bg-danger/[0.06]', dot: 'bg-danger', cards: 1 },
]

export function KanbanSkeleton() {
  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-title text-2xl font-bold text-text-primary">CRM</h1>
        <div className="h-9 w-28 animate-pulse rounded-xl bg-surface-2" />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => (
          <div key={col.label} className="w-72 shrink-0">
            <div className="mb-3 flex items-center gap-2 px-1">
              <div className={`h-2 w-2 rounded-full ${col.dot}`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
                {col.label}
              </span>
              <span className="ml-auto text-[10px] text-text-subtle/50">--</span>
            </div>
            <div className="space-y-2.5">
              {Array.from({ length: col.cards }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-border-default bg-surface-2 p-4"
                >
                  <div className="h-3.5 w-2/3 rounded bg-surface-1/50" />
                  <div className="mt-2.5 h-2.5 w-1/2 rounded bg-surface-1/30" />
                  <div className="mt-3 flex gap-2">
                    <div className="h-5 w-14 rounded-full bg-surface-1/20" />
                    <div className="h-5 w-10 rounded-full bg-surface-1/20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChatSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-pulse text-sm text-text-subtle">Carregando conversa...</div>
    </div>
  )
}
