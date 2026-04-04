import type { IHealthService } from './interfaces/health-service'
import type { SystemHealth } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class HealthService implements IHealthService {
  async check(): Promise<SystemHealth> {
    return apiClient<SystemHealth>('/health')
  }
}
