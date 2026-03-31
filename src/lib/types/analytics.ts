export interface HealthScoreData {
  score: number
  volume_mensagens: {
    atual: number
    anterior: number
    variacao_percent: number
  }
  taxa_conversao: number
  latencia_media_ms: number
  motivo_alerta?: string
  acao_recomendada?: string
}

export interface LtvCacData {
  ltv: number
  cac: number
  historico: LtvEntry[]
}

export interface LtvEntry {
  lead_id: string
  nome: string
  valor_total: number
  meses_ativo: number
}

export interface AgentesAtividade {
  hermes: {
    campanhas_ativas: number
    leads_nutricao: number
    ultimo_criativo: string
    proximo_ciclo: string
  }
  ares: {
    conversas_ativas: number
    vendas_hoje: number
    followups_agendados: number
    leads_aguardando: number
  }
  athena: {
    ultimo_ciclo: string
    ultimo_ciclo_resumo: string
    ultima_decisao: string
    alertas_disparados: number
  }
}
