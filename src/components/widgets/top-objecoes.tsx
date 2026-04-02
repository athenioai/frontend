'use client'

import { AnimateIn } from '@/components/ui/animate-in'
import { COLORS } from '@/lib/constants/theme'
import type { ObjectionCount } from '@/lib/types'

const RANK_COLORS = [COLORS.accent, COLORS.emerald, COLORS.gold, COLORS.violet, COLORS.textMuted]

export function TopObjecoesWidget({ data }: { data: ObjectionCount[] }) {
  const max = data[0]?.count || 1

  return (
    <AnimateIn>
      <div className="card-surface h-full p-6">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          Top Objeções
        </p>

        <div className="space-y-3">
          {data.slice(0, 5).map((item, i) => {
            const percentage = (item.count / max) * 100
            const color = RANK_COLORS[i] || COLORS.textMuted

            return (
              <div key={item.objection} className="group">
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[13px] text-text-muted group-hover:text-text-primary transition-colors">
                      {item.objection}
                    </span>
                  </div>
                  <span className="text-[13px] font-semibold text-text-primary">{item.count}</span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(240,237,232,0.04)]">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${percentage}%`,
                      background: `linear-gradient(90deg, ${color}, ${color}50)`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AnimateIn>
  )
}
