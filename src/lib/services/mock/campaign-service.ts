import type { ICampaignService } from '../interfaces/campaign-service'
import type { Campaign, CampaignPerformance, RoiTotal } from '@/lib/types'
import { mockCampaigns, mockRoiTotal } from './data'

export class MockCampaignService implements ICampaignService {
  async getAll(empresaId: string): Promise<Campaign[]> {
    return mockCampaigns.filter((c) => c.empresa_id === empresaId)
  }

  async getRoiTotal(_empresaId: string): Promise<RoiTotal> {
    const { investido, retorno, historico_7d } = mockRoiTotal
    return { investido, retorno, roas: retorno / investido, historico_7d }
  }

  async getPerformance(_campaignId: string): Promise<CampaignPerformance[]> {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(2026, 2, 18 + i)
      return {
        data: d.toISOString().split('T')[0],
        gasto: 100 + Math.random() * 200,
        leads: Math.floor(5 + Math.random() * 15),
        vendas: Math.floor(Math.random() * 4),
        roas: 1.5 + Math.random() * 4,
      }
    })
    return days
  }
}
