import type { IAlertService } from './interfaces/alert-service'
import type { Alert } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class AlertService implements IAlertService {
  async getRecent(_companyId: string, limit = 20): Promise<Alert[]> {
    return apiClient<Alert[]>(`/alerts?limit=${limit}`)
  }
}
