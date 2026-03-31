import type { EmpresaResumo } from '@/lib/types'

export interface IAdminService {
  getAllEmpresas(): Promise<EmpresaResumo[]>
}
