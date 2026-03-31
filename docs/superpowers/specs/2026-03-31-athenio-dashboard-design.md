# Athenio.ai Dashboard — Design Spec

## Resumo

Dashboard Next.js 14+ (App Router) para clientes da Athenio.ai acompanharem em tempo real o desempenho dos agentes Hermes (Marketing), Ares (Comercial) e Athena (Orquestrador). Inclui painel admin interno para monitoramento de churn.

**Stack:** Next.js 14+ App Router, Tailwind CSS, shadcn/ui, Recharts, @react-pdf/renderer
**Deploy alvo:** Vercel
**Dados:** Mock data com Service Layer tipado para Supabase (swap futuro sem tocar componentes)
**Auth:** Mock (qualquer credencial autentica, sessão em cookie) — tipado para Supabase Auth
**Tema:** Dark mode exclusivo, identidade visual extraída de athenio.ai

---

## 1. Arquitetura e Estrutura de Pastas

```
src/
├── app/
│   ├── layout.tsx                  # Root layout (dark theme, fonte, metadata)
│   ├── page.tsx                    # Redirect para /dashboard
│   ├── login/
│   │   └── page.tsx
│   ├── (authenticated)/            # Route group com middleware de auth
│   │   ├── layout.tsx              # Sidebar + topbar + health alert banner
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── funil/
│   │   │   └── page.tsx
│   │   ├── leads/
│   │   │   └── page.tsx
│   │   ├── campanhas/
│   │   │   └── page.tsx
│   │   ├── relatorios/
│   │   │   └── page.tsx
│   │   └── configuracoes/
│   │       └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── api/
│       └── relatorios/
│           └── pdf/
│               └── route.ts        # PDF generation server-side
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── widgets/                    # Dashboard widgets (ROI, HealthScore, Funil, etc.)
│   ├── charts/                     # Wrappers Recharts customizados
│   └── layout/                     # Sidebar, Topbar, HealthBanner
├── lib/
│   ├── services/                   # Interfaces + implementações
│   │   ├── interfaces/             # Contratos TypeScript
│   │   ├── mock/                   # Implementações com dados fictícios
│   │   └── index.ts                # Re-export do provider ativo
│   ├── types/                      # Tipos do domínio (Lead, Campaign, etc.)
│   ├── utils/                      # Formatação BR (moeda, data, fuso)
│   └── constants/                  # Cores, config de tema
└── styles/
    └── globals.css                 # Tailwind + variáveis CSS da identidade
```

**Decisões:**
- Route group `(authenticated)` aplica sidebar/topbar e valida sessão via middleware
- `/admin` separado — middleware checa role do usuário
- Widgets isolados em `components/widgets/`, cada um consome seu service independentemente
- API Route de PDF usa `@react-pdf/renderer` server-side (zero dependência de browser)

---

## 2. Service Layer e Tipos do Domínio

### Tipos principais

```typescript
// Lead
interface Lead {
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
  origem_utm: { source: string; medium: string; campaign: string; content: string }
  created_at: string
  updated_at: string
}

// Campaign
interface Campaign {
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

// PaymentLog
interface PaymentLog {
  id: string
  empresa_id: string
  lead_id: string
  valor: number
  status: 'confirmado' | 'pendente' | 'falhou'
  campanha_id: string
  created_at: string
}

// Conversation
interface Conversation {
  id: string
  empresa_id: string
  lead_id: string
  mensagens_count: number
  duracao_minutos: number
  agente: 'hermes' | 'ares'
  created_at: string
}

// Alert
interface Alert {
  id: string
  empresa_id: string
  tipo: 'venda' | 'campanha_pausada' | 'campanha_escalada' | 'baleia' | 'humano_solicitado' | 'anomalia'
  descricao: string
  created_at: string
}

// Empresa
interface Empresa {
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
```

### Interfaces de Service

