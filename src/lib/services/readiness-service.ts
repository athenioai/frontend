import type { IReadinessService } from './interfaces/readiness-service'
import type { ReadinessResult } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class ReadinessService implements IReadinessService {
  async check(): Promise<ReadinessResult> {
    return apiClient<ReadinessResult>('/api/company/readiness')
  }
}
