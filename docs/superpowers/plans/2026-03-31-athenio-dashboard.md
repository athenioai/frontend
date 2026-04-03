# Athenio.ai Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Athenio.ai client dashboard and admin panel as a Next.js 14+ App Router application with mock data, ready for Supabase swap.

**Architecture:** Service Layer pattern with TypeScript interfaces separating data access from UI. Mock implementations now, swap to Supabase later by changing one import. Server Components for data fetching, Client Components only for interactivity (charts, forms, real-time simulation).

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts, @react-pdf/renderer, Lucide icons

**Design Spec:** `docs/superpowers/specs/2026-03-31-athenio-dashboard-design.md`

**Visual Reference:** Landing page at athenio.ai — dark mode, Space Grotesk + Sora fonts, teal accent `#4FD1C5`

---

## File Map

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── (authenticated)/
│   │   ├── layout.tsx
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
│   │   ├── page.tsx
│   │   └── [empresaId]/
│   │       └── page.tsx
│   └── api/
│       └── relatorios/
│           └── pdf/
│               └── route.ts
├── components/
│   ├── ui/                          # shadcn/ui (auto-generated)
│   ├── widgets/
│   │   ├── roi-card.tsx
│   │   ├── health-score.tsx
│   │   ├── funil-widget.tsx
│   │   ├── ltv-cac.tsx
│   │   ├── top-objecoes.tsx
│   │   ├── economia-tempo.tsx
│   │   ├── atividade-agentes.tsx
│   │   └── feed-alertas.tsx
│   ├── charts/
│   │   ├── gauge-chart.tsx
│   │   ├── funil-chart.tsx
│   │   ├── bar-chart-horizontal.tsx
│   │   └── line-chart-simple.tsx
│   └── layout/
│       ├── sidebar.tsx
│       ├── topbar.tsx
│       └── health-banner.tsx
├── lib/
│   ├── types/
│   │   ├── lead.ts
│   │   ├── campaign.ts
│   │   ├── payment.ts
│   │   ├── conversation.ts
│   │   ├── alert.ts
│   │   ├── empresa.ts
│   │   ├── analytics.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── interfaces/
│   │   │   ├── lead-service.ts
│   │   │   ├── campaign-service.ts
│   │   │   ├── analytics-service.ts
│   │   │   ├── alert-service.ts
│   │   │   ├── empresa-service.ts
│   │   │   ├── admin-service.ts
│   │   │   └── auth-service.ts
│   │   ├── mock/
│   │   │   ├── data.ts
│   │   │   ├── lead-service.ts
│   │   │   ├── campaign-service.ts
│   │   │   ├── analytics-service.ts
│   │   │   ├── alert-service.ts
│   │   │   ├── empresa-service.ts
│   │   │   ├── admin-service.ts
│   │   │   └── auth-service.ts
│   │   └── index.ts
│   ├── utils/
│   │   └── format.ts
│   ├── constants/
│   │   └── theme.ts
│   └── auth/
│       └── middleware.ts
├── middleware.ts
└── styles/
    └── globals.css
```

---

## Task 1: Project Scaffold and Configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `src/styles/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Create Next.js project**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Select defaults when prompted. This creates the full project scaffold.

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
npm install recharts lucide-react @react-pdf/renderer
npm install -D @types/node
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes

- [ ] **Step 4: Install shadcn/ui components**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
npx shadcn@latest add button card input label badge table select dropdown-menu separator sheet dialog tabs toggle-group textarea toast
```

- [ ] **Step 5: Configure globals.css with Athenio theme**

Replace `src/styles/globals.css` (or `src/app/globals.css` depending on create-next-app output) with:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-title: 'Space Grotesk', sans-serif;
  --font-body: 'Sora', sans-serif;

  --color-accent: #4FD1C5;
  --color-accent-light: #81E6D9;
  --color-bg-base: #070C0C;
  --color-bg-elevated: rgba(15, 61, 62, 0.2);
  --color-bg-input: rgba(15, 61, 62, 0.22);
  --color-text-primary: #FFFFFF;
  --color-text-muted: rgba(255, 255, 255, 0.6);
  --color-text-subtle: rgba(255, 255, 255, 0.4);
  --color-border-default: rgba(79, 209, 197, 0.15);
  --color-border-strong: rgba(79, 209, 197, 0.3);
  --color-danger: #E07070;
  --color-danger-bg: rgba(161, 92, 92, 0.15);
  --color-warning: #F6E05E;
  --color-success: #4FD1C5;
}

body {
  font-family: var(--font-body);
  background: var(--color-bg-base);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-title);
}

/* Glassmorphism card */
.glass-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: 1rem;
  padding: 1.75rem;
  transition: transform 0.2s, border-color 0.2s;
}

.glass-card-interactive:hover {
  transform: translateY(-3px);
  border-color: var(--color-border-strong);
}

/* Glow effect for ROI widget */
.glow-accent {
  background: radial-gradient(ellipse at 50% 50%, rgba(79, 209, 197, 0.1) 0%, transparent 70%);
}

/* Float animation for login orbs */
@keyframes float-orb {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.animate-float {
  animation: float-orb 22s ease-in-out infinite;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--color-border-default);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-strong);
}
```

- [ ] **Step 6: Configure root layout with fonts**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Space_Grotesk, Sora } from 'next/font/google'
import '@/styles/globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-title',
  weight: ['400', '500', '600', '700'],
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Athenio.ai — Dashboard',
  description: 'Painel de controle da sua operação com IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`dark ${spaceGrotesk.variable} ${sora.variable}`}>
      <body className="min-h-screen bg-bg-base text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 7: Create root page redirect**

Replace `src/app/page.tsx`:

```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
```

- [ ] **Step 8: Verify dev server starts**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
npm run dev
```

Open `http://localhost:3000` — should redirect to `/dashboard` (404 is expected at this point). Verify dark background and no console errors.

- [ ] **Step 9: Commit**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
git init
echo "node_modules/\n.next/\n.env*.local" > .gitignore
git add .
git commit -m "chore: scaffold Next.js project with Athenio theme"
```

---

## Task 2: Domain Types

**Files:**
- Create: `src/lib/types/lead.ts`, `src/lib/types/campaign.ts`, `src/lib/types/payment.ts`, `src/lib/types/conversation.ts`, `src/lib/types/alert.ts`, `src/lib/types/empresa.ts`, `src/lib/types/analytics.ts`, `src/lib/types/index.ts`

- [ ] **Step 1: Create lead types**

Create `src/lib/types/lead.ts`:

```typescript
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
```

- [ ] **Step 2: Create campaign types**

Create `src/lib/types/campaign.ts`:

```typescript
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
```

- [ ] **Step 3: Create payment types**

Create `src/lib/types/payment.ts`:

```typescript
export interface PaymentLog {
  id: string
  empresa_id: string
  lead_id: string
  valor: number
  status: 'confirmado' | 'pendente' | 'falhou'
  campanha_id: string
  created_at: string
}
```

- [ ] **Step 4: Create conversation types**

Create `src/lib/types/conversation.ts`:

```typescript
export interface Conversation {
  id: string
  empresa_id: string
  lead_id: string
  mensagens_count: number
  duracao_minutos: number
  agente: 'hermes' | 'ares'
  created_at: string
}

export interface ConversationSummary {
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

- [ ] **Step 5: Create alert types**

Create `src/lib/types/alert.ts`:

```typescript
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
```

- [ ] **Step 6: Create empresa types**

Create `src/lib/types/empresa.ts`:

```typescript
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
```

- [ ] **Step 7: Create analytics types**

Create `src/lib/types/analytics.ts`:

```typescript
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
```

- [ ] **Step 8: Create barrel export**

Create `src/lib/types/index.ts`:

```typescript
export * from './lead'
export * from './campaign'
export * from './payment'
export * from './conversation'
export * from './alert'
export * from './empresa'
export * from './analytics'
```

- [ ] **Step 9: Verify types compile**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 10: Commit**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
git add src/lib/types/
git commit -m "feat: add domain types for all entities"
```

---

## Task 3: Utilities and Constants

**Files:**
- Create: `src/lib/utils/format.ts`, `src/lib/constants/theme.ts`
- Test: `src/lib/utils/__tests__/format.test.ts`

- [ ] **Step 1: Install test runner**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Add to `package.json` scripts:

```json
"test": "vitest",
"test:run": "vitest run"
```

Create `vitest.config.ts` at project root:

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 2: Write failing tests for format utils**

Create `src/lib/utils/__tests__/format.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatRelativeTime, formatPercent, formatNumber } from '../format'

describe('formatCurrency', () => {
  it('formats BRL currency', () => {
    expect(formatCurrency(1234.5)).toBe('R$ 1.234,50')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00')
  })
})

describe('formatDate', () => {
  it('formats date in pt-BR', () => {
    const result = formatDate('2026-03-15T10:00:00Z')
    expect(result).toContain('15')
    expect(result).toContain('03')
    expect(result).toContain('2026')
  })
})

describe('formatRelativeTime', () => {
  it('returns "agora" for less than 1 minute', () => {
    const now = new Date()
    expect(formatRelativeTime(now.toISOString())).toBe('agora')
  })

  it('returns minutes for recent times', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelativeTime(fiveMinAgo.toISOString())).toBe('há 5 min')
  })

  it('returns hours for older times', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    expect(formatRelativeTime(twoHoursAgo.toISOString())).toBe('há 2h')
  })

  it('returns "ontem" for yesterday', () => {
    const yesterday = new Date(Date.now() - 26 * 60 * 60 * 1000)
    expect(formatRelativeTime(yesterday.toISOString())).toBe('ontem')
  })

  it('returns date for older than 2 days', () => {
    const old = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    const result = formatRelativeTime(old.toISOString())
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })
})

describe('formatPercent', () => {
  it('formats percentage', () => {
    expect(formatPercent(0.856)).toBe('85,6%')
  })
})

