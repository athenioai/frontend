import { SkeletonBlock } from '@/components/ui/skeleton-block'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Row 1: Hero + Health */}
      <div className="grid gap-6 grid-cols-12">
        <div className="col-span-12 lg:col-span-8 card-surface p-8">
          <SkeletonBlock className="mx-auto mb-4 h-4 w-48" />
          <SkeletonBlock className="mx-auto mb-4 h-14 w-32" />
          <SkeletonBlock className="mx-auto h-4 w-64" />
        </div>
        <div className="col-span-12 lg:col-span-4 card-elevated p-6">
          <SkeletonBlock className="mx-auto mb-4 h-4 w-32" />
          <SkeletonBlock className="mx-auto mb-4 h-24 w-24 !rounded-full" />
          <div className="grid grid-cols-3 gap-3">
            <SkeletonBlock className="h-12" />
            <SkeletonBlock className="h-12" />
            <SkeletonBlock className="h-12" />
          </div>
        </div>
      </div>

      {/* Row 2: KPI Strip */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-surface p-5">
            <SkeletonBlock className="mb-3 h-3 w-20" />
            <SkeletonBlock className="mb-2 h-8 w-24" />
            <SkeletonBlock className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Row 3: Funil + Objecoes */}
      <div className="grid gap-6 grid-cols-12">
        <div className="col-span-12 lg:col-span-8 card-surface p-6">
          <SkeletonBlock className="mb-4 h-4 w-36" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-10" />
            ))}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 card-surface p-6">
          <SkeletonBlock className="mb-4 h-4 w-40" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-6" />
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Agents */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card-surface p-5">
            <SkeletonBlock className="mb-4 h-5 w-32" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <SkeletonBlock key={j} className="h-4" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Row 5: Alertas */}
      <div className="card-surface p-6">
        <SkeletonBlock className="mb-4 h-4 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonBlock className="h-7 w-7 !rounded-full shrink-0" />
              <SkeletonBlock className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
