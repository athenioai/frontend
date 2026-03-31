'use server'

import { authService, leadService } from '@/lib/services'
import type { FunilStats, Lead } from '@/lib/types'

export async function getFunilData(periodo: '1d' | '7d' | '30d'): Promise<{ stats: FunilStats; leads: Lead[] } | null> {
  const user = await authService.getSession()
  if (!user) return null

  const [stats, leads] = await Promise.all([
    leadService.getFunilStats(user.empresa_id, periodo),
    leadService.getAll(user.empresa_id),
  ])

  return { stats, leads }
}
