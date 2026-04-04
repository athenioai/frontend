import type { IAnalyticsService } from './interfaces/analytics-service'
import type { HealthScoreData, LtvCacData, AgentsActivity } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class AnalyticsService implements IAnalyticsService {
  async getHealthScore(_companyId: string): Promise<HealthScoreData> {
    return apiClient<HealthScoreData>('/analytics/health-score')
  }

  async getLtvCac(_companyId: string): Promise<LtvCacData> {
    return apiClient<LtvCacData>('/analytics/ltv-cac')
  }

  async getHoursSaved(_companyId: string): Promise<{ hours: number }> {
    return apiClient<{ hours: number }>('/analytics/hours-saved')
  }

  async getAgentsActivity(_companyId: string): Promise<AgentsActivity> {
    return apiClient<AgentsActivity>('/analytics/agents-activity')
  }
}
