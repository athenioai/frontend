export interface PaymentLog {
  id: string
  empresa_id: string
  lead_id: string
  valor: number
  status: 'confirmado' | 'pendente' | 'falhou'
  campanha_id: string
  created_at: string
}
