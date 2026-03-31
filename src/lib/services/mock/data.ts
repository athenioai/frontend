import type { Lead, Campaign, PaymentLog, Conversation, Alert, Empresa } from '@/lib/types'

export const MOCK_EMPRESA_ID = 'emp-001'

export const mockEmpresas: Empresa[] = [
  {
    id: 'emp-001',
    nome: 'TechFit Academia Digital',
    roas_meta: 3.0,
    cpl_alvo: 15.0,
    orcamento_diario: 500,
    teto_cartao: 15000,
    tom_de_voz: 'Direto e motivacional, sem enrolação. Foco em resultados concretos.',
    whatsapp_alertas: '+5511999887766',
    health_score: 78,
    assinatura_status: 'ativa',
  },
  {
    id: 'emp-002',
    nome: 'Dra. Marina Odontologia',
    roas_meta: 4.0,
    cpl_alvo: 25.0,
    orcamento_diario: 300,
    teto_cartao: 10000,
    tom_de_voz: 'Profissional e acolhedor. Transmitir confiança e expertise.',
    whatsapp_alertas: '+5511988776655',
    health_score: 45,
    assinatura_status: 'ativa',
  },
  {
    id: 'emp-003',
    nome: 'SolarMax Energia',
    roas_meta: 5.0,
    cpl_alvo: 40.0,
    orcamento_diario: 800,
    teto_cartao: 25000,
    tom_de_voz: 'Técnico mas acessível. Foco em economia e sustentabilidade.',
    whatsapp_alertas: '+5511977665544',
    health_score: 92,
    assinatura_status: 'ativa',
  },
]

