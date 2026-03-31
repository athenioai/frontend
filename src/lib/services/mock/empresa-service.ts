import type { IEmpresaService } from '../interfaces/empresa-service'
import type { Empresa } from '@/lib/types'
import { mockEmpresas } from './data'

export class MockEmpresaService implements IEmpresaService {
  async getById(empresaId: string): Promise<Empresa | null> {
    return mockEmpresas.find((e) => e.id === empresaId) ?? null
  }

  async updateConfig(empresaId: string, data: Partial<Empresa>): Promise<Empresa> {
    const empresa = mockEmpresas.find((e) => e.id === empresaId)
    if (!empresa) throw new Error('Empresa não encontrada')
    return { ...empresa, ...data }
  }
}