```typescript
interface ILeadService {
  getAll(empresaId: string, filters?: LeadFilters): Promise<Lead[]>
  getById(id: string): Promise<Lead | null>
  getFunilStats(empresaId: string, periodo: '1d' | '7d' | '30d'): Promise<FunilStats>
  getTopObjecoes(empresaId: string): Promise<ObjecaoCount[]>
}

interface ICampaignService {
  getAll(empresaId: string): Promise<Campaign[]>
  getRoiTotal(empresaId: string): Promise<{ investido: number; retorno: number; roas: number }>
}

interface IAnalyticsService {
  getHealthScore(empresaId: string): Promise<HealthScoreData>
  getLtvCac(empresaId: string): Promise<{ ltv: number; cac: number; historico: LtvEntry[] }>
  getEconomiaHoras(empresaId: string): Promise<{ horas: number }>
  getAtividadeAgentes(empresaId: string): Promise<AgentesAtividade>
}

interface IAlertService {
  getRecentes(empresaId: string, limit?: number): Promise<Alert[]>
}

interface IEmpresaService {
  getById(empresaId: string): Promise<Empresa | null>
  updateConfig(empresaId: string, data: Partial<Empresa>): Promise<Empresa>
}

interface IAdminService {
  getAllEmpresas(): Promise<EmpresaResumo[]>
  getEmpresaDashboard(empresaId: string): Promise<EmpresaDashboard>
}
```

### Tipos auxiliares

```typescript
// Filtros
interface LeadFilters {
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

// Stats do funil
interface FunilStats {
  captados: number
  qualificados: number
  negociacao: number
  convertidos: number
  taxas: { captado_qualificado: number; qualificado_negociacao: number; negociacao_convertido: number }
}

// Objeções agregadas
interface ObjecaoCount {
  objecao: string
  count: number
}

// Health Score detalhado
interface HealthScoreData {
  score: number
  volume_mensagens: { atual: number; anterior: number; variacao_percent: number }
  taxa_conversao: number
  latencia_media_ms: number
  motivo_alerta?: string
  acao_recomendada?: string
}

// LTV individual
interface LtvEntry {
  lead_id: string
  nome: string
  valor_total: number
  meses_ativo: number
}

// Atividade dos agentes
interface AgentesAtividade {
  hermes: { campanhas_ativas: number; leads_nutricao: number; ultimo_criativo: string; proximo_ciclo: string }
  ares: { conversas_ativas: number; vendas_hoje: number; followups_agendados: number; leads_aguardando: number }
  athena: { ultimo_ciclo: string; ultimo_ciclo_resumo: string; ultima_decisao: string; alertas_disparados: number }
}

// Admin
interface EmpresaResumo {
  id: string
  nome: string
  health_score: number
  roas_mes: number
  ultimo_alerta: string | null
  assinatura_status: Empresa['assinatura_status']
}

// Tabelas adicionais referenciadas no doc original
interface OrchestratorDecision {
  id: string
  empresa_id: string
  tipo: string
  descricao: string
  dados: Record<string, unknown>
  created_at: string
}

interface SelfReflectReport {
  id: string
  empresa_id: string
  resumo: string
  insights: string[]
  created_at: string
}

interface ConversationSummary {
  id: string
  empresa_id: string
  lead_id: string
  resumo: string
  ultima_dor: string
  estagio_funil: string
  objecoes_ativas: string[]
  created_at: string
}
```

**Swap pattern:** `lib/services/index.ts` re-exporta a implementação mock. Quando Supabase estiver pronto, trocar o import nesse arquivo — componentes não mudam.

---

## 3. Identidade Visual

Extraída de athenio.ai. Dark mode exclusivo, sem toggle.

### Cores

| Token | Valor | Uso |
|---|---|---|
| `--accent` | `#4FD1C5` | CTAs, valores destaque, links, bordas ativas |
| `--accent-light` | `#81E6D9` | Gradientes, hover states |
| `--bg-base` | `#070C0C` | Background da página |
| `--bg-elevated` | `rgba(15,61,62,0.2)` | Cards, surfaces |
| `--bg-input` | `rgba(15,61,62,0.22)` | Inputs de formulário |
| `--text-primary` | `#FFFFFF` | Texto principal |
| `--text-muted` | `rgba(255,255,255,0.6)` | Texto secundário |
| `--text-subtle` | `rgba(255,255,255,0.4)` | Labels, placeholders |
| `--border` | `rgba(79,209,197,0.15)` | Bordas padrão |
| `--border-strong` | `rgba(79,209,197,0.3)` | Bordas destacadas |
| `--danger` | `#E07070` | Erros, Health Score baixo |
| `--danger-bg` | `rgba(161,92,92,0.15)` | Background de alertas |
| `--warning` | `#F6E05E` | Health Score médio |
| `--success` | `#4FD1C5` | Health Score bom, vendas |

