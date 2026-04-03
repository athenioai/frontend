import type { IAnalyticsService } from '../interfaces/analytics-service'
import type { HealthScoreData, LtvCacData, AgentsActivity } from '@/lib/types'

export class MockAnalyticsService implements IAnalyticsService {
  async getHealthScore(_companyId: string): Promise<HealthScoreData> {
    return {
      score: 78,
      message_volume: { current: 342, previous: 310, change_percent: 10.3 },
      conversion_rate: 0.085,
      avg_latency_ms: 1200,
    }
  }

  async getLtvCac(_companyId: string): Promise<LtvCacData> {
    return {
      ltv: 8450,
      cac: 185.76,
      history: [
        { lead_id: 'lead-004', name: 'Fernanda Costa', total_amount: 11880, active_months: 4 },
        { lead_id: 'lead-009', name: 'Ricardo Tavares', total_amount: 1988, active_months: 4 },
        { lead_id: 'l-old-1', name: 'João Paulo', total_amount: 8910, active_months: 6 },
        { lead_id: 'l-old-2', name: 'Maria Helena', total_amount: 5940, active_months: 3 },
        { lead_id: 'l-old-3', name: 'André Lima', total_amount: 2985, active_months: 2 },
      ],
    }
  }

  async getHoursSaved(_companyId: string): Promise<{ hours: number }> {
    return { hours: 187 }
  }

  async getAgentsActivity(_companyId: string): Promise<AgentsActivity> {
    return {
      hermes: {
        active_campaigns: 2,
        nurturing_leads: 45,
        latest_creative: 'Carrossel "5 motivos para começar agora"',
        next_cycle: '15min',
      },
      ares: {
        active_conversations: 3,
        sales_today: 1,
        scheduled_followups: 8,
        waiting_leads: 2,
      },
      athena: {
        last_cycle: '2026-03-31T11:55:00Z',
        last_cycle_summary: 'Todos os sensores normais. ROAS acima da meta. Campanha 3 pausada por CPA.',
        last_decision: 'Escalar orçamento da campanha "Video Depoimentos" em 15%',
        alerts_fired: 3,
      },
    }
  }
}
