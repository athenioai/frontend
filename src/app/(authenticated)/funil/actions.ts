'use server'

import { authService, leadService } from '@/lib/services'
import type { FunnelStats, Lead } from '@/lib/types'

export async function getFunilData(periodo: '1d' | '7d' | '30d'): Promise<{ stats: FunnelStats; leads: Lead[] } | null> {
  const user = await authService.getSession()
  if (!user) return null

  const [stats, leads] = await Promise.all([
    leadService.getFunnelStats(user.company_id, periodo),
    leadService.getAll(user.company_id),
  ])

  return { stats, leads }
}
