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

export function KanbanSkeleton() {
  return (
    <div className="animate-pulse p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-title text-2xl font-bold text-text-primary">CRM</h1>
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-72 shrink-0 space-y-3">
            <div className="h-8 w-24 rounded-lg bg-surface-2" />
            <div className="h-28 rounded-xl bg-surface-2" />
            <div className="h-28 rounded-xl bg-surface-2" />
            <div className="h-28 rounded-xl bg-surface-2" />
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
