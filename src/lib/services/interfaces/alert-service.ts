import type { Alert } from '@/lib/types'

export interface IAlertService {
  getRecent(companyId: string, limit?: number): Promise<Alert[]>
}
