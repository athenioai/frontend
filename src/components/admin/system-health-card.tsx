'use client'

import { AnimateIn } from '@/components/ui/animate-in'
import type { SystemHealth } from '@/lib/types'

const SERVICES: { key: keyof SystemHealth; label: string }[] = [
  { key: 'supabase', label: 'Supabase' },
  { key: 'redis', label: 'Redis' },
  { key: 'kairos', label: 'Kairos' },
  { key: 'ares', label: 'Ares' },
  { key: 'whatsapp', label: 'WhatsApp' },
]

export function SystemHealthCard({ health }: { health: SystemHealth }) {
  return (
    <AnimateIn>
      <div className="card-hero p-6">
        <p className="mb-4 font-title text-[15px] font-bold text-text-primary">
          Saude do Sistema
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {SERVICES.map(({ key, label }) => {
            const up = health[key]
            return (
              <div
                key={key}
                className="flex items-center gap-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] p-3 transition-colors hover:bg-[rgba(255,255,255,0.06)]"
              >
                <span className="relative flex h-3 w-3">
                  {up && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex h-3 w-3 rounded-full ${
                      up ? 'bg-emerald' : 'bg-danger'
                    }`}
                  />
                </span>
                <span className="text-[13px] text-text-muted">{label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </AnimateIn>
  )
}