### Tipografia

- **Títulos/Display:** Space Grotesk (`--font-title: 'Space Grotesk', sans-serif`), weight 700
- **Body:** Sora (`--font-body: 'Sora', sans-serif`), weight 400-600
- **Valores destaque:** `clamp(34px, 5.5vw, 68px)`, `#4FD1C5`, weight 700
- **Labels:** 11-13px, weight 600-700, uppercase, letter-spacing `.12em`
- **Google Fonts import:** `Space+Grotesk:wght@400;500;600;700` + `Sora:wght@400;500;600`

### Componentes Base

- **Cards:** `bg-elevated`, `border`, `rounded-xl`, padding `28-40px`. Hover interativo: `translateY(-3px)`, border brightens
- **Buttons CTA:** `#4FD1C5` bg, `#070C0C` text, pill radius, shadow `0 0 40px rgba(79,209,197,.3)`
- **Badges:** `rgba(79,209,197,0.08)` bg, `rgba(79,209,197,0.2)` border, `#4FD1C5` text
- **Inputs:** `bg-input`, focus border `#4FD1C5`, focus bg `rgba(79,209,197,0.05)`
- **Gráficos Recharts:** cores teal, grid sutil `rgba(255,255,255,0.05)`, tooltip dark

---

## 4. Widgets do Dashboard

### Layout Grid

```
Desktop (lg+):
┌──────────────────────────────────────────────┐
│           1. ROI em Tempo Real (full width)   │
├──────────────────────┬───────────────────────┤
│  2. Health Score     │  3. Funil de Vendas   │
├──────────────────────┴───────────────────────┤
│  4. LTV      │  4. CAC       │  5. Top       │
│              │               │  Objeções     │
├──────────────┴───────────────┴───────────────┤
│  6. Economia de Tempo (full width)           │
├──────────────────────────────────────────────┤
│  7. Hermes   │  7. Ares      │  7. Athena    │
├──────────────┴───────────────┴───────────────┤
│  8. Feed de Alertas (full width)             │
└──────────────────────────────────────────────┘

Mobile: 1 → 2 (sem scroll) → 3-8 stack vertical
```

### Widget 1: ROI em Tempo Real
- Card full-width, destaque absoluto
- Frase: "Para cada R$ 1,00 investido em anuncio, a Athenio retornou R$ X,00 em vendas"
- Valor em tipografia display `clamp(34px, 5.5vw, 68px)`, cor `#4FD1C5`
- Background com glow radial `rgba(79,209,197,0.1)`
- Mock: simula atualização com setInterval no client component

### Widget 2: Health Score
- Gauge semicircular (Recharts PieChart customizado), 0-100
- Cores: verde `#4FD1C5` (>80), amarelo `#F6E05E` (60-80), vermelho `#E07070` (<60)
- 3 indicadores menores abaixo: volume msgs, taxa conversão, latência

### Widget 3: Funil de Vendas
- Funil vertical, 4 etapas: captados → qualificados → negociação → convertidos
- Cada barra: número absoluto + taxa de conversão para próxima
- Degradê de `#4FD1C5` (topo) para `#0F3D3E` (base)

### Widget 4: LTV e CAC
- 2 cards lado a lado com valor grande + label
- Abaixo: BarChart com LTV individual dos últimos clientes convertidos

### Widget 5: Top Objeções
- BarChart horizontal, barras ordenadas por frequência
- Categorias: preço, prazo, desconfiança, não entendeu, concorrente

### Widget 6: Economia de Tempo
- Card com destaque: "Este mês, a Athenio economizou X horas de trabalho humano"
- Ícone de relógio + barra de progresso visual

