import type { Campaign, CampaignPerformance, RoiTotal } from '@/lib/types'

export interface ICampaignService {
  getAll(empresaId: string): Promise<Campaign[]>
  getRoiTotal(empresaId: string): Promise<RoiTotal>
  getPerformance(campaignId: string): Promise<CampaignPerformance[]>
}
