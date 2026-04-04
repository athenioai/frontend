import type { ICampaignService } from './interfaces/campaign-service'
import type { Campaign, CampaignPerformance, RoiTotal } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class CampaignService implements ICampaignService {
  async getAll(_companyId: string): Promise<Campaign[]> {
    return apiClient<Campaign[]>('/campaigns')
  }

  async getTotalRoi(_companyId: string): Promise<RoiTotal> {
    return apiClient<RoiTotal>('/campaigns/roi')
  }

  async getPerformance(campaignId: string): Promise<CampaignPerformance[]> {
    return apiClient<CampaignPerformance[]>(`/campaigns/${campaignId}/performance`)
  }
}