### Widget 7: Atividade dos Agentes
- 3 cards (1x3 desktop, stack mobile)
- Cada: nome, status badge, 3-4 métricas das últimas 24h
- Hermes: campanhas ativas, leads em nutrição, último criativo, próximo ciclo
- Ares: conversas ativas, vendas hoje, follow-ups agendados, leads aguardando
- Athena: último ciclo (horário + resumo), última decisão, alertas disparados

### Widget 8: Feed de Alertas
- Lista cronológica scrollável (max-height com overflow)
- Cada item: ícone por tipo + descrição + timestamp relativo
- Tipos: venda (cifrão), campanha pausada (pausa), baleia (estrela), humano (pessoa), anomalia (escudo)

---

## 5. Páginas

### `/login`
- Layout centralizado sem sidebar
- Logo grande, card glassmorphism com email + senha + botão "Entrar"
- Background: grid sutil + orb flutuante (keyframe `float-orb`)
- Erro: "Credenciais não conferem. Tente novamente."
- Mock: qualquer credencial válida autentica, sessão em cookie

### `/dashboard`
- Todos os 8 widgets conforme Seção 4
- Primeiro load: ROI visível em <2s (Server Component, dados mock instantâneos)

### `/funil`
- Filtro de período: Hoje | 7 dias | 30 dias (toggle group)
- Funil full-width maior que widget do dashboard
- Cada etapa: card expandível mostrando leads naquele estágio (nome, temperatura, tempo na etapa)
- Card abaixo: "taxa de perda por etapa"

### `/leads`
- Tabela: Nome, Telefone, Temperatura (badge), Estágio, Agente, Sentimento, Produto, Status
- Busca por nome/telefone (input no topo)
- Filtros: temperatura, estágio, agente, sentimento (dropdowns multi-select)
- Ordenação clicável nos headers
- Paginação server-side (10/25/50 por página)
- Mobile: tabela vira cards empilhados

### `/campanhas`
- Grid de cards (1 por campanha), status badge ativa/pausada
- Cada card: nome, gasto (R$), CPL (R$), ROAS, leads, vendas
- Ativas no topo, pausadas em opacidade reduzida
- Click abre drawer lateral com line chart de performance temporal

### `/relatorios`
- Select de mês/ano
- Preview do relatório em cards por seção
- Botão "Baixar PDF" → chama `/api/relatorios/pdf`
- Loading: "Preparando seu relatório de resultados..."
- PDF (`@react-pdf/renderer`): logo, cores da marca, dados formatados em BR
- Conteúdo: resumo executivo, leads recuperados via remarketing, evolução ROI (3 meses), top 3 campanhas, top 3 objeções, health score médio, horas economizadas

### `/configuracoes`
- Formulário em seções (cards):
  - Metas: ROAS meta, CPL alvo (inputs com R$)
  - Orçamento: limite diário, teto cartão (com warning de impacto)
  - Comunicação: tom de voz (textarea), WhatsApp alertas (input com máscara)
  - Empresa: nome, segmento
- Botão salvar com feedback visual
- Nota: "Alterações aqui impactam o comportamento dos agentes"
- Mock: localStorage, tipado para Supabase update

### `/admin`
- Tabela: empresa, Health Score (cor), ROAS mês, último alerta, status assinatura
- Health Score <60 no topo com fundo `rgba(161,92,92,0.1)`
- Ordenação padrão: pior Health Score primeiro
- Click abre dashboard completo do cliente em modo read-only (reutiliza widgets com `empresaId` prop)
- Sem edição

---

## 6. Formatação Brasil

- Moeda: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`
- Datas: `Intl.DateTimeFormat('pt-BR')` com timezone `America/Sao_Paulo`
- Timestamps relativos: "há 5 min", "há 2h", "ontem"
- Todos os textos da UI em português brasileiro

---

## 7. Regras de Produto

- ROI carrega em <2s após login (Server Component + mock instantâneo)
- Health Score <60 exibe banner em TODAS as páginas autenticadas
- Relatório PDF gerado server-side via API Route
- Layout mobile-first: ROI e Health Score visíveis sem scroll no celular
- Nenhuma chave `service_role` no client-side
- Tom direto, sem jargão, focado em resultado
- Sem mensagens genéricas de loading — usar voz da marca
