import type { Empresa } from '@/lib/types'

export interface IEmpresaService {
  getById(empresaId: string): Promise<Empresa | null>
  updateConfig(empresaId: string, data: Partial<Empresa>): Promise<Empresa>
}
