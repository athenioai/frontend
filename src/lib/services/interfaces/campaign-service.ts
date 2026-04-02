import type { Campaign, CampaignPerformance, RoiTotal } from '@/lib/types'

export interface ICampaignService {
  getAll(companyId: string): Promise<Campaign[]>
  getTotalRoi(companyId: string): Promise<RoiTotal>
  getPerformance(campaignId: string): Promise<CampaignPerformance[]>
}