describe('formatNumber', () => {
  it('formats large numbers in pt-BR', () => {
    expect(formatNumber(1500)).toBe('1.500')
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
npm test -- --run
```

Expected: all tests FAIL (module not found).

- [ ] **Step 4: Implement format utils**

Create `src/lib/utils/format.ts`:

```typescript
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const numberFormatter = new Intl.NumberFormat('pt-BR')

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1,
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value)
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function formatRelativeTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `há ${diffMin} min`
  if (diffHours < 24) return `há ${diffHours}h`
  if (diffDays < 2) return 'ontem'
  return dateFormatter.format(new Date(iso))
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
npm test -- --run
```

Expected: all tests PASS.

- [ ] **Step 6: Create theme constants**

Create `src/lib/constants/theme.ts`:

```typescript
export const COLORS = {
  accent: '#4FD1C5',
  accentLight: '#81E6D9',
  bgBase: '#070C0C',
  bgElevated: 'rgba(15, 61, 62, 0.2)',
  danger: '#E07070',
  dangerBg: 'rgba(161, 92, 92, 0.15)',
  warning: '#F6E05E',
  success: '#4FD1C5',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textSubtle: 'rgba(255, 255, 255, 0.4)',
  border: 'rgba(79, 209, 197, 0.15)',
  borderStrong: 'rgba(79, 209, 197, 0.3)',
  gridSubtle: 'rgba(255, 255, 255, 0.05)',
} as const

export const CHART_COLORS = {
  primary: '#4FD1C5',
  secondary: '#81E6D9',
  tertiary: '#0F3D3E',
  grid: 'rgba(255, 255, 255, 0.05)',
  tooltipBg: '#0C1818',
} as const

export const ALERT_ICONS: Record<string, string> = {
  venda: 'DollarSign',
  campanha_pausada: 'Pause',
  campanha_escalada: 'TrendingUp',
  baleia: 'Star',
  humano_solicitado: 'User',
  anomalia: 'Shield',
} as const

export const TEMPERATURA_COLORS = {
  frio: '#60A5FA',
  morno: '#F6E05E',
  quente: '#E07070',
} as const

export const HEALTH_SCORE_COLORS = {
  good: '#4FD1C5',
  warning: '#F6E05E',
  danger: '#E07070',
} as const

export function getHealthScoreColor(score: number): string {
  if (score > 80) return HEALTH_SCORE_COLORS.good
  if (score >= 60) return HEALTH_SCORE_COLORS.warning
  return HEALTH_SCORE_COLORS.danger
}
```

- [ ] **Step 7: Commit**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
git add src/lib/utils/ src/lib/constants/ vitest.config.ts
git commit -m "feat: add format utilities and theme constants with tests"
```

---

## Task 4: Service Layer — Interfaces

**Files:**
- Create: `src/lib/services/interfaces/lead-service.ts`, `src/lib/services/interfaces/campaign-service.ts`, `src/lib/services/interfaces/analytics-service.ts`, `src/lib/services/interfaces/alert-service.ts`, `src/lib/services/interfaces/empresa-service.ts`, `src/lib/services/interfaces/admin-service.ts`, `src/lib/services/interfaces/auth-service.ts`

- [ ] **Step 1: Create lead service interface**

Create `src/lib/services/interfaces/lead-service.ts`:

```typescript
import type { Lead, LeadFilters, FunilStats, ObjecaoCount } from '@/lib/types'

export interface ILeadService {
  getAll(empresaId: string, filters?: LeadFilters): Promise<Lead[]>
  getById(id: string): Promise<Lead | null>
  getFunilStats(empresaId: string, periodo: '1d' | '7d' | '30d'): Promise<FunilStats>
  getTopObjecoes(empresaId: string): Promise<ObjecaoCount[]>
}
```

- [ ] **Step 2: Create campaign service interface**

Create `src/lib/services/interfaces/campaign-service.ts`:

```typescript
import type { Campaign, CampaignPerformance, RoiTotal } from '@/lib/types'

export interface ICampaignService {
  getAll(empresaId: string): Promise<Campaign[]>
  getRoiTotal(empresaId: string): Promise<RoiTotal>
  getPerformance(campaignId: string): Promise<CampaignPerformance[]>
}
```

- [ ] **Step 3: Create analytics service interface**

Create `src/lib/services/interfaces/analytics-service.ts`:

```typescript
import type { HealthScoreData, LtvCacData, AgentesAtividade } from '@/lib/types'

export interface IAnalyticsService {
  getHealthScore(empresaId: string): Promise<HealthScoreData>
  getLtvCac(empresaId: string): Promise<LtvCacData>
  getEconomiaHoras(empresaId: string): Promise<{ horas: number }>
  getAtividadeAgentes(empresaId: string): Promise<AgentesAtividade>
}
```

- [ ] **Step 4: Create alert service interface**

Create `src/lib/services/interfaces/alert-service.ts`:

```typescript
import type { Alert } from '@/lib/types'

export interface IAlertService {
  getRecentes(empresaId: string, limit?: number): Promise<Alert[]>
}
```

- [ ] **Step 5: Create empresa service interface**

Create `src/lib/services/interfaces/empresa-service.ts`:

```typescript
import type { Empresa } from '@/lib/types'

export interface IEmpresaService {
  getById(empresaId: string): Promise<Empresa | null>
  updateConfig(empresaId: string, data: Partial<Empresa>): Promise<Empresa>
}
```

- [ ] **Step 6: Create admin service interface**

Create `src/lib/services/interfaces/admin-service.ts`:

```typescript
import type { EmpresaResumo } from '@/lib/types'

export interface IAdminService {
  getAllEmpresas(): Promise<EmpresaResumo[]>
}
```

- [ ] **Step 7: Create auth service interface**

Create `src/lib/services/interfaces/auth-service.ts`:

```typescript
export interface AuthUser {
  id: string
  email: string
  empresa_id: string
  role: 'client' | 'admin'
  nome: string
}

export interface IAuthService {
  login(email: string, password: string): Promise<AuthUser>
  logout(): Promise<void>
  getSession(): Promise<AuthUser | null>
}
```

- [ ] **Step 8: Verify types compile**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
git add src/lib/services/interfaces/
git commit -m "feat: add service layer interfaces"
```

---

## Task 5: Service Layer — Mock Data and Implementations

**Files:**
- Create: `src/lib/services/mock/data.ts`, `src/lib/services/mock/lead-service.ts`, `src/lib/services/mock/campaign-service.ts`, `src/lib/services/mock/analytics-service.ts`, `src/lib/services/mock/alert-service.ts`, `src/lib/services/mock/empresa-service.ts`, `src/lib/services/mock/admin-service.ts`, `src/lib/services/mock/auth-service.ts`, `src/lib/services/index.ts`

- [ ] **Step 1: Create mock data**

Create `src/lib/services/mock/data.ts`:

```typescript
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

export const mockAlerts: Alert[] = [
  { id: 'alt-001', empresa_id: 'emp-001', tipo: 'venda', descricao: 'Venda confirmada: Fernanda Costa — Plano Premium Anual (R$ 2.970)', created_at: '2026-03-31T10:30:00Z' },
  { id: 'alt-002', empresa_id: 'emp-001', tipo: 'baleia', descricao: 'Lead de alto valor detectado: Carlos Silva (score 88)', created_at: '2026-03-31T10:15:00Z' },
  { id: 'alt-003', empresa_id: 'emp-001', tipo: 'campanha_pausada', descricao: 'Campanha "Imagem Promo - Básico" pausada por CPA acima do limite', created_at: '2026-03-31T09:00:00Z' },
  { id: 'alt-004', empresa_id: 'emp-001', tipo: 'campanha_escalada', descricao: 'Campanha "Video Depoimentos" escalada +15% — ROAS acima da meta', created_at: '2026-03-31T08:30:00Z' },
  { id: 'alt-005', empresa_id: 'emp-001', tipo: 'humano_solicitado', descricao: 'Marcos Oliveira pediu para falar com um humano — sentimento negativo', created_at: '2026-03-31T08:00:00Z' },
  { id: 'alt-006', empresa_id: 'emp-001', tipo: 'anomalia', descricao: 'Padrão suspeito detectado: 12 mensagens em 30s do número +5511900000000', created_at: '2026-03-30T23:00:00Z' },
  { id: 'alt-007', empresa_id: 'emp-001', tipo: 'venda', descricao: 'Venda confirmada: Ricardo Tavares — Plano Básico Mensal (R$ 497)', created_at: '2026-03-30T14:00:00Z' },
]
```

- [ ] **Step 2: Implement mock lead service**

Create `src/lib/services/mock/lead-service.ts`:

```typescript
import type { ILeadService } from '../interfaces/lead-service'
import type { Lead, LeadFilters, FunilStats, ObjecaoCount } from '@/lib/types'
import { mockLeads } from './data'

export class MockLeadService implements ILeadService {
  async getAll(empresaId: string, filters?: LeadFilters): Promise<Lead[]> {
    let leads = mockLeads.filter((l) => l.empresa_id === empresaId)

    if (filters?.busca) {
      const q = filters.busca.toLowerCase()
      leads = leads.filter(
        (l) => l.nome.toLowerCase().includes(q) || l.telefone.includes(q)
      )
    }
    if (filters?.temperatura?.length) {
      leads = leads.filter((l) => filters.temperatura!.includes(l.temperatura))
    }
    if (filters?.estagio_funil?.length) {
      leads = leads.filter((l) => filters.estagio_funil!.includes(l.estagio_funil))
    }
    if (filters?.agente_responsavel?.length) {
      leads = leads.filter((l) => filters.agente_responsavel!.includes(l.agente_responsavel))
    }
    if (filters?.sentimento?.length) {
      leads = leads.filter((l) => filters.sentimento!.includes(l.sentimento))
    }
    if (filters?.sort_by) {
      const key = filters.sort_by
      const dir = filters.sort_order === 'desc' ? -1 : 1
      leads.sort((a, b) => {
        const av = a[key], bv = b[key]
        if (av == null) return 1
        if (bv == null) return -1
        return av < bv ? -dir : av > bv ? dir : 0
      })
    }
    if (filters?.page && filters?.per_page) {
      const start = (filters.page - 1) * filters.per_page
      leads = leads.slice(start, start + filters.per_page)
    }

    return leads
  }

  async getById(id: string): Promise<Lead | null> {
    return mockLeads.find((l) => l.id === id) ?? null
  }

  async getFunilStats(_empresaId: string, _periodo: '1d' | '7d' | '30d'): Promise<FunilStats> {
    return {
      captados: 330,
      qualificados: 145,
      negociacao: 58,
      convertidos: 28,
      taxas: {
        captado_qualificado: 0.439,
        qualificado_negociacao: 0.4,
        negociacao_convertido: 0.483,
      },
    }
  }

  async getTopObjecoes(_empresaId: string): Promise<ObjecaoCount[]> {
    return [
      { objecao: 'Preço', count: 42 },
      { objecao: 'Prazo', count: 28 },
      { objecao: 'Desconfiança', count: 19 },
      { objecao: 'Não entendeu o produto', count: 15 },
      { objecao: 'Concorrente', count: 11 },
    ]
  }
}
```

- [ ] **Step 3: Implement mock campaign service**

Create `src/lib/services/mock/campaign-service.ts`:

```typescript
import type { ICampaignService } from '../interfaces/campaign-service'
import type { Campaign, CampaignPerformance, RoiTotal } from '@/lib/types'
import { mockCampaigns } from './data'

export class MockCampaignService implements ICampaignService {
  async getAll(empresaId: string): Promise<Campaign[]> {
    return mockCampaigns.filter((c) => c.empresa_id === empresaId)
  }

  async getRoiTotal(_empresaId: string): Promise<RoiTotal> {
    const investido = 5201.30
    const retorno = 18467.00
    return { investido, retorno, roas: retorno / investido }
  }

  async getPerformance(_campaignId: string): Promise<CampaignPerformance[]> {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(2026, 2, 18 + i)
      return {
        data: d.toISOString().split('T')[0],
        gasto: 100 + Math.random() * 200,
        leads: Math.floor(5 + Math.random() * 15),
        vendas: Math.floor(Math.random() * 4),
        roas: 1.5 + Math.random() * 4,
      }
    })
    return days
  }
}
```

- [ ] **Step 4: Implement mock analytics service**

Create `src/lib/services/mock/analytics-service.ts`:

```typescript
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
        { lead_id: 'lead-004', nome: 'Fernanda Costa', valor_total: 11880, meses_ativo: 4 },
        { lead_id: 'lead-009', nome: 'Ricardo Tavares', valor_total: 1988, meses_ativo: 4 },
        { lead_id: 'l-old-1', nome: 'João Paulo', valor_total: 8910, meses_ativo: 6 },
        { lead_id: 'l-old-2', nome: 'Maria Helena', valor_total: 5940, meses_ativo: 3 },
        { lead_id: 'l-old-3', nome: 'André Lima', valor_total: 2985, meses_ativo: 2 },
      ],
    }
  }

  async getEconomiaHoras(_empresaId: string): Promise<{ horas: number }> {
    return { horas: 187 }
  }

  async getAtividadeAgentes(_empresaId: string): Promise<AgentesAtividade> {
    return {
      hermes: {
        campanhas_ativas: 2,
        leads_nutricao: 45,
        ultimo_criativo: 'Carrossel "5 motivos para começar agora"',
        proximo_ciclo: '15min',
      },
      ares: {
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
```

- [ ] **Step 5: Implement mock alert service**

Create `src/lib/services/mock/alert-service.ts`:

```typescript
import type { IAlertService } from '../interfaces/alert-service'
import type { Alert } from '@/lib/types'
import { mockAlerts } from './data'

export class MockAlertService implements IAlertService {
  async getRecentes(empresaId: string, limit = 20): Promise<Alert[]> {
    return mockAlerts
      .filter((a) => a.empresa_id === empresaId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }
}
```

- [ ] **Step 6: Implement mock empresa service**

Create `src/lib/services/mock/empresa-service.ts`:

```typescript
import type { IEmpresaService } from '../interfaces/empresa-service'
import type { Empresa } from '@/lib/types'
import { mockEmpresas } from './data'

export class MockEmpresaService implements IEmpresaService {
  async getById(empresaId: string): Promise<Empresa | null> {
    return mockEmpresas.find((e) => e.id === empresaId) ?? null
  }

  async updateConfig(empresaId: string, data: Partial<Empresa>): Promise<Empresa> {
    const empresa = mockEmpresas.find((e) => e.id === empresaId)
    if (!empresa) throw new Error('Empresa não encontrada')
    return { ...empresa, ...data }
  }
}
```

- [ ] **Step 7: Implement mock admin service**

Create `src/lib/services/mock/admin-service.ts`:

```typescript
import type { IAdminService } from '../interfaces/admin-service'
import type { EmpresaResumo } from '@/lib/types'
import { mockEmpresas, mockAlerts } from './data'

export class MockAdminService implements IAdminService {
  async getAllEmpresas(): Promise<EmpresaResumo[]> {
    return mockEmpresas.map((e) => {
      const lastAlert = mockAlerts
        .filter((a) => a.empresa_id === e.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

      return {
        id: e.id,
        nome: e.nome,
        health_score: e.health_score,
        roas_mes: e.id === 'emp-001' ? 3.55 : e.id === 'emp-002' ? 1.8 : 6.2,
        ultimo_alerta: lastAlert?.created_at ?? null,
        assinatura_status: e.assinatura_status,
      }
    })
  }
}
```

- [ ] **Step 8: Implement mock auth service**

Create `src/lib/services/mock/auth-service.ts`:

```typescript
import type { IAuthService, AuthUser } from '../interfaces/auth-service'
import { cookies } from 'next/headers'
import { MOCK_EMPRESA_ID } from './data'

const COOKIE_NAME = 'athenio-session'

const mockUsers: AuthUser[] = [
  { id: 'user-001', email: 'cliente@techfit.com', empresa_id: MOCK_EMPRESA_ID, role: 'client', nome: 'João TechFit' },
  { id: 'user-admin', email: 'admin@athenio.ai', empresa_id: MOCK_EMPRESA_ID, role: 'admin', nome: 'Admin Athenio' },
]

export class MockAuthService implements IAuthService {
  async login(email: string, _password: string): Promise<AuthUser> {
    const isAdmin = email.includes('admin') || email.includes('athenio')
    const user: AuthUser = isAdmin ? mockUsers[1] : { ...mockUsers[0], email }
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, JSON.stringify(user), {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return user
  }

  async logout(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
  }

  async getSession(): Promise<AuthUser | null> {
    const cookieStore = await cookies()
    const session = cookieStore.get(COOKIE_NAME)
    if (!session?.value) return null
    try {
      return JSON.parse(session.value) as AuthUser
    } catch {
      return null
    }
  }
}
```

- [ ] **Step 9: Create service barrel export**

Create `src/lib/services/index.ts`:

```typescript
import { MockLeadService } from './mock/lead-service'
import { MockCampaignService } from './mock/campaign-service'
import { MockAnalyticsService } from './mock/analytics-service'
import { MockAlertService } from './mock/alert-service'
import { MockEmpresaService } from './mock/empresa-service'
import { MockAdminService } from './mock/admin-service'
import { MockAuthService } from './mock/auth-service'

// Swap these imports to Supabase implementations when ready.
// Components that consume these services won't need any changes.

export const leadService = new MockLeadService()
export const campaignService = new MockCampaignService()
export const analyticsService = new MockAnalyticsService()
export const alertService = new MockAlertService()
export const empresaService = new MockEmpresaService()
export const adminService = new MockAdminService()
export const authService = new MockAuthService()
```

- [ ] **Step 10: Verify types compile**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 11: Commit**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
git add src/lib/services/
git commit -m "feat: add mock service layer with realistic data"
```

---

## Task 6: Auth Middleware and Login Page

**Files:**
- Create: `src/middleware.ts`, `src/app/login/page.tsx`, `src/app/login/actions.ts`

- [ ] **Step 1: Create Next.js middleware**

Create `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('athenio-session')

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (session?.value) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  if (!session?.value) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname.startsWith('/admin')) {
    try {
      const user = JSON.parse(session.value)
      if (user.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 2: Create login server actions**

Create `src/app/login/actions.ts`:

```typescript
'use server'

import { redirect } from 'next/navigation'
import { authService } from '@/lib/services'

export async function loginAction(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Preencha todos os campos.' }
  }

  try {
    await authService.login(email, password)
  } catch {
    return { error: 'Credenciais não conferem. Tente novamente.' }
  }

  redirect('/dashboard')
}
```

- [ ] **Step 3: Create login page**

Create `src/app/login/page.tsx`:

```tsx
'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(79,209,197,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(79,209,197,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating orbs */}
      <div className="animate-float pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
      <div className="animate-float pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-accent/5 blur-3xl" style={{ animationDelay: '11s' }} />

      <div className="glass-card relative z-10 w-full max-w-md p-10">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img
            src="https://athenio.ai/public/assets/logo-full.svg"
            alt="Athenio.ai"
            className="h-10"
          />
        </div>

        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-text-muted">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              className="border-border-default bg-bg-input text-text-primary placeholder:text-text-subtle focus:border-accent focus:bg-[rgba(79,209,197,0.05)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-text-muted">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="border-border-default bg-bg-input text-text-primary placeholder:text-text-subtle focus:border-accent focus:bg-[rgba(79,209,197,0.05)]"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-danger">{state.error}</p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-accent py-3 font-semibold text-[#070C0C] shadow-[0_0_40px_rgba(79,209,197,0.3)] transition-transform hover:-translate-y-0.5 hover:bg-accent-light disabled:opacity-50"
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify login flow works**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
npm run dev
```

1. Open `http://localhost:3000` — should redirect to `/login`
2. Enter any email + password and submit
3. Should redirect to `/dashboard` (404 expected — page not built yet)
4. Check cookie `athenio-session` exists in browser DevTools

- [ ] **Step 5: Commit**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
git add src/middleware.ts src/app/login/
git commit -m "feat: add login page with mock auth and middleware"
```

---

## Task 7: Authenticated Layout (Sidebar, Topbar, Health Banner)

**Files:**
- Create: `src/components/layout/sidebar.tsx`, `src/components/layout/topbar.tsx`, `src/components/layout/health-banner.tsx`, `src/app/(authenticated)/layout.tsx`

- [ ] **Step 1: Create sidebar**

Create `src/components/layout/sidebar.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, GitBranch, Users, Megaphone, FileText, Settings, Shield } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/funil', label: 'Funil', icon: GitBranch },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/campanhas', label: 'Campanhas', icon: Megaphone },
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col border-r border-border-default bg-bg-base lg:flex">
      <div className="flex h-16 items-center px-6">
        <img
          src="https://athenio.ai/public/assets/logo-full.svg"
          alt="Athenio.ai"
          className="h-7"
        />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-l-[3px] border-accent bg-accent/5 text-accent'
                  : 'text-text-muted hover:bg-accent/5 hover:text-text-primary'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <div className="my-3 border-t border-border-default" />
            <Link
              href="/admin"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname.startsWith('/admin')
                  ? 'border-l-[3px] border-accent bg-accent/5 text-accent'
                  : 'text-text-muted hover:bg-accent/5 hover:text-text-primary'
              }`}
            >
              <Shield className="h-4 w-4 shrink-0" />
              Admin
            </Link>
          </>
        )}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Create topbar**

Create `src/components/layout/topbar.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './sidebar'

export function Topbar({ userName, isAdmin }: { userName: string; isAdmin: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-default bg-bg-base/80 px-4 backdrop-blur-sm lg:pl-64">
      {/* Mobile menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="text-text-muted hover:text-text-primary">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 border-border-default bg-bg-base p-0">
          <Sidebar isAdmin={isAdmin} />
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-4">
        <span className="text-sm text-text-muted">{userName}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-text-muted hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Create logout API route**

Create `src/app/api/auth/logout/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { authService } from '@/lib/services'

export async function POST() {
  await authService.logout()
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Create health banner**

Create `src/components/layout/health-banner.tsx`:

```tsx
import { AlertTriangle } from 'lucide-react'

interface HealthBannerProps {
  score: number
  motivo?: string
  acao?: string
}

export function HealthBanner({ score, motivo, acao }: HealthBannerProps) {
  if (score >= 60) return null

  return (
    <div className="border-b border-danger/30 bg-danger-bg px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
        <div>
          <p className="text-sm font-semibold text-danger">
            Health Score em {score} — sua operacao precisa de atencao
          </p>
          {motivo && <p className="mt-1 text-xs text-text-muted">{motivo}</p>}
          {acao && <p className="mt-0.5 text-xs text-accent">{acao}</p>}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create authenticated layout**

Create `src/app/(authenticated)/layout.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { authService, analyticsService } from '@/lib/services'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { HealthBanner } from '@/components/layout/health-banner'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const health = await analyticsService.getHealthScore(user.empresa_id)

  return (
    <div className="min-h-screen">
      <Sidebar isAdmin={user.role === 'admin'} />
      <div className="lg:pl-60">
        <Topbar userName={user.nome} isAdmin={user.role === 'admin'} />
        <HealthBanner
          score={health.score}
          motivo={health.motivo_alerta}
          acao={health.acao_recomendada}
        />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Verify layout renders**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
npm run dev
```

Create a placeholder `src/app/(authenticated)/dashboard/page.tsx`:

```tsx
export default function DashboardPage() {
  return <h1 className="font-title text-2xl font-bold">Dashboard</h1>
}
```

1. Login at `/login`
2. Should see sidebar, topbar, and "Dashboard" text
3. Mobile: resize browser — sidebar should become hamburger menu

- [ ] **Step 7: Commit**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
git add src/components/layout/ src/app/\(authenticated\)/layout.tsx src/app/api/auth/
git commit -m "feat: add authenticated layout with sidebar, topbar, health banner"
```

---

## Task 8: Chart Components

**Files:**
- Create: `src/components/charts/gauge-chart.tsx`, `src/components/charts/funil-chart.tsx`, `src/components/charts/bar-chart-horizontal.tsx`, `src/components/charts/line-chart-simple.tsx`

- [ ] **Step 1: Create gauge chart**

Create `src/components/charts/gauge-chart.tsx`:

```tsx
'use client'

import { PieChart, Pie, Cell } from 'recharts'
import { getHealthScoreColor } from '@/lib/constants/theme'

interface GaugeChartProps {
  value: number
  size?: number
}

export function GaugeChart({ value, size = 200 }: GaugeChartProps) {
  const color = getHealthScoreColor(value)
  const data = [
    { value: value },
    { value: 100 - value },
  ]

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          cx={size / 2}
          cy={size / 2}
          startAngle={180}
          endAngle={0}
          innerRadius={size * 0.32}
          outerRadius={size * 0.42}
          dataKey="value"
          stroke="none"
        >
          <Cell fill={color} />
          <Cell fill="rgba(255,255,255,0.05)" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex items-end justify-center pb-2">
        <span className="font-title text-3xl font-bold" style={{ color }}>
          {value}
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create funil chart**

Create `src/components/charts/funil-chart.tsx`:

```tsx
'use client'

import { CHART_COLORS } from '@/lib/constants/theme'
import { formatNumber, formatPercent } from '@/lib/utils/format'
import type { FunilStats } from '@/lib/types'

interface FunilChartProps {
  stats: FunilStats
  compact?: boolean
}

const STAGES = [
  { key: 'captados', label: 'Leads Captados' },
  { key: 'qualificados', label: 'Qualificados' },
  { key: 'negociacao', label: 'Em Negociação' },
  { key: 'convertidos', label: 'Convertidos' },
] as const

const STAGE_COLORS = ['#4FD1C5', '#3BBEB2', '#27A89C', '#0F3D3E']

export function FunilChart({ stats, compact = false }: FunilChartProps) {
  const max = stats.captados || 1
  const taxas = [
    stats.taxas.captado_qualificado,
    stats.taxas.qualificado_negociacao,
    stats.taxas.negociacao_convertido,
  ]

  return (
    <div className="space-y-3">
      {STAGES.map((stage, i) => {
        const value = stats[stage.key]
        const width = Math.max((value / max) * 100, 15)

        return (
          <div key={stage.key}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className={`font-medium text-text-muted ${compact ? 'text-xs' : 'text-sm'}`}>
                {stage.label}
              </span>
              <span className={`font-title font-bold text-text-primary ${compact ? 'text-sm' : 'text-lg'}`}>
                {formatNumber(value)}
              </span>
            </div>
            <div className="h-8 overflow-hidden rounded-lg bg-white/5">
              <div
                className="flex h-full items-center rounded-lg px-3 transition-all duration-500"
                style={{ width: `${width}%`, background: STAGE_COLORS[i] }}
              />
            </div>
            {i < taxas.length && (
              <p className="mt-1 text-right text-xs text-text-subtle">
                {formatPercent(taxas[i])} para próxima etapa
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Create horizontal bar chart**

Create `src/components/charts/bar-chart-horizontal.tsx`:

```tsx
'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { CHART_COLORS } from '@/lib/constants/theme'

interface BarChartHorizontalProps {
  data: { label: string; value: number }[]
  height?: number
}

export function BarChartHorizontal({ data, height = 250 }: BarChartHorizontalProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={140}
          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 13 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: CHART_COLORS.tooltipBg,
            border: `1px solid ${CHART_COLORS.primary}33`,
            borderRadius: 8,
            color: '#fff',
          }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? CHART_COLORS.primary : CHART_COLORS.secondary} fillOpacity={1 - i * 0.12} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 4: Create line chart**

Create `src/components/charts/line-chart-simple.tsx`:

```tsx
'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { CHART_COLORS } from '@/lib/constants/theme'

interface LineChartSimpleProps {
  data: Record<string, unknown>[]
  xKey: string
  yKey: string
  height?: number
}

export function LineChartSimple({ data, xKey, yKey, height = 250 }: LineChartSimpleProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: 10, right: 10 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
        <XAxis
          dataKey={xKey}
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: CHART_COLORS.tooltipBg,
            border: `1px solid ${CHART_COLORS.primary}33`,
            borderRadius: 8,
            color: '#fff',
          }}
        />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          dot={{ fill: CHART_COLORS.primary, r: 3 }}
          activeDot={{ r: 5, fill: CHART_COLORS.secondary }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 5: Commit**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
git add src/components/charts/
git commit -m "feat: add reusable chart components (gauge, funil, bar, line)"
```

---

## Task 9: Dashboard Widgets

**Files:**
- Create: `src/components/widgets/roi-card.tsx`, `src/components/widgets/health-score.tsx`, `src/components/widgets/funil-widget.tsx`, `src/components/widgets/ltv-cac.tsx`, `src/components/widgets/top-objecoes.tsx`, `src/components/widgets/economia-tempo.tsx`, `src/components/widgets/atividade-agentes.tsx`, `src/components/widgets/feed-alertas.tsx`

- [ ] **Step 1: Create ROI widget**

Create `src/components/widgets/roi-card.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils/format'
import type { RoiTotal } from '@/lib/types'

export function RoiCard({ initial }: { initial: RoiTotal }) {
  const [roi, setRoi] = useState(initial)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRoi((prev) => ({
        ...prev,
        retorno: prev.retorno + Math.random() * 50,
        roas: (prev.retorno + Math.random() * 50) / prev.investido,
      }))
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass-card relative overflow-hidden">
      <div className="glow-accent absolute inset-0" />
      <div className="relative text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
          Retorno sobre investimento
        </p>
        <p className="font-title text-[clamp(34px,5.5vw,68px)] font-bold leading-none text-accent">
          {roi.roas.toFixed(1)}x
        </p>
        <p className="mt-4 text-base text-text-muted">
          Para cada{' '}
          <span className="font-semibold text-text-primary">R$ 1,00</span>{' '}
          investido em anúncio, a Athenio retornou{' '}
          <span className="font-semibold text-accent">{formatCurrency(roi.roas)}</span>{' '}
          em vendas
        </p>
        <div className="mt-4 flex justify-center gap-8 text-sm text-text-subtle">
          <span>Investido: {formatCurrency(roi.investido)}</span>
          <span>Retorno: {formatCurrency(roi.retorno)}</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create health score widget**

Create `src/components/widgets/health-score.tsx`:

```tsx
'use client'

import { GaugeChart } from '@/components/charts/gauge-chart'
import { Activity, TrendingUp, Zap } from 'lucide-react'
import { formatPercent } from '@/lib/utils/format'
import type { HealthScoreData } from '@/lib/types'

export function HealthScoreWidget({ data }: { data: HealthScoreData }) {
  const indicators = [
    {
      icon: Activity,
      label: 'Volume msgs',
      value: `${data.volume_mensagens.atual}`,
      change: `${data.volume_mensagens.variacao_percent > 0 ? '+' : ''}${data.volume_mensagens.variacao_percent.toFixed(1)}%`,
      positive: data.volume_mensagens.variacao_percent > 0,
    },
    {
      icon: TrendingUp,
      label: 'Taxa conversão',
      value: formatPercent(data.taxa_conversao),
      change: null,
      positive: true,
    },
    {
      icon: Zap,
      label: 'Latência',
      value: `${(data.latencia_media_ms / 1000).toFixed(1)}s`,
      change: null,
      positive: data.latencia_media_ms < 2000,
    },
  ]

  return (
    <div className="glass-card flex flex-col items-center">
      <p className="mb-3 text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
        Health Score
      </p>
      <GaugeChart value={data.score} />
      <div className="mt-4 grid w-full grid-cols-3 gap-3">
        {indicators.map(({ icon: Icon, label, value, change, positive }) => (
          <div key={label} className="text-center">
            <Icon className="mx-auto mb-1 h-4 w-4 text-text-subtle" />
            <p className="text-xs text-text-subtle">{label}</p>
            <p className="font-title text-sm font-bold text-text-primary">{value}</p>
            {change && (
              <p className={`text-xs ${positive ? 'text-success' : 'text-danger'}`}>{change}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create funil widget**

Create `src/components/widgets/funil-widget.tsx`:

```tsx
import { FunilChart } from '@/components/charts/funil-chart'
import type { FunilStats } from '@/lib/types'

export function FunilWidget({ stats }: { stats: FunilStats }) {
  return (
    <div className="glass-card">
      <p className="mb-4 text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
        Funil de Vendas
      </p>
      <FunilChart stats={stats} compact />
    </div>
  )
}
```

- [ ] **Step 4: Create LTV/CAC widget**

Create `src/components/widgets/ltv-cac.tsx`:

```tsx
'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils/format'
import { CHART_COLORS } from '@/lib/constants/theme'
import type { LtvCacData } from '@/lib/types'

export function LtvCacWidget({ data }: { data: LtvCacData }) {
  return (
    <div className="glass-card">
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-subtle">LTV Médio</p>
          <p className="font-title text-2xl font-bold text-accent">{formatCurrency(data.ltv)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-subtle">CAC</p>
          <p className="font-title text-2xl font-bold text-text-primary">{formatCurrency(data.cac)}</p>
        </div>
      </div>

      <p className="mb-2 text-xs text-text-subtle">LTV individual — últimos clientes</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data.historico}>
          <XAxis
            dataKey="nome"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={40}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: CHART_COLORS.tooltipBg,
              border: `1px solid ${CHART_COLORS.primary}33`,
              borderRadius: 8,
              color: '#fff',
              fontSize: 12,
            }}
            formatter={(value: number) => [formatCurrency(value), 'LTV']}
          />
          <Bar dataKey="valor_total" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 5: Create top objecoes widget**

Create `src/components/widgets/top-objecoes.tsx`:

```tsx
import { BarChartHorizontal } from '@/components/charts/bar-chart-horizontal'
import type { ObjecaoCount } from '@/lib/types'

export function TopObjecoesWidget({ data }: { data: ObjecaoCount[] }) {
  const chartData = data.map((d) => ({ label: d.objecao, value: d.count }))

  return (
    <div className="glass-card">
      <p className="mb-4 text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
        Top Objeções dos Leads
      </p>
      <BarChartHorizontal data={chartData} height={200} />
    </div>
  )
}
```

- [ ] **Step 6: Create economia de tempo widget**

Create `src/components/widgets/economia-tempo.tsx`:

```tsx
import { Clock } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'

export function EconomiaTempoWidget({ horas }: { horas: number }) {
  return (
    <div className="glass-card flex items-center gap-6">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/10">
        <Clock className="h-7 w-7 text-accent" />
      </div>
      <div>
        <p className="text-sm text-text-muted">Este mês, a Athenio economizou</p>
        <p className="font-title text-3xl font-bold text-accent">
          {formatNumber(horas)} horas
        </p>
        <p className="text-sm text-text-subtle">de trabalho humano</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create atividade agentes widget**

Create `src/components/widgets/atividade-agentes.tsx`:

```tsx
import { Megaphone, MessageSquare, Brain } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import type { AgentesAtividade } from '@/lib/types'

export function AtividadeAgentesWidget({ data }: { data: AgentesAtividade }) {
  const agents = [
    {
      nome: 'Hermes',
      subtitulo: 'Marketing',
      icon: Megaphone,
      status: 'ativo',
      metricas: [
        { label: 'Campanhas ativas', value: data.hermes.campanhas_ativas },
        { label: 'Leads em nutrição', value: data.hermes.leads_nutricao },
        { label: 'Último criativo', value: data.hermes.ultimo_criativo },
        { label: 'Próximo ciclo', value: data.hermes.proximo_ciclo },
      ],
    },
    {
      nome: 'Ares',
      subtitulo: 'Comercial',
      icon: MessageSquare,
      status: 'ativo',
      metricas: [
        { label: 'Conversas ativas', value: data.ares.conversas_ativas },
        { label: 'Vendas hoje', value: data.ares.vendas_hoje },
        { label: 'Follow-ups agendados', value: data.ares.followups_agendados },
        { label: 'Aguardando resposta', value: data.ares.leads_aguardando },
      ],
    },
    {
      nome: 'Athena',
      subtitulo: 'Orquestrador',
      icon: Brain,
      status: 'ativo',
      metricas: [
        { label: 'Último ciclo', value: formatRelativeTime(data.athena.ultimo_ciclo) },
        { label: 'Resumo', value: data.athena.ultimo_ciclo_resumo },
        { label: 'Última decisão', value: data.athena.ultima_decisao },
        { label: 'Alertas disparados', value: data.athena.alertas_disparados },
      ],
    },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {agents.map((agent) => (
        <div key={agent.nome} className="glass-card border-l-[3px] border-l-accent">
          <div className="mb-3 flex items-center gap-2">
            <agent.icon className="h-4 w-4 text-accent" />
            <span className="font-title text-sm font-bold">{agent.nome}</span>
            <span className="text-xs text-text-subtle">({agent.subtitulo})</span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {agent.status}
            </span>
          </div>
          <div className="space-y-2">
            {agent.metricas.map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-2">
                <span className="text-xs text-text-subtle">{label}</span>
                <span className="text-right text-xs font-medium text-text-primary">
                  {typeof value === 'string' && value.length > 35
                    ? value.slice(0, 35) + '...'
                    : value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 8: Create feed alertas widget**

Create `src/components/widgets/feed-alertas.tsx`:

```tsx
import { DollarSign, Pause, TrendingUp, Star, User, Shield } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import type { Alert, AlertTipo } from '@/lib/types'

const ALERT_ICON_MAP: Record<AlertTipo, typeof DollarSign> = {
  venda: DollarSign,
  campanha_pausada: Pause,
  campanha_escalada: TrendingUp,
  baleia: Star,
  humano_solicitado: User,
  anomalia: Shield,
}

export function FeedAlertasWidget({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="glass-card">
      <p className="mb-4 text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
        Feed de Alertas
      </p>
      <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
        {alerts.map((alert) => {
          const Icon = ALERT_ICON_MAP[alert.tipo] ?? Shield
          return (
            <div key={alert.id} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10">
                <Icon className="h-3.5 w-3.5 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary">{alert.descricao}</p>
                <p className="text-xs text-text-subtle">
                  {formatRelativeTime(alert.created_at)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 9: Commit**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
git add src/components/widgets/
git commit -m "feat: add all 8 dashboard widgets"
```

---

## Task 10: Dashboard Page

**Files:**
- Modify: `src/app/(authenticated)/dashboard/page.tsx`

- [ ] **Step 1: Implement dashboard page**

Replace `src/app/(authenticated)/dashboard/page.tsx`:

```tsx
import { authService, campaignService, analyticsService, leadService, alertService } from '@/lib/services'
import { redirect } from 'next/navigation'
import { RoiCard } from '@/components/widgets/roi-card'
import { HealthScoreWidget } from '@/components/widgets/health-score'
import { FunilWidget } from '@/components/widgets/funil-widget'
import { LtvCacWidget } from '@/components/widgets/ltv-cac'
import { TopObjecoesWidget } from '@/components/widgets/top-objecoes'
import { EconomiaTempoWidget } from '@/components/widgets/economia-tempo'
import { AtividadeAgentesWidget } from '@/components/widgets/atividade-agentes'
import { FeedAlertasWidget } from '@/components/widgets/feed-alertas'

export default async function DashboardPage() {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const [roi, health, funil, ltvCac, objecoes, economia, agentes, alerts] = await Promise.all([
    campaignService.getRoiTotal(user.empresa_id),
    analyticsService.getHealthScore(user.empresa_id),
    leadService.getFunilStats(user.empresa_id, '30d'),
    analyticsService.getLtvCac(user.empresa_id),
    leadService.getTopObjecoes(user.empresa_id),
    analyticsService.getEconomiaHoras(user.empresa_id),
    analyticsService.getAtividadeAgentes(user.empresa_id),
    alertService.getRecentes(user.empresa_id),
  ])

  return (
    <div className="space-y-6">
      {/* ROI — full width, first visible element */}
      <RoiCard initial={roi} />

      {/* Health Score + Funil — 2 cols */}
      <div className="grid gap-6 lg:grid-cols-2">
        <HealthScoreWidget data={health} />
        <FunilWidget stats={funil} />
      </div>

      {/* LTV/CAC + Objeções — 3 cols */}
      <div className="grid gap-6 lg:grid-cols-3">
        <LtvCacWidget data={ltvCac} />
        <div className="lg:col-span-1">
          <TopObjecoesWidget data={objecoes} />
        </div>
      </div>

      {/* Economia de tempo — full width */}
      <EconomiaTempoWidget horas={economia.horas} />

      {/* Atividade dos agentes — 3 cols */}
      <AtividadeAgentesWidget data={agentes} />

      {/* Feed de alertas — full width */}
      <FeedAlertasWidget alerts={alerts} />
    </div>
  )
}
```

- [ ] **Step 2: Verify dashboard renders**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
npm run dev
```

1. Login → should land on `/dashboard`
2. All 8 widgets should render with mock data
3. ROI value should animate every 8 seconds
4. Mobile: verify ROI and Health Score visible without scrolling

- [ ] **Step 3: Commit**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
git add src/app/\(authenticated\)/dashboard/
git commit -m "feat: implement dashboard page with all 8 widgets"
```

---

## Task 11: Funil Page

**Files:**
- Create: `src/app/(authenticated)/funil/page.tsx`

- [ ] **Step 1: Create funil server actions**

Create `src/app/(authenticated)/funil/actions.ts`:

```typescript
'use server'

import { authService, leadService } from '@/lib/services'
import type { FunilStats, Lead } from '@/lib/types'

export async function getFunilData(periodo: '1d' | '7d' | '30d'): Promise<{ stats: FunilStats; leads: Lead[] } | null> {
  const user = await authService.getSession()
  if (!user) return null

  const [stats, leads] = await Promise.all([
    leadService.getFunilStats(user.empresa_id, periodo),
    leadService.getAll(user.empresa_id),
  ])

  return { stats, leads }
}
```

- [ ] **Step 2: Create funil client page**

Create `src/app/(authenticated)/funil/page.tsx`:

```tsx
'use client'

import { useState, useEffect, useTransition } from 'react'
import { FunilChart } from '@/components/charts/funil-chart'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Badge } from '@/components/ui/badge'
import { formatPercent } from '@/lib/utils/format'
import { getFunilData } from './actions'
import type { FunilStats, Lead } from '@/lib/types'

type Periodo = '1d' | '7d' | '30d'

export default function FunilPage() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [stats, setStats] = useState<FunilStats | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [expandido, setExpandido] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const data = await getFunilData(periodo)
      if (data) {
        setStats(data.stats)
        setLeads(data.leads)
      }
    })
  }, [periodo])

  if (!stats) return <div className="text-text-muted">Carregando funil...</div>

  const stages = [
    { key: 'captados', label: 'Leads Captados', filter: 'captado' },
    { key: 'qualificados', label: 'Qualificados', filter: 'qualificado' },
    { key: 'negociacao', label: 'Em Negociação', filter: 'negociacao' },
    { key: 'convertidos', label: 'Convertidos', filter: 'convertido' },
  ] as const

  const taxas = [
    stats.taxas.captado_qualificado,
    stats.taxas.qualificado_negociacao,
    stats.taxas.negociacao_convertido,
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-title text-2xl font-bold">Funil de Vendas</h1>
        <ToggleGroup type="single" value={periodo} onValueChange={(v) => v && setPeriodo(v as Periodo)}>
          <ToggleGroupItem value="1d" className="text-sm">Hoje</ToggleGroupItem>
          <ToggleGroupItem value="7d" className="text-sm">7 dias</ToggleGroupItem>
          <ToggleGroupItem value="30d" className="text-sm">30 dias</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="glass-card">
        <FunilChart stats={stats} />
      </div>

      {/* Expandable stages */}
      <div className="space-y-3">
        {stages.map((stage, i) => {
          const stageLeads = leads.filter((l) => l.estagio_funil === stage.filter)
          const isOpen = expandido === stage.key

          return (
            <div key={stage.key} className="glass-card cursor-pointer" onClick={() => setExpandido(isOpen ? null : stage.key)}>
              <div className="flex items-center justify-between">
                <span className="font-medium">{stage.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-title text-lg font-bold text-accent">
                    {stats[stage.key]}
                  </span>
                  {i < taxas.length && (
                    <span className="text-xs text-text-subtle">
                      perda: {formatPercent(1 - taxas[i])}
                    </span>
                  )}
                </div>
              </div>
              {isOpen && stageLeads.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-border-default pt-4">
                  {stageLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between text-sm">
                      <span>{lead.nome}</span>
                      <Badge variant="outline" className="border-border-default text-text-muted">
                        {lead.temperatura}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify funil page**

Navigate to `/funil`. Toggle between periods. Click on stages to expand and see leads.

- [ ] **Step 3: Commit**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
git add src/app/\(authenticated\)/funil/
git commit -m "feat: implement funil page with period filter and expandable stages"
```

---

## Task 12: Leads Page

**Files:**
- Create: `src/app/(authenticated)/leads/page.tsx`, `src/app/(authenticated)/leads/leads-table.tsx`

- [ ] **Step 1: Create leads table client component**

Create `src/app/(authenticated)/leads/leads-table.tsx`:

```tsx
'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowUpDown, Search } from 'lucide-react'
import { TEMPERATURA_COLORS } from '@/lib/constants/theme'
import type { Lead } from '@/lib/types'

const SENTIMENTO_EMOJI = { positivo: '+', neutro: '~', negativo: '-' } as const
const PER_PAGE_OPTIONS = [10, 25, 50]

export function LeadsTable({ leads: initialLeads }: { leads: Lead[] }) {
  const [busca, setBusca] = useState('')
  const [tempFilter, setTempFilter] = useState<string>('all')
  const [estagioFilter, setEstagioFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<keyof Lead>('updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const filtered = useMemo(() => {
    let result = [...initialLeads]

    if (busca) {
      const q = busca.toLowerCase()
      result = result.filter((l) => l.nome.toLowerCase().includes(q) || l.telefone.includes(q))
    }
    if (tempFilter !== 'all') {
      result = result.filter((l) => l.temperatura === tempFilter)
    }
    if (estagioFilter !== 'all') {
      result = result.filter((l) => l.estagio_funil === estagioFilter)
    }

    result.sort((a, b) => {
      const av = a[sortBy], bv = b[sortBy]
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortOrder === 'desc' ? -cmp : cmp
    })

    return result
  }, [initialLeads, busca, tempFilter, estagioFilter, sortBy, sortOrder])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  function toggleSort(col: keyof Lead) {
    if (sortBy === col) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(col)
      setSortOrder('asc')
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPage(1) }}
            className="border-border-default bg-bg-input pl-9 text-text-primary placeholder:text-text-subtle focus:border-accent"
          />
        </div>
        <Select value={tempFilter} onValueChange={(v) => { setTempFilter(v); setPage(1) }}>
          <SelectTrigger className="w-36 border-border-default bg-bg-input text-text-muted">
            <SelectValue placeholder="Temperatura" />
          </SelectTrigger>
          <SelectContent className="border-border-default bg-[#0C1818]">
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="frio">Frio</SelectItem>
            <SelectItem value="morno">Morno</SelectItem>
            <SelectItem value="quente">Quente</SelectItem>
          </SelectContent>
        </Select>
        <Select value={estagioFilter} onValueChange={(v) => { setEstagioFilter(v); setPage(1) }}>
          <SelectTrigger className="w-40 border-border-default bg-bg-input text-text-muted">
            <SelectValue placeholder="Estágio" />
          </SelectTrigger>
          <SelectContent className="border-border-default bg-[#0C1818]">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="captado">Captado</SelectItem>
            <SelectItem value="qualificado">Qualificado</SelectItem>
            <SelectItem value="negociacao">Negociação</SelectItem>
            <SelectItem value="convertido">Convertido</SelectItem>
            <SelectItem value="perdido">Perdido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border-default md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default bg-bg-elevated/50">
              {[
                { key: 'nome', label: 'Nome' },
                { key: 'telefone', label: 'Telefone' },
                { key: 'temperatura', label: 'Temp.' },
                { key: 'estagio_funil', label: 'Estágio' },
                { key: 'agente_responsavel', label: 'Agente' },
                { key: 'sentimento', label: 'Sent.' },
                { key: 'produto_interesse', label: 'Produto' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle hover:text-text-primary"
                  onClick={() => toggleSort(key as keyof Lead)}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((lead) => (
              <tr key={lead.id} className="border-b border-border-default/50 hover:bg-accent/5">
                <td className="px-4 py-3 font-medium">{lead.nome}</td>
                <td className="px-4 py-3 text-text-muted">{lead.telefone}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    style={{ borderColor: TEMPERATURA_COLORS[lead.temperatura], color: TEMPERATURA_COLORS[lead.temperatura] }}
                  >
                    {lead.temperatura}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-text-muted">{lead.estagio_funil}</td>
                <td className="px-4 py-3 text-text-muted">{lead.agente_responsavel ?? '—'}</td>
                <td className="px-4 py-3 text-text-muted">{SENTIMENTO_EMOJI[lead.sentimento]}</td>
                <td className="px-4 py-3 text-text-muted">{lead.produto_interesse}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {paginated.map((lead) => (
          <div key={lead.id} className="glass-card space-y-2 p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{lead.nome}</span>
              <Badge
                variant="outline"
                style={{ borderColor: TEMPERATURA_COLORS[lead.temperatura], color: TEMPERATURA_COLORS[lead.temperatura] }}
              >
                {lead.temperatura}
              </Badge>
            </div>
            <p className="text-xs text-text-muted">{lead.telefone} · {lead.estagio_funil} · {lead.agente_responsavel ?? 'sem agente'}</p>
            <p className="text-xs text-text-subtle">{lead.produto_interesse}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-text-muted">
        <div className="flex items-center gap-2">
          <span>Mostrar</span>
          <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1) }}>
            <SelectTrigger className="w-20 border-border-default bg-bg-input text-text-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border-default bg-[#0C1818]">
              {PER_PAGE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded px-3 py-1 text-text-muted hover:bg-accent/10 disabled:opacity-30"
          >
            Anterior
          </button>
          <span>{page} de {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded px-3 py-1 text-text-muted hover:bg-accent/10 disabled:opacity-30"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create leads server page**

Create `src/app/(authenticated)/leads/page.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { authService, leadService } from '@/lib/services'
import { LeadsTable } from './leads-table'

export default async function LeadsPage() {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const leads = await leadService.getAll(user.empresa_id)

  return (
    <div className="space-y-6">
      <h1 className="font-title text-2xl font-bold">Leads</h1>
      <LeadsTable leads={leads} />
    </div>
  )
}
```

- [ ] **Step 3: Verify leads page**

Navigate to `/leads`. Test search, filters, sorting, pagination. Resize for mobile cards.

- [ ] **Step 4: Commit**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
git add src/app/\(authenticated\)/leads/
git commit -m "feat: implement leads page with table, search, filters, pagination"
```

---

## Task 13: Campanhas Page

**Files:**
- Create: `src/app/(authenticated)/campanhas/page.tsx`, `src/app/(authenticated)/campanhas/campaign-grid.tsx`

- [ ] **Step 1: Create campaign grid client component**

Create `src/app/(authenticated)/campanhas/campaign-grid.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { LineChartSimple } from '@/components/charts/line-chart-simple'
import { formatCurrency } from '@/lib/utils/format'
import type { Campaign, CampaignPerformance } from '@/lib/types'

export function CampaignGrid({ campaigns }: { campaigns: Campaign[] }) {
  const [selected, setSelected] = useState<Campaign | null>(null)
  const [perfData, setPerfData] = useState<CampaignPerformance[]>([])

  const sorted = [...campaigns].sort((a, b) => {
    if (a.status === 'ativa' && b.status !== 'ativa') return -1
    if (a.status !== 'ativa' && b.status === 'ativa') return 1
    return 0
  })

  async function openDrawer(campaign: Campaign) {
    setSelected(campaign)
    const res = await fetch(`/api/campanhas/${campaign.id}/performance`)
    const data = await res.json()
    setPerfData(data)
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((c) => (
          <div
            key={c.id}
            onClick={() => openDrawer(c)}
            className={`glass-card glass-card-interactive cursor-pointer ${
              c.status === 'pausada' ? 'opacity-60' : ''
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-title text-sm font-bold">{c.nome}</span>
              <Badge
                variant="outline"
                className={c.status === 'ativa' ? 'border-accent text-accent' : 'border-text-subtle text-text-subtle'}
              >
                {c.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div>
                <p className="text-xs text-text-subtle">Gasto</p>
                <p className="font-medium">{formatCurrency(c.gasto_total)}</p>
              </div>
              <div>
                <p className="text-xs text-text-subtle">CPL</p>
                <p className="font-medium">{formatCurrency(c.cpl)}</p>
              </div>
              <div>
                <p className="text-xs text-text-subtle">ROAS</p>
                <p className="font-medium text-accent">{c.roas.toFixed(1)}x</p>
              </div>
              <div>
                <p className="text-xs text-text-subtle">Leads / Vendas</p>
                <p className="font-medium">{c.leads_gerados} / {c.vendas_confirmadas}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full border-border-default bg-bg-base sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="font-title text-text-primary">
              {selected?.nome}
            </SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <p className="text-xs text-text-subtle">ROAS</p>
                  <p className="font-title text-2xl font-bold text-accent">{selected.roas.toFixed(1)}x</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-text-subtle">Gasto Total</p>
                  <p className="font-title text-2xl font-bold">{formatCurrency(selected.gasto_total)}</p>
                </div>
              </div>
              {perfData.length > 0 && (
                <div>
                  <p className="mb-2 text-sm text-text-muted">Performance ao longo do tempo</p>
                  <LineChartSimple
                    data={perfData.map((d) => ({ ...d, data: d.data.slice(5) }))}
                    xKey="data"
                    yKey="roas"
                    height={220}
                  />
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
```

- [ ] **Step 2: Create campaign performance API route**

Create `src/app/api/campanhas/[id]/performance/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { campaignService } from '@/lib/services'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = await campaignService.getPerformance(id)
  return NextResponse.json(data)
}
```

- [ ] **Step 3: Create campanhas server page**

Create `src/app/(authenticated)/campanhas/page.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { authService, campaignService } from '@/lib/services'
import { CampaignGrid } from './campaign-grid'

export default async function CampanhasPage() {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const campaigns = await campaignService.getAll(user.empresa_id)

  return (
    <div className="space-y-6">
      <h1 className="font-title text-2xl font-bold">Campanhas</h1>
      <CampaignGrid campaigns={campaigns} />
    </div>
  )
}
```

- [ ] **Step 4: Verify campanhas page**

Navigate to `/campanhas`. Click a card to open the drawer. Check inactive campaigns show with reduced opacity.

- [ ] **Step 5: Commit**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
git add src/app/\(authenticated\)/campanhas/ src/app/api/campanhas/
git commit -m "feat: implement campanhas page with grid and performance drawer"
```

---

## Task 14: Relatórios Page and PDF API Route

**Files:**
- Create: `src/app/(authenticated)/relatorios/page.tsx`, `src/app/api/relatorios/pdf/route.ts`

- [ ] **Step 1: Create PDF API route**

Create `src/app/api/relatorios/pdf/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import ReactPDF from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import React from 'react'

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#070C0C', color: '#FFFFFF', fontFamily: 'Helvetica' },
  header: { marginBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4FD1C5', marginBottom: 8 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#4FD1C5', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(79,209,197,0.3)', paddingBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  value: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  highlight: { fontSize: 18, fontWeight: 'bold', color: '#4FD1C5', marginBottom: 4 },
  body: { fontSize: 10, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 },
})

function ReportDocument({ mes, ano }: { mes: string; ano: string }) {
  return React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: styles.page },
      React.createElement(View, { style: styles.header },
        React.createElement(Text, { style: styles.title }, 'Athenio.ai'),
        React.createElement(Text, { style: styles.subtitle }, `Relatório de Resultados — ${mes}/${ano}`),
      ),
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Resumo Executivo'),
        React.createElement(Text, { style: styles.highlight }, 'ROAS: 3.55x'),
        React.createElement(Text, { style: styles.body }, '330 leads captados, 28 conversões confirmadas. A operação está saudável com Health Score médio de 78.'),
      ),
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'ROI — Evolução 3 Meses'),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Janeiro'),
          React.createElement(Text, { style: styles.value }, '2.8x'),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Fevereiro'),
          React.createElement(Text, { style: styles.value }, '3.1x'),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Março'),
          React.createElement(Text, { style: styles.value }, '3.55x'),
        ),
      ),
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Top 3 Campanhas por ROAS'),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, '1. Video Depoimentos - Premium'),
          React.createElement(Text, { style: styles.value }, '4.2x'),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, '2. Carrossel Benefícios - Multi'),
          React.createElement(Text, { style: styles.value }, '2.8x'),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, '3. Imagem Promo - Básico'),
          React.createElement(Text, { style: styles.value }, '1.1x'),
        ),
      ),
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Top 3 Objeções do Período'),
        React.createElement(Text, { style: styles.body }, '1. Preço (42 ocorrências) — leads comparam com alternativas mais baratas\n2. Prazo (28) — insegurança sobre quando verão resultado\n3. Desconfiança (19) — pedem garantias adicionais'),
      ),
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Economia de Tempo'),
        React.createElement(Text, { style: styles.highlight }, '187 horas'),
        React.createElement(Text, { style: styles.body }, 'de trabalho humano economizadas neste mês pela automação.'),
      ),
    )
  )
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mes = searchParams.get('mes') || '03'
  const ano = searchParams.get('ano') || '2026'

  const pdfStream = await ReactPDF.renderToStream(
    React.createElement(ReportDocument, { mes, ano })
  )

  return new NextResponse(pdfStream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="athenio-relatorio-${mes}-${ano}.pdf"`,
    },
  })
}
```

- [ ] **Step 2: Create relatorios page**

Create `src/app/(authenticated)/relatorios/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileDown, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'

const MESES = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
]

export default function RelatoriosPage() {
  const [mes, setMes] = useState('03')
  const [ano, setAno] = useState('2026')
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const res = await fetch(`/api/relatorios/pdf?mes=${mes}&ano=${ano}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `athenio-relatorio-${mes}-${ano}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  const mesLabel = MESES.find((m) => m.value === mes)?.label || mes

  // Preview data (same mock data used in PDF)
  const previewSections = [
    { title: 'Resumo Executivo', content: `330 leads captados, 28 conversões. ROAS médio 3.55x. Health Score médio: 78.` },
    { title: 'Leads Recuperados via Remarketing', content: `14 leads retornaram ao funil via remarketing, representando ${formatCurrency(8540)} em valor potencial.` },
    { title: 'Top 3 Campanhas', content: '1. Video Depoimentos (4.2x ROAS)\n2. Carrossel Benefícios (2.8x)\n3. Imagem Promo (1.1x)' },
    { title: 'Top 3 Objeções', content: '1. Preço (42)\n2. Prazo (28)\n3. Desconfiança (19)' },
    { title: 'Economia de Tempo', content: '187 horas de trabalho humano economizadas.' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="font-title text-2xl font-bold">Relatórios</h1>

      <div className="flex items-end gap-4">
        <div>
          <p className="mb-1 text-xs text-text-subtle">Mês</p>
          <Select value={mes} onValueChange={setMes}>
            <SelectTrigger className="w-40 border-border-default bg-bg-input text-text-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border-default bg-[#0C1818]">
              {MESES.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="mb-1 text-xs text-text-subtle">Ano</p>
          <Select value={ano} onValueChange={setAno}>
            <SelectTrigger className="w-28 border-border-default bg-bg-input text-text-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border-default bg-[#0C1818]">
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleDownload}
          disabled={loading}
          className="rounded-full bg-accent px-6 font-semibold text-[#070C0C] shadow-[0_0_40px_rgba(79,209,197,0.3)] hover:bg-accent-light"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparando seu relatório de resultados...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Baixar PDF
            </>
          )}
        </Button>
      </div>

      {/* Preview */}
      <div>
        <p className="mb-3 text-sm text-text-muted">
          Preview — {mesLabel} {ano}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {previewSections.map((s) => (
            <div key={s.title} className="glass-card">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent">{s.title}</p>
              <p className="whitespace-pre-line text-sm text-text-muted">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify relatorios page and PDF download**

Navigate to `/relatorios`. Select a month. Click "Baixar PDF". Verify PDF downloads with branded dark layout.

- [ ] **Step 4: Commit**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
git add src/app/\(authenticated\)/relatorios/ src/app/api/relatorios/
git commit -m "feat: implement relatorios page with PDF generation"
```

---

## Task 15: Configurações Page

**Files:**
- Create: `src/app/(authenticated)/configuracoes/page.tsx`

- [ ] **Step 1: Implement configuracoes page**

Create `src/app/(authenticated)/configuracoes/page.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, AlertTriangle, CheckCircle } from 'lucide-react'
import type { Empresa } from '@/lib/types'

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<Partial<Empresa>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('athenio-config')
    if (stored) {
      setConfig(JSON.parse(stored))
    } else {
      // Default mock values
      import('@/lib/services/mock/data').then(({ mockEmpresas }) => {
        setConfig(mockEmpresas[0])
      })
    }
  }, [])

  function handleChange(field: keyof Empresa, value: string | number) {
    setConfig((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function handleSave() {
    localStorage.setItem('athenio-config', JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <h1 className="font-title text-2xl font-bold">Configurações</h1>

      <p className="flex items-center gap-2 text-sm text-warning">
        <AlertTriangle className="h-4 w-4" />
        Alterações aqui impactam o comportamento dos agentes
      </p>

      {/* Metas */}
      <div className="glass-card space-y-4">
        <h2 className="font-title text-lg font-bold">Metas</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-text-muted">ROAS Meta</Label>
            <Input
              type="number"
              step="0.1"
              value={config.roas_meta || ''}
              onChange={(e) => handleChange('roas_meta', parseFloat(e.target.value))}
              className="border-border-default bg-bg-input text-text-primary focus:border-accent"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-text-muted">CPL Alvo (R$)</Label>
            <Input
              type="number"
              step="0.50"
              value={config.cpl_alvo || ''}
              onChange={(e) => handleChange('cpl_alvo', parseFloat(e.target.value))}
              className="border-border-default bg-bg-input text-text-primary focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Orçamento */}
      <div className="glass-card space-y-4">
        <h2 className="font-title text-lg font-bold">Orçamento</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-text-muted">Limite Diário (R$)</Label>
            <Input
              type="number"
              value={config.orcamento_diario || ''}
              onChange={(e) => handleChange('orcamento_diario', parseFloat(e.target.value))}
              className="border-border-default bg-bg-input text-text-primary focus:border-accent"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-text-muted">Teto Absoluto do Cartão (R$)</Label>
            <Input
              type="number"
              value={config.teto_cartao || ''}
              onChange={(e) => handleChange('teto_cartao', parseFloat(e.target.value))}
              className="border-border-default bg-bg-input text-text-primary focus:border-accent"
            />
            <p className="text-xs text-danger">Nenhuma lógica de ROAS pode ultrapassar este valor</p>
          </div>
        </div>
      </div>

      {/* Comunicação */}
      <div className="glass-card space-y-4">
        <h2 className="font-title text-lg font-bold">Comunicação</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-text-muted">Tom de Voz do Agente</Label>
            <Textarea
              value={config.tom_de_voz || ''}
              onChange={(e) => handleChange('tom_de_voz', e.target.value)}
              rows={3}
              className="border-border-default bg-bg-input text-text-primary focus:border-accent"
              placeholder="Descreva como os agentes devem se comunicar..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-text-muted">WhatsApp para Alertas</Label>
            <Input
              type="tel"
              value={config.whatsapp_alertas || ''}
              onChange={(e) => handleChange('whatsapp_alertas', e.target.value)}
              className="border-border-default bg-bg-input text-text-primary focus:border-accent"
              placeholder="+5511999887766"
            />
          </div>
        </div>
      </div>

      {/* Empresa */}
      <div className="glass-card space-y-4">
        <h2 className="font-title text-lg font-bold">Empresa</h2>
        <div className="space-y-2">
          <Label className="text-text-muted">Nome da Empresa</Label>
          <Input
            value={config.nome || ''}
            onChange={(e) => handleChange('nome', e.target.value)}
            className="border-border-default bg-bg-input text-text-primary focus:border-accent"
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        className="rounded-full bg-accent px-8 font-semibold text-[#070C0C] shadow-[0_0_40px_rgba(79,209,197,0.3)] hover:bg-accent-light"
      >
        {saved ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Salvo com sucesso
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Salvar configurações
          </>
        )}
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Verify configuracoes page**

Navigate to `/configuracoes`. Change values. Save. Reload the page — values should persist (localStorage).

- [ ] **Step 3: Commit**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
git add src/app/\(authenticated\)/configuracoes/
git commit -m "feat: implement configuracoes page with localStorage persistence"
```

---

## Task 16: Admin Page

**Files:**
- Create: `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/admin/[empresaId]/page.tsx`

- [ ] **Step 1: Create admin layout**

Create `src/app/admin/layout.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { authService } from '@/lib/services'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await authService.getSession()
  if (!user) redirect('/login')
  if (user.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen">
      <Sidebar isAdmin />
      <div className="lg:pl-60">
        <Topbar userName={user.nome} isAdmin />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create admin empresas list page**

Create `src/app/admin/page.tsx`:

```tsx
import Link from 'next/link'
import { adminService } from '@/lib/services'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils/format'
import { getHealthScoreColor } from '@/lib/constants/theme'

export default async function AdminPage() {
  const empresas = await adminService.getAllEmpresas()

  const sorted = [...empresas].sort((a, b) => a.health_score - b.health_score)

  return (
    <div className="space-y-6">
      <h1 className="font-title text-2xl font-bold">Painel Admin</h1>

      <div className="overflow-x-auto rounded-xl border border-border-default">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default bg-bg-elevated/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Empresa</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Health Score</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">ROAS Mês</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Último Alerta</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Assinatura</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => (
              <tr
                key={e.id}
                className={`border-b border-border-default/50 transition-colors hover:bg-accent/5 ${
                  e.health_score < 60 ? 'bg-danger-bg' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <Link href={`/admin/${e.id}`} className="font-medium text-accent hover:underline">
                    {e.nome}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="font-title font-bold" style={{ color: getHealthScoreColor(e.health_score) }}>
                    {e.health_score}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{e.roas_mes.toFixed(1)}x</td>
                <td className="px-4 py-3 text-text-muted">
                  {e.ultimo_alerta ? formatRelativeTime(e.ultimo_alerta) : '—'}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={
                      e.assinatura_status === 'ativa'
                        ? 'border-accent text-accent'
                        : 'border-danger text-danger'
                    }
                  >
                    {e.assinatura_status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create admin empresa detail page (read-only dashboard)**

Create `src/app/admin/[empresaId]/page.tsx`:

```tsx
import Link from 'next/link'
import { campaignService, analyticsService, leadService, alertService, empresaService } from '@/lib/services'
import { ArrowLeft } from 'lucide-react'
import { RoiCard } from '@/components/widgets/roi-card'
import { HealthScoreWidget } from '@/components/widgets/health-score'
import { FunilWidget } from '@/components/widgets/funil-widget'
import { LtvCacWidget } from '@/components/widgets/ltv-cac'
import { TopObjecoesWidget } from '@/components/widgets/top-objecoes'
import { EconomiaTempoWidget } from '@/components/widgets/economia-tempo'
import { AtividadeAgentesWidget } from '@/components/widgets/atividade-agentes'
import { FeedAlertasWidget } from '@/components/widgets/feed-alertas'

export default async function AdminEmpresaPage({
  params,
}: {
  params: Promise<{ empresaId: string }>
}) {
  const { empresaId } = await params
  const empresa = await empresaService.getById(empresaId)

  if (!empresa) {
    return <p className="text-text-muted">Empresa não encontrada.</p>
  }

  const [roi, health, funil, ltvCac, objecoes, economia, agentes, alerts] = await Promise.all([
    campaignService.getRoiTotal(empresaId),
    analyticsService.getHealthScore(empresaId),
    leadService.getFunilStats(empresaId, '30d'),
    analyticsService.getLtvCac(empresaId),
    leadService.getTopObjecoes(empresaId),
    analyticsService.getEconomiaHoras(empresaId),
    analyticsService.getAtividadeAgentes(empresaId),
    alertService.getRecentes(empresaId),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-text-muted hover:text-accent">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-title text-2xl font-bold">{empresa.nome}</h1>
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          Modo visualização
        </span>
      </div>

      <RoiCard initial={roi} />
      <div className="grid gap-6 lg:grid-cols-2">
        <HealthScoreWidget data={health} />
        <FunilWidget stats={funil} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <LtvCacWidget data={ltvCac} />
        <div className="lg:col-span-1">
          <TopObjecoesWidget data={objecoes} />
        </div>
      </div>
      <EconomiaTempoWidget horas={economia.horas} />
      <AtividadeAgentesWidget data={agentes} />
      <FeedAlertasWidget alerts={alerts} />
    </div>
  )
}
```

- [ ] **Step 4: Verify admin pages**

1. Login with an admin email (e.g., `admin@athenio.ai`)
2. Navigate to `/admin` — see empresas table, risk clients highlighted
3. Click a client — see full dashboard in read-only mode

- [ ] **Step 5: Commit**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
git add src/app/admin/
git commit -m "feat: implement admin panel with empresa list and read-only dashboard"
```

---

## Task 17: Final Polish and Build Verification

**Files:**
- Verify all pages work end-to-end

- [ ] **Step 1: Run TypeScript check**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
npx tsc --noEmit
```

Expected: no type errors.

- [ ] **Step 2: Run tests**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
npm test -- --run
```

Expected: all tests pass.

- [ ] **Step 3: Run production build**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
npm run build
```

Expected: build succeeds with no errors. Note any warnings.

- [ ] **Step 4: Fix any build issues**

If the build fails, fix the issues. Common ones:
- Missing `'use client'` directives on components using hooks/event handlers
- Import paths not resolving
- Recharts SSR issues (ensure chart components have `'use client'`)

- [ ] **Step 5: Smoke test all pages**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
npm run dev
```

Test each page:
1. `/login` — login works, redirects to dashboard
2. `/dashboard` — all 8 widgets render, ROI animates
3. `/funil` — period toggle works, stages expand
4. `/leads` — search, filter, sort, paginate all work, mobile cards show
5. `/campanhas` — cards render, drawer opens with chart
6. `/relatorios` — PDF downloads correctly
7. `/configuracoes` — save persists to localStorage
8. `/admin` — table shows, empresa click opens read-only dashboard

- [ ] **Step 6: Final commit**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend
git add .
git commit -m "chore: verify build and polish"
```