export const mockLeads: Lead[] = [
  {
    id: 'lead-001', empresa_id: 'emp-001', nome: 'Carlos Silva', telefone: '+5511999001122',
    temperatura: 'quente', score: 88, estagio_funil: 'negociacao', agente_responsavel: 'ares',
    sentimento: 'positivo', produto_interesse: 'Plano Premium Anual',
    objecoes: ['preço'], origem_utm: { source: 'meta', medium: 'cpc', campaign: 'camp-001', content: 'video-depoimento' },
    created_at: '2026-03-28T14:30:00Z', updated_at: '2026-03-31T10:15:00Z',
  },
  {
    id: 'lead-002', empresa_id: 'emp-001', nome: 'Ana Beatriz', telefone: '+5511988112233',
    temperatura: 'morno', score: 55, estagio_funil: 'qualificado', agente_responsavel: 'hermes',
    sentimento: 'neutro', produto_interesse: 'Plano Básico Mensal',
    objecoes: ['prazo', 'desconfiança'], origem_utm: { source: 'meta', medium: 'cpc', campaign: 'camp-002', content: 'carrossel-beneficios' },
    created_at: '2026-03-29T09:00:00Z', updated_at: '2026-03-30T18:00:00Z',
  },
  {
    id: 'lead-003', empresa_id: 'emp-001', nome: 'Roberto Mendes', telefone: '+5511977223344',
    temperatura: 'frio', score: 20, estagio_funil: 'captado', agente_responsavel: 'hermes',
    sentimento: 'neutro', produto_interesse: 'Plano Premium Anual',
    objecoes: [], origem_utm: { source: 'meta', medium: 'cpc', campaign: 'camp-001', content: 'video-depoimento' },
    created_at: '2026-03-30T22:00:00Z', updated_at: '2026-03-30T22:00:00Z',
  },
  {
    id: 'lead-004', empresa_id: 'emp-001', nome: 'Fernanda Costa', telefone: '+5511966334455',
    temperatura: 'quente', score: 92, estagio_funil: 'convertido', agente_responsavel: 'ares',
    sentimento: 'positivo', produto_interesse: 'Plano Premium Anual',
    objecoes: ['preço'], origem_utm: { source: 'meta', medium: 'cpc', campaign: 'camp-001', content: 'video-depoimento' },
    created_at: '2026-03-20T08:00:00Z', updated_at: '2026-03-25T16:30:00Z',
  },
  {
    id: 'lead-005', empresa_id: 'emp-001', nome: 'Marcos Oliveira', telefone: '+5511955445566',
    temperatura: 'morno', score: 60, estagio_funil: 'qualificado', agente_responsavel: 'ares',
    sentimento: 'negativo', produto_interesse: 'Plano Básico Mensal',
    objecoes: ['não entendeu o produto', 'concorrente'], origem_utm: { source: 'meta', medium: 'cpc', campaign: 'camp-003', content: 'imagem-promo' },
    created_at: '2026-03-27T11:00:00Z', updated_at: '2026-03-31T08:00:00Z',
  },
  {
    id: 'lead-006', empresa_id: 'emp-001', nome: 'Juliana Santos', telefone: '+5511944556677',
    temperatura: 'quente', score: 85, estagio_funil: 'negociacao', agente_responsavel: 'ares',
    sentimento: 'positivo', produto_interesse: 'Plano Premium Anual',
    objecoes: ['prazo'], origem_utm: { source: 'meta', medium: 'cpc', campaign: 'camp-002', content: 'carrossel-beneficios' },
    created_at: '2026-03-26T15:00:00Z', updated_at: '2026-03-31T11:00:00Z',
  },
  {
    id: 'lead-007', empresa_id: 'emp-001', nome: 'Pedro Almeida', telefone: '+5511933667788',
    temperatura: 'frio', score: 15, estagio_funil: 'captado', agente_responsavel: 'hermes',
    sentimento: 'neutro', produto_interesse: 'Plano Básico Mensal',
    objecoes: [], origem_utm: { source: 'meta', medium: 'cpc', campaign: 'camp-003', content: 'imagem-promo' },
    created_at: '2026-03-31T06:00:00Z', updated_at: '2026-03-31T06:00:00Z',
  },
  {
    id: 'lead-008', empresa_id: 'emp-001', nome: 'Lucia Ferreira', telefone: '+5511922778899',
    temperatura: 'morno', score: 45, estagio_funil: 'qualificado', agente_responsavel: 'hermes',
    sentimento: 'positivo', produto_interesse: 'Consultoria Individual',
    objecoes: ['preço', 'desconfiança'], origem_utm: { source: 'meta', medium: 'cpc', campaign: 'camp-001', content: 'video-depoimento' },
    created_at: '2026-03-25T13:00:00Z', updated_at: '2026-03-30T20:00:00Z',
  },
  {
    id: 'lead-009', empresa_id: 'emp-001', nome: 'Ricardo Tavares', telefone: '+5511911889900',
    temperatura: 'quente', score: 78, estagio_funil: 'convertido', agente_responsavel: 'ares',
    sentimento: 'positivo', produto_interesse: 'Plano Básico Mensal',
    objecoes: [], origem_utm: { source: 'meta', medium: 'cpc', campaign: 'camp-002', content: 'carrossel-beneficios' },
    created_at: '2026-03-18T10:00:00Z', updated_at: '2026-03-22T14:00:00Z',
  },
  {
    id: 'lead-010', empresa_id: 'emp-001', nome: 'Camila Rocha', telefone: '+5511900990011',
    temperatura: 'frio', score: 30, estagio_funil: 'perdido', agente_responsavel: null,
    sentimento: 'negativo', produto_interesse: 'Plano Premium Anual',
    objecoes: ['preço', 'concorrente'], origem_utm: { source: 'meta', medium: 'cpc', campaign: 'camp-003', content: 'imagem-promo' },
    created_at: '2026-03-15T09:00:00Z', updated_at: '2026-03-20T10:00:00Z',
  },
]

export const mockCampaigns: Campaign[] = [
  {
    id: 'camp-001', empresa_id: 'emp-001', nome: 'Video Depoimentos - Premium', status: 'ativa',
    gasto_total: 2450.80, cpl: 12.25, roas: 4.2, leads_gerados: 200, vendas_confirmadas: 18,
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'camp-002', empresa_id: 'emp-001', nome: 'Carrossel Benefícios - Multi', status: 'ativa',
    gasto_total: 1830.50, cpl: 18.30, roas: 2.8, leads_gerados: 100, vendas_confirmadas: 8,
    created_at: '2026-03-05T00:00:00Z',
  },
  {
    id: 'camp-003', empresa_id: 'emp-001', nome: 'Imagem Promo - Básico', status: 'pausada',
    gasto_total: 920.00, cpl: 30.66, roas: 1.1, leads_gerados: 30, vendas_confirmadas: 2,
    created_at: '2026-03-10T00:00:00Z',
  },
]

