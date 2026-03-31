import type { HealthScoreData, LtvCacData, AgentesAtividade } from '@/lib/types'

export interface IAnalyticsService {
  getHealthScore(empresaId: string): Promise<HealthScoreData>
  getLtvCac(empresaId: string): Promise<LtvCacData>
  getEconomiaHoras(empresaId: string): Promise<{ horas: number }>
  getAtividadeAgentes(empresaId: string): Promise<AgentesAtividade>
}
