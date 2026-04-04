import type { SystemHealth } from '@/lib/types'

export interface IHealthService {
  check(): Promise<SystemHealth>
}
