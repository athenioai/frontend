import type { IAlertService } from '../interfaces/alert-service'
import type { Alert } from '@/lib/types'
import { mockAlerts } from './data'

export class MockAlertService implements IAlertService {
  async getRecent(empresaId: string, limit = 20): Promise<Alert[]> {
    return mockAlerts
      .filter((a) => a.empresa_id === empresaId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }
}
