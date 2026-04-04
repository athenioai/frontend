import type { ReadinessResult } from '@/lib/types'

export interface IReadinessService {
  check(): Promise<ReadinessResult>
}
