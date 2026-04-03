import type { ICampaignService } from '../interfaces/campaign-service'
import type { Campaign, CampaignPerformance, RoiTotal } from '@/lib/types'
import { mockCampaigns, mockRoiTotal } from './data'

export class MockCampaignService implements ICampaignService {
  async getAll(companyId: string): Promise<Campaign[]> {
    return mockCampaigns.filter((c) => c.company_id === companyId)
  }

  async getTotalRoi(_companyId: string): Promise<RoiTotal> {
    const { invested, revenue, history_7d } = mockRoiTotal
    return { invested, revenue, roas: revenue / invested, history_7d }
  }

  async getPerformance(_campaignId: string): Promise<CampaignPerformance[]> {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(2026, 2, 18 + i)
      return {
        date: d.toISOString().split('T')[0],
        spent: 100 + Math.random() * 200,
        leads: Math.floor(5 + Math.random() * 15),
        sales: Math.floor(Math.random() * 4),
        roas: 1.5 + Math.random() * 4,
      }
    })
    return days
  }
}
