export type AlertTipo =
  | 'venda'
  | 'campanha_pausada'
  | 'campanha_escalada'
  | 'baleia'
  | 'humano_solicitado'
  | 'anomalia'

export interface Alert {
  id: string
  empresa_id: string
  tipo: AlertTipo
  descricao: string
  created_at: string
}
