import type { Alert } from '@/lib/types'

export interface IAlertService {
  getRecentes(empresaId: string, limit?: number): Promise<Alert[]>
}
