export interface Campaign {
  id: string
  empresa_id: string
  nome: string
  status: 'ativa' | 'pausada'
  gasto_total: number
  cpl: number
  roas: number
  leads_gerados: number
  vendas_confirmadas: number
  created_at: string
}

export interface CampaignPerformance {
  data: string
  gasto: number
  leads: number
  vendas: number
  roas: number
}

export interface RoiTotal {
  investido: number
  retorno: number
  roas: number
}
