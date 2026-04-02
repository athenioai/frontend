import type { IAnalyticsService } from '../interfaces/analytics-service'
import type { HealthScoreData, LtvCacData, AgentesAtividade } from '@/lib/types'

export class MockAnalyticsService implements IAnalyticsService {
  async getHealthScore(_empresaId: string): Promise<HealthScoreData> {
    return {
      score: 78,
      volume_mensagens: { atual: 342, anterior: 310, variacao_percent: 10.3 },
      taxa_conversao: 0.085,
      latencia_media_ms: 1200,
    }
  }

  async getLtvCac(_empresaId: string): Promise<LtvCacData> {
    return {
      ltv: 8450,
      cac: 185.76,
      historico: [
        { lead_id: 'lead-004', name: 'Fernanda Costa', valor_total: 11880, meses_ativo: 4 },
        { lead_id: 'lead-009', name: 'Ricardo Tavares', valor_total: 1988, meses_ativo: 4 },
        { lead_id: 'l-old-1', name: 'João Paulo', valor_total: 8910, meses_ativo: 6 },
        { lead_id: 'l-old-2', name: 'Maria Helena', valor_total: 5940, meses_ativo: 3 },
        { lead_id: 'l-old-3', name: 'André Lima', valor_total: 2985, meses_ativo: 2 },
      ],
    }
  }

  async getHoursSaved(_empresaId: string): Promise<{ horas: number }> {
    return { horas: 187 }
  }

  async getAgentsActivity(_empresaId: string): Promise<AgentesAtividade> {
    return {
      ares: {
        campanhas_ativas: 2,
        leads_nutricao: 45,
        ultimo_criativo: 'Carrossel "5 motivos para começar agora"',
        proximo_ciclo: '15min',
      },
      kairos: {
        conversas_ativas: 3,
        vendas_hoje: 1,
        followups_agendados: 8,
        leads_aguardando: 2,
      },
      athena: {
        ultimo_ciclo: '2026-03-31T11:55:00Z',
        ultimo_ciclo_resumo: 'Todos os sensores normais. ROAS acima da meta. Campanha 3 pausada por CPA.',
        ultima_decisao: 'Escalar orçamento da campanha "Video Depoimentos" em 15%',
        alertas_disparados: 3,
      },
    }
  }
}
