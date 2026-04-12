export default function ConfiguracoesLoading() {
  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:py-10">
      <div className="animate-pulse">
        <div className="h-7 w-40 rounded-lg bg-surface-2" />
        <div className="mt-2 h-4 w-72 rounded-md bg-surface-2" />

        <div className="mt-8 flex flex-col gap-6 lg:flex-row">
          {/* Sidebar tabs */}
          <nav className="flex shrink-0 gap-2 lg:w-56 lg:flex-col">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 rounded-xl bg-surface-2" />
            ))}
          </nav>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-4">
            <div className="h-24 rounded-2xl bg-surface-2" />
            <div className="h-24 rounded-2xl bg-surface-2" />
            <div className="h-24 rounded-2xl bg-surface-2" />
          </div>
        </div>
      </div>
    </div>
  )
}