export const mockPayments: PaymentLog[] = [
  { id: 'pay-001', empresa_id: 'emp-001', lead_id: 'lead-004', valor: 2970, status: 'confirmado', campanha_id: 'camp-001', created_at: '2026-03-25T16:30:00Z' },
  { id: 'pay-002', empresa_id: 'emp-001', lead_id: 'lead-009', valor: 497, status: 'confirmado', campanha_id: 'camp-002', created_at: '2026-03-22T14:00:00Z' },
  { id: 'pay-003', empresa_id: 'emp-001', lead_id: 'lead-001', valor: 2970, status: 'pendente', campanha_id: 'camp-001', created_at: '2026-03-31T10:00:00Z' },
]

export const mockConversations: Conversation[] = [
  { id: 'conv-001', empresa_id: 'emp-001', lead_id: 'lead-001', mensagens_count: 24, duracao_minutos: 35, agente: 'ares', created_at: '2026-03-31T10:00:00Z' },
  { id: 'conv-002', empresa_id: 'emp-001', lead_id: 'lead-002', mensagens_count: 8, duracao_minutos: 12, agente: 'hermes', created_at: '2026-03-30T18:00:00Z' },
  { id: 'conv-003', empresa_id: 'emp-001', lead_id: 'lead-004', mensagens_count: 32, duracao_minutos: 55, agente: 'ares', created_at: '2026-03-25T16:00:00Z' },
  { id: 'conv-004', empresa_id: 'emp-001', lead_id: 'lead-005', mensagens_count: 15, duracao_minutos: 20, agente: 'ares', created_at: '2026-03-31T08:00:00Z' },
  { id: 'conv-005', empresa_id: 'emp-001', lead_id: 'lead-006', mensagens_count: 28, duracao_minutos: 45, agente: 'ares', created_at: '2026-03-31T11:00:00Z' },
]

export const mockRoiTotal = {
  investido: 5201.30,
  retorno: 18467.00,
  historico_7d: [2.8, 3.1, 2.9, 3.4, 3.2, 3.5, 3.55],
}

export const mockAlerts: Alert[] = [
  { id: 'alt-001', empresa_id: 'emp-001', tipo: 'venda', descricao: 'Venda confirmada: Fernanda Costa — Plano Premium Anual (R$ 2.970)', created_at: '2026-03-31T10:30:00Z' },
  { id: 'alt-002', empresa_id: 'emp-001', tipo: 'baleia', descricao: 'Lead de alto valor detectado: Carlos Silva (score 88)', created_at: '2026-03-31T10:15:00Z' },
  { id: 'alt-003', empresa_id: 'emp-001', tipo: 'campanha_pausada', descricao: 'Campanha "Imagem Promo - Básico" pausada por CPA acima do limite', created_at: '2026-03-31T09:00:00Z' },
  { id: 'alt-004', empresa_id: 'emp-001', tipo: 'campanha_escalada', descricao: 'Campanha "Video Depoimentos" escalada +15% — ROAS acima da meta', created_at: '2026-03-31T08:30:00Z' },
  { id: 'alt-005', empresa_id: 'emp-001', tipo: 'humano_solicitado', descricao: 'Marcos Oliveira pediu para falar com um humano — sentimento negativo', created_at: '2026-03-31T08:00:00Z' },
  { id: 'alt-006', empresa_id: 'emp-001', tipo: 'anomalia', descricao: 'Padrão suspeito detectado: 12 mensagens em 30s do número +5511900000000', created_at: '2026-03-30T23:00:00Z' },
  { id: 'alt-007', empresa_id: 'emp-001', tipo: 'venda', descricao: 'Venda confirmada: Ricardo Tavares — Plano Básico Mensal (R$ 497)', created_at: '2026-03-30T14:00:00Z' },
]
