import type { HealthScoreData, LtvCacData, AgentsActivity } from '@/lib/types'

export interface IAnalyticsService {
  getHealthScore(companyId: string): Promise<HealthScoreData>
  getLtvCac(companyId: string): Promise<LtvCacData>
  getHoursSaved(companyId: string): Promise<{ hours: number }>
  getAgentsActivity(companyId: string): Promise<AgentsActivity>
}
