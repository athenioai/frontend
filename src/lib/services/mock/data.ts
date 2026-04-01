import type { Lead, Campaign, PaymentLog, Conversation, Alert, Empresa, Message, SupportTicket, SupportMessage } from '@/lib/types'

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

export const mockMessages: Message[] = [
  // conv-001: Ares falando com Carlos Silva
  { id: 'msg-001', conversation_id: 'conv-001', sender: 'agent', text: 'Oi Carlos! Aqui é o assistente da TechFit. Vi que você se interessou pelo Plano Premium Anual. Posso te ajudar com mais informações?', created_at: '2026-03-31T10:00:00Z' },
  { id: 'msg-002', conversation_id: 'conv-001', sender: 'lead', text: 'Oi! Sim, quero saber o preço e o que inclui.', created_at: '2026-03-31T10:01:00Z' },
  { id: 'msg-003', conversation_id: 'conv-001', sender: 'agent', text: 'O Plano Premium Anual custa R$ 2.970 (equivale a R$ 247,50/mês). Inclui acesso a todos os treinos, acompanhamento nutricional personalizado e suporte via WhatsApp.', created_at: '2026-03-31T10:02:00Z' },
  { id: 'msg-004', conversation_id: 'conv-001', sender: 'lead', text: 'Achei caro. Não tem desconto?', created_at: '2026-03-31T10:03:00Z' },
  { id: 'msg-005', conversation_id: 'conv-001', sender: 'agent', text: 'Entendo, Carlos. Comparando com academias presenciais da sua região, nosso plano custa 60% menos e oferece acompanhamento individual. Se fechar hoje, consigo liberar 7 dias grátis pra você testar antes de confirmar.', created_at: '2026-03-31T10:04:00Z' },
  { id: 'msg-006', conversation_id: 'conv-001', sender: 'lead', text: 'Hmm, os 7 dias grátis me interessam. Como funciona?', created_at: '2026-03-31T10:06:00Z' },
  { id: 'msg-007', conversation_id: 'conv-001', sender: 'agent', text: 'Simples: eu libero seu acesso agora, você testa por 7 dias com tudo incluso. Se gostar, o pagamento é processado. Se não, cancela sem custo. Quer que eu libere?', created_at: '2026-03-31T10:07:00Z' },
  { id: 'msg-008', conversation_id: 'conv-001', sender: 'lead', text: 'Pode liberar, vou testar.', created_at: '2026-03-31T10:10:00Z' },
  // conv-002: Hermes nutrição Ana Beatriz
  { id: 'msg-009', conversation_id: 'conv-002', sender: 'agent', text: 'Oi Ana! 👋 Tudo bem? Vi que você baixou nosso e-book sobre treino em casa. Gostou do conteúdo?', created_at: '2026-03-30T18:00:00Z' },
  { id: 'msg-010', conversation_id: 'conv-002', sender: 'lead', text: 'Oi! Gostei sim, mas ainda estou avaliando se vale a pena assinar.', created_at: '2026-03-30T18:02:00Z' },
  { id: 'msg-011', conversation_id: 'conv-002', sender: 'agent', text: 'Entendo perfeitamente. O que mais te preocupa? Posso te mandar um vídeo de depoimento de uma aluna que começou na mesma situação.', created_at: '2026-03-30T18:03:00Z' },
  { id: 'msg-012', conversation_id: 'conv-002', sender: 'lead', text: 'Quanto tempo leva pra ver resultado?', created_at: '2026-03-30T18:05:00Z' },
  { id: 'msg-013', conversation_id: 'conv-002', sender: 'agent', text: 'A maioria dos alunos sente diferença nas primeiras 2 semanas — mais disposição, sono melhor. Resultados visíveis no corpo geralmente aparecem entre 30-45 dias. Te mando o depoimento da Mariana que treina há 3 meses?', created_at: '2026-03-30T18:06:00Z' },
  // conv-003: Ares vendendo Fernanda Costa
  { id: 'msg-014', conversation_id: 'conv-003', sender: 'agent', text: 'Fernanda, boa tarde! Vimos que você acessou a página do Plano Premium pela terceira vez. Posso tirar alguma dúvida?', created_at: '2026-03-25T16:00:00Z' },
  { id: 'msg-015', conversation_id: 'conv-003', sender: 'lead', text: 'Oi! Estava comparando com outra plataforma. O de vocês é mais completo mas mais caro.', created_at: '2026-03-25T16:02:00Z' },
  { id: 'msg-016', conversation_id: 'conv-003', sender: 'agent', text: 'Qual plataforma está comparando? Posso te ajudar a entender as diferenças reais.', created_at: '2026-03-25T16:03:00Z' },
  { id: 'msg-017', conversation_id: 'conv-003', sender: 'lead', text: 'A FitApp. O plano deles é R$150/mês.', created_at: '2026-03-25T16:05:00Z' },
  { id: 'msg-018', conversation_id: 'conv-003', sender: 'agent', text: 'Conheço a FitApp. A grande diferença é que nós oferecemos nutricionista individual + ajuste semanal do treino baseado no seu progresso. Na FitApp é treino genérico. No Plano Premium Anual da TechFit, o custo mensal fica em R$247 mas com acompanhamento que realmente funciona.', created_at: '2026-03-25T16:06:00Z' },
  { id: 'msg-019', conversation_id: 'conv-003', sender: 'lead', text: 'Faz sentido. Vou fechar o anual de vocês.', created_at: '2026-03-25T16:15:00Z' },
  { id: 'msg-020', conversation_id: 'conv-003', sender: 'agent', text: 'Excelente escolha, Fernanda! 🎉 Estou gerando o link de pagamento agora. Você vai receber no WhatsApp em instantes.', created_at: '2026-03-25T16:16:00Z' },
  // conv-004: Ares falando com Marcos Oliveira
  { id: 'msg-021', conversation_id: 'conv-004', sender: 'agent', text: 'Oi Marcos! Tudo bem? Aqui é o assistente da TechFit. Vi que você demonstrou interesse no Plano Básico Mensal. Posso te ajudar?', created_at: '2026-03-31T08:00:00Z' },
  { id: 'msg-022', conversation_id: 'conv-004', sender: 'lead', text: 'Oi. Olha, pra ser sincero não entendi direito o que vocês oferecem. É academia online?', created_at: '2026-03-31T08:02:00Z' },
  { id: 'msg-023', conversation_id: 'conv-004', sender: 'agent', text: 'Boa pergunta! A TechFit é uma plataforma de treinos personalizados. Você recebe um plano montado por educadores físicos, com vídeos explicativos e acompanhamento semanal. Tudo pelo celular.', created_at: '2026-03-31T08:03:00Z' },
  { id: 'msg-024', conversation_id: 'conv-004', sender: 'lead', text: 'Tá, mas eu já uso um app grátis que tem treino. Qual a diferença?', created_at: '2026-03-31T08:05:00Z' },
  { id: 'msg-025', conversation_id: 'conv-004', sender: 'agent', text: 'A diferença é que apps grátis dão treinos genéricos iguais para todo mundo. Aqui o treino é ajustado à sua rotina, nível e objetivos. Além disso, você tem um nutricionista de apoio.', created_at: '2026-03-31T08:06:00Z' },
  { id: 'msg-026', conversation_id: 'conv-004', sender: 'lead', text: 'Sei lá, vou pensar. Conheço outras opções mais baratas.', created_at: '2026-03-31T08:08:00Z' },
  { id: 'msg-027', conversation_id: 'conv-004', sender: 'agent', text: 'Sem problemas, Marcos. Se quiser, posso te mandar um comparativo mostrando o que está incluso no nosso plano versus as alternativas. Fica à vontade pra me chamar quando quiser.', created_at: '2026-03-31T08:09:00Z' },
  // conv-005: Ares falando com Juliana Santos
  { id: 'msg-028', conversation_id: 'conv-005', sender: 'agent', text: 'Oi Juliana! Aqui é o assistente da TechFit. Vi que você está avaliando o Plano Premium Anual. Tem alguma dúvida que eu possa esclarecer?', created_at: '2026-03-31T11:00:00Z' },
  { id: 'msg-029', conversation_id: 'conv-005', sender: 'lead', text: 'Oi! Tenho sim. Quero começar mas preciso saber se consigo parcelar.', created_at: '2026-03-31T11:01:00Z' },
  { id: 'msg-030', conversation_id: 'conv-005', sender: 'agent', text: 'Claro! O Plano Premium Anual de R$ 2.970 pode ser parcelado em até 12x de R$ 247,50 no cartão. E se preferir à vista, tem 10% de desconto.', created_at: '2026-03-31T11:02:00Z' },
  { id: 'msg-031', conversation_id: 'conv-005', sender: 'lead', text: 'Legal, mas só consigo começar mês que vem. Esse valor vai mudar?', created_at: '2026-03-31T11:04:00Z' },
  { id: 'msg-032', conversation_id: 'conv-005', sender: 'agent', text: 'Entendo! O preço atual é promocional e não sei por quanto tempo vai durar. Se quiser garantir, posso travar o valor pra você e o acesso começa quando preferir. Quer que eu faça isso?', created_at: '2026-03-31T11:05:00Z' },
  { id: 'msg-033', conversation_id: 'conv-005', sender: 'lead', text: 'Hmm, pode travar sim. Mas só vou pagar quando começar, certo?', created_at: '2026-03-31T11:07:00Z' },
  { id: 'msg-034', conversation_id: 'conv-005', sender: 'agent', text: 'Combinado! Vou reservar o valor promocional pra você. Quando estiver pronta pra começar, é só me chamar aqui que a gente ativa tudo. Sem compromisso até lá. 😊', created_at: '2026-03-31T11:08:00Z' },
  { id: 'msg-035', conversation_id: 'conv-005', sender: 'lead', text: 'Perfeito! Obrigada!', created_at: '2026-03-31T11:09:00Z' },
  { id: 'msg-036', conversation_id: 'conv-005', sender: 'agent', text: 'Eu que agradeço, Juliana! Qualquer dúvida, estou por aqui. Bom dia! 🙌', created_at: '2026-03-31T11:10:00Z' },
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

export const mockSupportTickets: SupportTicket[] = [
  { id: 'ticket-001', empresa_id: 'emp-001', assunto: 'Como configurar o tom de voz do agente?', status: 'resolvido', created_at: '2026-03-25T09:00:00Z', updated_at: '2026-03-25T09:12:00Z' },
  { id: 'ticket-002', empresa_id: 'emp-001', assunto: 'Campanha pausada automaticamente', status: 'resolvido', created_at: '2026-03-28T14:30:00Z', updated_at: '2026-03-28T14:45:00Z' },
  { id: 'ticket-003', empresa_id: 'emp-001', assunto: 'Erro ao gerar relatório PDF', status: 'aberto', created_at: '2026-03-31T08:00:00Z', updated_at: '2026-03-31T08:10:00Z' },
]

export const mockSupportMessages: SupportMessage[] = [
  // ticket-001
  { id: 'smsg-001', ticket_id: 'ticket-001', sender: 'user', text: 'Oi, como faço para mudar o tom de voz do agente Ares? Quero que ele seja mais informal.', created_at: '2026-03-25T09:00:00Z' },
  { id: 'smsg-002', ticket_id: 'ticket-001', sender: 'agent', text: 'Olá! Para configurar o tom de voz do Ares, acesse Configurações > Tom de Voz. Lá você pode personalizar o estilo de comunicação de cada agente individualmente.', created_at: '2026-03-25T09:01:00Z' },
  { id: 'smsg-003', ticket_id: 'ticket-001', sender: 'user', text: 'Achei! E posso colocar exemplos de frases que ele deve usar?', created_at: '2026-03-25T09:03:00Z' },
  { id: 'smsg-004', ticket_id: 'ticket-001', sender: 'agent', text: 'Sim! No campo de tom de voz, você pode incluir instruções como "Usar gírias informais", "Sempre chamar pelo primeiro nome" ou até colar exemplos de mensagens ideais. O agente vai adaptar o estilo automaticamente.', created_at: '2026-03-25T09:04:00Z' },
  { id: 'smsg-005', ticket_id: 'ticket-001', sender: 'user', text: 'Perfeito, muito obrigado!', created_at: '2026-03-25T09:06:00Z' },
  { id: 'smsg-006', ticket_id: 'ticket-001', sender: 'agent', text: 'Disponível! Se precisar de mais alguma coisa, é só chamar. 😊', created_at: '2026-03-25T09:07:00Z' },
  // ticket-002
  { id: 'smsg-007', ticket_id: 'ticket-002', sender: 'user', text: 'Minha campanha "Imagem Promo - Básico" foi pausada do nada. O que aconteceu?', created_at: '2026-03-28T14:30:00Z' },
  { id: 'smsg-008', ticket_id: 'ticket-002', sender: 'agent', text: 'Verifiquei aqui e a campanha foi pausada automaticamente porque o CPA (Custo por Aquisição) ultrapassou o limite configurado. Quando o CPA fica acima do teto, o sistema pausa para proteger seu orçamento.', created_at: '2026-03-28T14:31:00Z' },
  { id: 'smsg-009', ticket_id: 'ticket-002', sender: 'user', text: 'Entendi. E como reativo ela?', created_at: '2026-03-28T14:33:00Z' },
  { id: 'smsg-010', ticket_id: 'ticket-002', sender: 'agent', text: 'Você pode reativar em Campanhas > selecionar a campanha > clicar em "Reativar". Recomendo também ajustar o teto de CPA em Configurações se achar que o limite está muito baixo para essa campanha.', created_at: '2026-03-28T14:34:00Z' },
  { id: 'smsg-011', ticket_id: 'ticket-002', sender: 'user', text: 'Boa, vou ajustar. Valeu!', created_at: '2026-03-28T14:36:00Z' },
  { id: 'smsg-012', ticket_id: 'ticket-002', sender: 'agent', text: 'Por nada! Qualquer dúvida sobre limites de campanha, estou aqui.', created_at: '2026-03-28T14:37:00Z' },
  // ticket-003
  { id: 'smsg-013', ticket_id: 'ticket-003', sender: 'user', text: 'Estou tentando gerar o relatório PDF do mês mas dá um erro na hora de exportar. Pode me ajudar?', created_at: '2026-03-31T08:00:00Z' },
  { id: 'smsg-014', ticket_id: 'ticket-003', sender: 'agent', text: 'Claro! Pode me dizer qual mensagem de erro aparece? E em qual navegador você está usando?', created_at: '2026-03-31T08:01:00Z' },
  { id: 'smsg-015', ticket_id: 'ticket-003', sender: 'user', text: 'Aparece "Falha ao processar relatório". Estou no Chrome.', created_at: '2026-03-31T08:03:00Z' },
  { id: 'smsg-016', ticket_id: 'ticket-003', sender: 'agent', text: 'Entendi. Esse erro pode ocorrer quando o período selecionado tem muitos dados. Tente gerar para uma semana de cada vez ao invés do mês inteiro. Estamos trabalhando numa correção para relatórios grandes. Enquanto isso, essa solução alternativa deve funcionar.', created_at: '2026-03-31T08:05:00Z' },
]
