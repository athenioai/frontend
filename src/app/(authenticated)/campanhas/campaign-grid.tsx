'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { LineChartSimple } from '@/components/charts/line-chart-simple'
import { formatCurrency } from '@/lib/utils/format'
import type { Campaign, CampaignPerformance } from '@/lib/types'

export function CampaignGrid({ campaigns }: { campaigns: Campaign[] }) {
  const [selected, setSelected] = useState<Campaign | null>(null)
  const [perfData, setPerfData] = useState<CampaignPerformance[]>([])

  const sorted = [...campaigns].sort((a, b) => {
    if (a.status === 'ativa' && b.status !== 'ativa') return -1
    if (a.status !== 'ativa' && b.status === 'ativa') return 1
    return 0
  })

  async function openDrawer(campaign: Campaign) {
    setSelected(campaign)
    const res = await fetch(`/api/campanhas/${campaign.id}/performance`)
    const data = await res.json()
    setPerfData(data)
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((c) => (
          <div
            key={c.id}
            onClick={() => openDrawer(c)}
            className={`glass-card glass-card-interactive cursor-pointer ${
              c.status === 'pausada' ? 'opacity-60' : ''
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-title text-sm font-bold">{c.nome}</span>
              <Badge
                variant="outline"
                className={c.status === 'ativa' ? 'border-accent text-accent' : 'border-text-subtle text-text-subtle'}
              >
                {c.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div>
                <p className="text-xs text-text-subtle">Gasto</p>
                <p className="font-medium">{formatCurrency(c.gasto_total)}</p>
              </div>
              <div>
                <p className="text-xs text-text-subtle">CPL</p>
                <p className="font-medium">{formatCurrency(c.cpl)}</p>
              </div>
              <div>
                <p className="text-xs text-text-subtle">ROAS</p>
                <p className="font-medium text-accent">{c.roas.toFixed(1)}x</p>
              </div>
              <div>
                <p className="text-xs text-text-subtle">Leads / Vendas</p>
                <p className="font-medium">{c.leads_gerados} / {c.vendas_confirmadas}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full border-border-default bg-bg-base sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="font-title text-text-primary">
              {selected?.nome}
            </SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <p className="text-xs text-text-subtle">ROAS</p>
                  <p className="font-title text-2xl font-bold text-accent">{selected.roas.toFixed(1)}x</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-text-subtle">Gasto Total</p>
                  <p className="font-title text-2xl font-bold">{formatCurrency(selected.gasto_total)}</p>
                </div>
              </div>
              {perfData.length > 0 && (
                <div>
                  <p className="mb-2 text-sm text-text-muted">Performance ao longo do tempo</p>
                  <LineChartSimple
                    data={perfData.map((d) => ({ ...d, data: d.data.slice(5) }))}
                    xKey="data"
                    yKey="roas"
                    height={220}
                  />
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
