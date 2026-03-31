export interface Lead {
  id: string
  empresa_id: string
  nome: string
  telefone: string
  temperatura: 'frio' | 'morno' | 'quente'
  score: number
  estagio_funil: 'captado' | 'qualificado' | 'negociacao' | 'convertido' | 'perdido'
  agente_responsavel: 'hermes' | 'ares' | null
  sentimento: 'positivo' | 'neutro' | 'negativo'
  produto_interesse: string
  objecoes: string[]
  origem_utm: UtmParams
  created_at: string
  updated_at: string
}

export interface UtmParams {
  source: string
  medium: string
  campaign: string
  content: string
}

export interface LeadFilters {
  temperatura?: Lead['temperatura'][]
  estagio_funil?: Lead['estagio_funil'][]
  agente_responsavel?: Lead['agente_responsavel'][]
  sentimento?: Lead['sentimento'][]
  busca?: string
  page?: number
  per_page?: number
  sort_by?: keyof Lead
  sort_order?: 'asc' | 'desc'
}

export interface FunilStats {
  captados: number
  qualificados: number
  negociacao: number
  convertidos: number
  taxas: {
    captado_qualificado: number
    qualificado_negociacao: number
    negociacao_convertido: number
  }
}

export interface ObjecaoCount {
  objecao: string
  count: number
}
