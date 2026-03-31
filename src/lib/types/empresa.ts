export interface Empresa {
  id: string
  nome: string
  roas_meta: number
  cpl_alvo: number
  orcamento_diario: number
  teto_cartao: number
  tom_de_voz: string
  whatsapp_alertas: string
  health_score: number
  assinatura_status: 'ativa' | 'cancelada' | 'inadimplente'
}

export interface EmpresaResumo {
  id: string
  nome: string
  health_score: number
  roas_mes: number
  ultimo_alerta: string | null
  assinatura_status: Empresa['assinatura_status']
}
