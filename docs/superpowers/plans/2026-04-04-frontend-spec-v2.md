# Frontend Spec V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete frontend specification v2 — conversations, alerts, admin panel overhaul, infrastructure (hooks, shared components, types, services), sidebar/middleware updates.

**Architecture:** 3-stream parallel approach. Stream 1 (Infrastructure) must complete first. Then Stream 2 (Client Panel) and Stream 3 (Admin Panel) run in parallel. Each task produces a commit.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, shadcn/ui, Motion (Framer Motion fork), Lucide icons, Sonner toasts, Supabase Auth

**Design spec:** `docs/superpowers/specs/2026-04-04-frontend-spec-v2-design.md`

**Existing patterns to follow:**
- Server-side API: `apiClient<T>(path)` from `src/lib/api/client.ts` — auto-injects Supabase server JWT
- Browser-side API: `clientApi<T>(path)` from `src/lib/api/client-api.ts` — same but browser Supabase
- Services: class implements interface, singleton export from `src/lib/services/index.ts`
- Components: `card-surface` CSS class for cards, `AnimateIn` for viewport fade, `MOTION`/`fadeInUp` from `src/lib/motion.ts`
- Styling: `INPUT_CLASS = "h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"`
- Section headers: `text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle`
- Labels: `text-[12px] font-medium text-text-muted`

---

## Stream 1: Infrastructure

### Task 1: Types — Admin, Agent, Conversation updates

**Files:**
- Create: `src/lib/types/admin.ts`
- Create: `src/lib/types/agent.ts`
- Modify: `src/lib/types/conversation.ts`
- Modify: `src/lib/types/alert.ts`
- Modify: `src/lib/types/index.ts`

- [ ] **Step 1: Create `src/lib/types/admin.ts`**

```typescript
import type { ToneOfVoice } from './company-profile'

export interface HandoffConfig {
  max_negative_turns: number
  max_llm_failures: number
  whale_auto_takeover: boolean
  escalation_phone?: string
}

export interface OrchestratorConfig {
  budget_near_limit_threshold: number
  bottleneck_threshold: number
  whale_score_threshold: number
  budget_scale_factor: number
  roas_target_modifier: number
}

export interface TenantQuotas {
  rate_limit_per_hour: number
  max_whatsapp_instances: number
  monthly_message_quota: number
}

export interface Tenant {
  id: string
  name: string
  slug: string
  tone_of_voice?: ToneOfVoice
  approach_script?: string
  asaas_key?: string
  stripe_key?: string
  meta_account_id?: string
  meta_access_token?: string
  pixel_id?: string
  whatsapp_phone_id?: string
  whatsapp_token?: string
  daily_budget?: number
  card_limit?: number
  target_roas?: number
  max_cpa?: number
  alert_phone?: string
  competitors?: string[]
  handoff_config?: HandoffConfig
  orchestrator_config?: OrchestratorConfig
  quotas?: TenantQuotas
  created_at: string
  updated_at: string
}

export type CreateTenantPayload = Omit<Tenant, 'id' | 'created_at' | 'updated_at'>

export interface OrchestratorDecision {
  id: string
  tenant_id: string
  type: 'scale_budget' | 'pause_campaigns' | 'reduce_bids' | 'whale_detected' | 'handoff' | 'cycle_summary' | 'tenant_config_invalid' | 'reflection_failed'
  input_summary: string
  result: string
  created_at: string
}

export type DecisionType = OrchestratorDecision['type']

export interface DLQEntry {
  id: string
  job_type: string
  data: Record<string, unknown>
  error: string
  created_at: string
}

export interface AdminDashboard {
  total_tenants: number
  total_leads: number
  total_whales: number
}

export interface SystemHealth {
  supabase: boolean
  redis: boolean
  kairos: boolean
  ares: boolean
  whatsapp: boolean
}
```

- [ ] **Step 2: Create `src/lib/types/agent.ts`**

```typescript
export interface AgentStatus {
  name: string
  status: 'online' | 'offline'
  active_conversations?: number
  active_campaigns?: number
}
```

- [ ] **Step 3: Update `src/lib/types/conversation.ts`**

Add fields needed for chat view. Replace entire file:

```typescript
export interface Conversation {
  id: string
  company_id: string
  lead_id: string
  lead_name: string
  lead_phone: string
  messages_count: number
  duration_minutes: number
  agent: 'hermes' | 'ares'
  is_human_takeover: boolean
  is_whale: boolean
  funnel_stage: string
  temperature: string
  last_message_preview: string
  last_message_at: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender: 'agent' | 'lead' | 'human'
  text: string
  model?: string
  created_at: string
}

export interface ConversationSummary {
  id: string
  company_id: string
  lead_id: string
  lead_name: string
  lead_phone: string
  summary: string
  last_pain_point: string
  funnel_stage: string
  temperature: string
  active_objections: string[]
  is_human_takeover: boolean
  is_whale: boolean
  last_message_preview: string
  last_message_at: string
  created_at: string
}
```

- [ ] **Step 4: Update `src/lib/types/alert.ts`**

Add `sale_confirmed`, `whale_detected`, `sensor_failure`, `campaign_paused`, `human_requested` to match spec:

```typescript
export type AlertType =
  | 'sale'
  | 'sale_confirmed'
  | 'campaign_paused'
  | 'campaign_scaled'
  | 'whale'
  | 'whale_detected'
  | 'human_requested'
  | 'anomaly'
  | 'sensor_failure'

export interface Alert {
  id: string
  company_id: string
  type: AlertType
  description: string
  created_at: string
}
```

- [ ] **Step 5: Update `src/lib/types/index.ts`**

Add new exports:

```typescript
export * from './lead'
export * from './campaign'
export * from './payment'
export * from './conversation'
export * from './alert'
export * from './empresa'
export * from './analytics'
export * from './support'
export * from './company-profile'
export * from './product'
export * from './knowledge'
export * from './readiness'
export * from './admin'
export * from './agent'
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/types/
git commit -m "feat: add admin, agent types and update conversation/alert types"
```

---

### Task 2: Service interfaces — Conversation, Agent, Health, Admin expansion

**Files:**
- Create: `src/lib/services/interfaces/conversation-service.ts`
- Create: `src/lib/services/interfaces/agent-service.ts`
- Create: `src/lib/services/interfaces/health-service.ts`
- Modify: `src/lib/services/interfaces/admin-service.ts`

- [ ] **Step 1: Create `src/lib/services/interfaces/conversation-service.ts`**

```typescript
import type { ConversationSummary, Message } from '@/lib/types'

export interface IConversationService {
  list(companyId: string, params?: { filter?: string; search?: string }): Promise<ConversationSummary[]>
  getMessages(leadId: string): Promise<Message[]>
  sendMessage(leadId: string, content: string): Promise<Message>
  takeOver(leadId: string): Promise<void>
}
```

- [ ] **Step 2: Create `src/lib/services/interfaces/agent-service.ts`**

```typescript
import type { AgentStatus } from '@/lib/types'

export interface IAgentService {
  getStatus(companyId: string): Promise<AgentStatus[]>
}
```

- [ ] **Step 3: Create `src/lib/services/interfaces/health-service.ts`**

```typescript
import type { SystemHealth } from '@/lib/types'

export interface IHealthService {
  check(): Promise<SystemHealth>
}
```

- [ ] **Step 4: Expand `src/lib/services/interfaces/admin-service.ts`**

Replace entire file:

```typescript
import type { CompanySummary, Tenant, CreateTenantPayload, Lead, OrchestratorDecision, DLQEntry, AdminDashboard } from '@/lib/types'

export interface IAdminService {
  getAllCompanies(): Promise<CompanySummary[]>
  getDashboard(): Promise<AdminDashboard>
  getTenants(): Promise<Tenant[]>
  getTenant(id: string): Promise<Tenant>
  createTenant(payload: CreateTenantPayload): Promise<Tenant>
  updateTenant(id: string, payload: Partial<CreateTenantPayload>): Promise<Tenant>
  deleteTenant(id: string): Promise<void>
  getTenantLeads(id: string, params?: { limit?: number; offset?: number }): Promise<Lead[]>
  getTenantDecisions(id: string): Promise<OrchestratorDecision[]>
  getDLQ(): Promise<DLQEntry[]>
  replayDLQ(id: string): Promise<void>
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/interfaces/
git commit -m "feat: add conversation, agent, health service interfaces and expand admin"
```

---

### Task 3: Service implementations

**Files:**
- Create: `src/lib/services/conversation-service.ts`
- Create: `src/lib/services/agent-service.ts`
- Create: `src/lib/services/health-service.ts`
- Modify: `src/lib/services/admin-service.ts`
- Modify: `src/lib/services/index.ts`

- [ ] **Step 1: Create `src/lib/services/conversation-service.ts`**

```typescript
import type { IConversationService } from './interfaces/conversation-service'
import type { ConversationSummary, Message } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class ConversationService implements IConversationService {
  async list(_companyId: string, params?: { filter?: string; search?: string }): Promise<ConversationSummary[]> {
    const qs = new URLSearchParams()
    if (params?.filter) qs.set('filter', params.filter)
    if (params?.search) qs.set('search', params.search)
    const query = qs.toString()
    return apiClient<ConversationSummary[]>(`/conversations${query ? `?${query}` : ''}`)
  }

  async getMessages(leadId: string): Promise<Message[]> {
    return apiClient<Message[]>(`/conversations/${leadId}`)
  }

  async sendMessage(leadId: string, content: string): Promise<Message> {
    return apiClient<Message>(`/conversations/${leadId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  async takeOver(leadId: string): Promise<void> {
    await apiClient<void>(`/conversations/${leadId}/takeover`, { method: 'POST' })
  }
}
```

- [ ] **Step 2: Create `src/lib/services/agent-service.ts`**

```typescript
import type { IAgentService } from './interfaces/agent-service'
import type { AgentStatus } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class AgentService implements IAgentService {
  async getStatus(_companyId: string): Promise<AgentStatus[]> {
    return apiClient<AgentStatus[]>('/agents')
  }
}
```

- [ ] **Step 3: Create `src/lib/services/health-service.ts`**

```typescript
import type { IHealthService } from './interfaces/health-service'
import type { SystemHealth } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class HealthService implements IHealthService {
  async check(): Promise<SystemHealth> {
    return apiClient<SystemHealth>('/health')
  }
}
```

- [ ] **Step 4: Expand `src/lib/services/admin-service.ts`**

Replace entire file:

```typescript
import type { IAdminService } from './interfaces/admin-service'
import type { CompanySummary, Tenant, CreateTenantPayload, Lead, OrchestratorDecision, DLQEntry, AdminDashboard } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class AdminService implements IAdminService {
  async getAllCompanies(): Promise<CompanySummary[]> {
    return apiClient<CompanySummary[]>('/admin/companies')
  }

  async getDashboard(): Promise<AdminDashboard> {
    return apiClient<AdminDashboard>('/admin/dashboard')
  }

  async getTenants(): Promise<Tenant[]> {
    return apiClient<Tenant[]>('/admin/tenants')
  }

  async getTenant(id: string): Promise<Tenant> {
    return apiClient<Tenant>(`/admin/tenants/${id}`)
  }

  async createTenant(payload: CreateTenantPayload): Promise<Tenant> {
    return apiClient<Tenant>('/admin/tenants', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async updateTenant(id: string, payload: Partial<CreateTenantPayload>): Promise<Tenant> {
    return apiClient<Tenant>(`/admin/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  }

  async deleteTenant(id: string): Promise<void> {
    await apiClient<void>(`/admin/tenants/${id}`, { method: 'DELETE' })
  }

  async getTenantLeads(id: string, params?: { limit?: number; offset?: number }): Promise<Lead[]> {
    const qs = new URLSearchParams()
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.offset) qs.set('offset', String(params.offset))
    const query = qs.toString()
    return apiClient<Lead[]>(`/admin/tenants/${id}/leads${query ? `?${query}` : ''}`)
  }

  async getTenantDecisions(id: string): Promise<OrchestratorDecision[]> {
    return apiClient<OrchestratorDecision[]>(`/admin/tenants/${id}/decisions`)
  }

  async getDLQ(): Promise<DLQEntry[]> {
    return apiClient<DLQEntry[]>('/admin/dlq')
  }

  async replayDLQ(id: string): Promise<void> {
    await apiClient<void>(`/admin/dlq/${id}/replay`, { method: 'POST' })
  }
}
```

- [ ] **Step 5: Update `src/lib/services/index.ts`**

Add new service exports:

```typescript
import { LeadService } from './lead-service'
import { CampaignService } from './campaign-service'
import { AnalyticsService } from './analytics-service'
import { AlertService } from './alert-service'
import { CompanyService } from './company-service'
import { AdminService } from './admin-service'
import { AuthService } from './auth-service'
import { CompanyProfileService } from './company-profile-service'
import { ProductService } from './product-service'
import { KnowledgeService } from './knowledge-service'
import { ReadinessService } from './readiness-service'
import { ConversationService } from './conversation-service'
import { AgentService } from './agent-service'
import { HealthService } from './health-service'

export const leadService = new LeadService()
export const campaignService = new CampaignService()
export const analyticsService = new AnalyticsService()
export const alertService = new AlertService()
export const companyService = new CompanyService()
export const adminService = new AdminService()
export const authService = new AuthService()
export const companyProfileService = new CompanyProfileService()
export const productService = new ProductService()
export const knowledgeService = new KnowledgeService()
export const readinessService = new ReadinessService()
export const conversationService = new ConversationService()
export const agentService = new AgentService()
export const healthService = new HealthService()
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/services/
git commit -m "feat: add conversation, agent, health services and expand admin service"
```

---

### Task 4: Hooks — useAuth, useWebSocket, useReadiness, useApi

**Files:**
- Create: `src/hooks/useAuth.ts`
- Create: `src/hooks/useWebSocket.ts`
- Create: `src/hooks/useReadiness.ts`
- Create: `src/hooks/useApi.ts`

- [ ] **Step 1: Create `src/hooks/useAuth.ts`**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AuthUser {
  id: string
  email: string
  company_id: string
  role: 'client' | 'admin'
  name: string
}

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<{ access_token: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function loadSession() {
      const { data: { session: s } } = await supabase.auth.getSession()
      if (s?.user) {
        const meta = s.user.user_metadata
        setUser({
          id: s.user.id,
          email: s.user.email!,
          company_id: meta.company_id ?? '',
          role: meta.role ?? 'client',
          name: meta.name ?? '',
        })
        setSession({ access_token: s.access_token })
      }
      setLoading(false)
    }

    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s?.user) {
        const meta = s.user.user_metadata
        setUser({
          id: s.user.id,
          email: s.user.email!,
          company_id: meta.company_id ?? '',
          role: meta.role ?? 'client',
          name: meta.name ?? '',
        })
        setSession({ access_token: s.access_token })
      } else {
        setUser(null)
        setSession(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }, [router])

  return {
    user,
    session,
    loading,
    role: user?.role ?? null,
    tenantId: user?.company_id ?? null,
    isAdmin: user?.role === 'admin',
    isClient: user?.role === 'client',
    logout,
  }
}
```

- [ ] **Step 2: Create `src/hooks/useWebSocket.ts`**

```typescript
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from './useAuth'

type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected'

interface WSMessage {
  type: string
  payload: Record<string, unknown>
}

export function useWebSocket() {
  const { session } = useAuth()
  const [connected, setConnected] = useState<ConnectionStatus>('disconnected')
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)
  const [messages, setMessages] = useState<WSMessage[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const retriesRef = useRef(0)
  const maxRetryDelay = 30000

  const connect = useCallback(() => {
    if (!session?.access_token) return

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3003'
    const wsUrl = apiUrl.replace(/^http/, 'ws')
    const ws = new WebSocket(`${wsUrl}/ws?token=${session.access_token}`)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected('connected')
      retriesRef.current = 0
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WSMessage
        setLastMessage(msg)
        setMessages((prev) => [...prev, msg])
      } catch {
        // ignore malformed messages
      }
    }

    ws.onclose = () => {
      setConnected('reconnecting')
      const delay = Math.min(1000 * Math.pow(2, retriesRef.current), maxRetryDelay)
      retriesRef.current += 1
      setTimeout(connect, delay)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [session?.access_token])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
    }
  }, [connect])

  return { connected, lastMessage, messages }
}
```

- [ ] **Step 3: Create `src/hooks/useReadiness.ts`**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { clientApi } from '@/lib/api/client-api'
import type { ReadinessResult } from '@/lib/types'

export function useReadiness() {
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchReadiness = useCallback(async () => {
    setLoading(true)
    try {
      const data = await clientApi<ReadinessResult>('/api/company/readiness')
      setReadiness(data)
    } catch {
      // silently fail — banner just won't show
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReadiness()
  }, [fetchReadiness])

  return { readiness, loading, refetch: fetchReadiness }
}
```

- [ ] **Step 4: Create `src/hooks/useApi.ts`**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { clientApi } from '@/lib/api/client-api'
import { toast } from 'sonner'

interface UseApiOptions {
  autoFetch?: boolean
}

const ERROR_MESSAGES: Record<number, string> = {
  403: 'Você não tem permissão para esta ação',
  404: 'Recurso não encontrado',
  409: 'Este recurso já existe',
  429: 'Muitas requisições. Aguarde um momento.',
  500: 'Erro interno. Tente novamente.',
  503: 'Serviço temporariamente indisponível',
}

export function useApi<T>(url: string, options: UseApiOptions = {}) {
  const { autoFetch = true } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await clientApi<T>(url)
      setData(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)

      // Extract status code from error message pattern "Erro: {status}"
      const statusMatch = message.match(/(\d{3})/)
      const status = statusMatch ? parseInt(statusMatch[1]) : 500
      const toastMessage = ERROR_MESSAGES[status] ?? message

      if (status === 401) {
        window.location.href = '/login'
      } else {
        toast.error(toastMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (autoFetch) fetchData()
  }, [autoFetch, fetchData])

  return { data, loading, error, refetch: fetchData }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/hooks/
git commit -m "feat: add useAuth, useWebSocket, useReadiness, useApi hooks"
```

---

### Task 5: Shared components — StatusBadge, PriceInput, ConfirmDialog, ChipInput, EmptyState

**Files:**
- Create: `src/components/common/status-badge.tsx`
- Create: `src/components/common/price-input.tsx`
- Create: `src/components/common/confirm-dialog.tsx`
- Create: `src/components/common/chip-input.tsx`
- Create: `src/components/common/empty-state.tsx`

- [ ] **Step 1: Create `src/components/common/status-badge.tsx`**

```tsx
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type BadgeColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange' | 'purple'

const COLOR_CLASSES: Record<BadgeColor, string> = {
  green: 'border-emerald/30 bg-emerald/10 text-emerald',
  yellow: 'border-gold/30 bg-gold/10 text-gold',
  red: 'border-danger/30 bg-danger/10 text-danger',
  blue: 'border-accent/30 bg-accent/10 text-accent',
  gray: 'border-border-default bg-surface-2 text-text-muted',
  orange: 'border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]',
  purple: 'border-violet/30 bg-violet/10 text-violet',
}

interface StatusBadgeProps {
  status: string
  colorMap?: Record<string, BadgeColor>
  className?: string
}

export function StatusBadge({ status, colorMap, className }: StatusBadgeProps) {
  const color = colorMap?.[status] ?? 'gray'
  return (
    <Badge variant="outline" className={cn(COLOR_CLASSES[color], className)}>
      {status}
    </Badge>
  )
}

export const FUNNEL_COLORS: Record<string, BadgeColor> = {
  greeting: 'gray',
  captured: 'gray',
  qualifying: 'blue',
  qualified: 'blue',
  consulting: 'purple',
  negotiation: 'orange',
  negotiating: 'orange',
  closing: 'yellow',
  converted: 'green',
  lost: 'red',
}

export const TEMPERATURE_COLORS: Record<string, BadgeColor> = {
  cold: 'blue',
  warm: 'yellow',
  hot: 'red',
}

export const CAMPAIGN_STATUS_COLORS: Record<string, BadgeColor> = {
  active: 'green',
  paused: 'yellow',
  killed: 'red',
  scaling: 'blue',
}

export const DECISION_TYPE_COLORS: Record<string, BadgeColor> = {
  scale_budget: 'green',
  pause_campaigns: 'yellow',
  reduce_bids: 'orange',
  whale_detected: 'blue',
  handoff: 'purple',
  cycle_summary: 'gray',
  tenant_config_invalid: 'red',
  reflection_failed: 'red',
}
```

- [ ] **Step 2: Create `src/components/common/price-input.tsx`**

```tsx
'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'

const INPUT_CLASS = 'h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10'

interface PriceInputProps {
  value: number // cents
  onChange: (cents: number) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function PriceInput({ value, onChange, placeholder = '0,00', className, disabled }: PriceInputProps) {
  const [displayValue, setDisplayValue] = useState(() =>
    value > 0 ? (value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      setDisplayValue(raw)
      const clean = raw.replace(/\./g, '').replace(',', '.')
      const num = parseFloat(clean)
      if (!isNaN(num)) {
        onChange(Math.round(num * 100))
      }
    },
    [onChange]
  )

  const handleBlur = useCallback(() => {
    if (value > 0) {
      setDisplayValue(
        (value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      )
    }
  }, [value])

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-text-subtle">R$</span>
      <Input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`${INPUT_CLASS} pl-10 ${className ?? ''}`}
      />
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/common/confirm-dialog.tsx`**

```tsx
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  confirmLabel?: string
  variant?: 'destructive' | 'default'
  requireSlug?: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = 'Confirmar',
  variant = 'default',
  requireSlug,
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const [slugInput, setSlugInput] = useState('')

  const canConfirm = requireSlug ? slugInput === requireSlug : true

  async function handleConfirm() {
    await onConfirm()
    setSlugInput('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        {requireSlug && (
          <div className="space-y-2 py-2">
            <p className="text-[12px] text-text-muted">
              Digite <span className="font-mono font-semibold text-text-primary">{requireSlug}</span> para confirmar:
            </p>
            <Input
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value)}
              placeholder={requireSlug}
              className="h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary"
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            className={variant === 'destructive' ? '' : 'bg-accent text-primary-foreground hover:brightness-110'}
          >
            {loading ? 'Processando...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Create `src/components/common/chip-input.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'

const INPUT_CLASS = 'h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10'

interface ChipInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  maxItems?: number
  label?: string
}

export function ChipInput({ value, onChange, placeholder = 'Adicionar...', maxItems = 10, label }: ChipInputProps) {
  const [input, setInput] = useState('')

  function add() {
    const trimmed = input.trim()
    if (!trimmed || value.length >= maxItems) return
    if (value.includes(trimmed)) return
    onChange([...value, trimmed])
    setInput('')
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {label && (
        <span className="text-[12px] font-medium text-text-muted">
          {label} {value.length > 0 && `(${value.length}/${maxItems})`}
        </span>
      )}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          className={`${INPUT_CLASS} flex-1`}
          placeholder={placeholder}
          disabled={value.length >= maxItems}
        />
        <Button
          type="button"
          variant="outline"
          onClick={add}
          disabled={!input.trim() || value.length >= maxItems}
          className="h-11 rounded-xl"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <AnimatePresence>
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {value.map((chip, i) => (
              <motion.span
                key={chip + i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-1 px-3 py-1.5 text-[12px] text-text-muted"
              >
                {chip}
                <button type="button" onClick={() => remove(i)} className="text-text-subtle hover:text-danger transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/components/common/empty-state.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { fadeInUp, MOTION } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default py-16 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2">
        <Icon className="h-6 w-6 text-text-subtle" />
      </div>
      <h3 className="font-title text-[16px] font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] text-text-muted">{description}</p>
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-5">
          {actionHref ? (
            <Button asChild className="h-10 rounded-xl bg-accent px-5 text-[13px] font-semibold text-primary-foreground hover:brightness-110">
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : (
            <Button onClick={onAction} className="h-10 rounded-xl bg-accent px-5 text-[13px] font-semibold text-primary-foreground hover:brightness-110">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/common/
git commit -m "feat: add StatusBadge, PriceInput, ConfirmDialog, ChipInput, EmptyState components"
```

---

### Task 6: Sidebar update + Middleware

**Files:**
- Modify: `src/components/layout/sidebar.tsx`
- Verify: `src/middleware.ts` (already handles `/admin*`)

- [ ] **Step 1: Update sidebar navigation arrays**

In `src/components/layout/sidebar.tsx`, add imports at top:

```typescript
import {
  LayoutDashboard,
  GitBranch,
  Users,
  Megaphone,
  FileText,
  Settings,
  Shield,
  Headset,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Package,
  BookOpen,
  MessageSquare,
  Bell,
  Building2,
  AlertTriangle,
} from 'lucide-react'
```

Update `NAV_MAIN` to add Conversas and Alertas after Campanhas:

```typescript
const NAV_MAIN = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/funil', label: 'Funil', icon: GitBranch },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/campanhas', label: 'Campanhas', icon: Megaphone },
  { href: '/conversas', label: 'Conversas', icon: MessageSquare },
  { href: '/alertas', label: 'Alertas', icon: Bell },
]
```

Add admin navigation array:

```typescript
const NAV_ADMIN = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/tenants', label: 'Clientes', icon: Building2 },
  { href: '/admin/dlq', label: 'DLQ', icon: AlertTriangle },
]
```

Replace the existing admin section at the bottom of the nav (around line 230) — where it currently renders a single "Admin" nav item — with the expanded admin nav:

```tsx
{isAdmin && (
  <>
    <div className="my-4 mx-3 h-[1px] bg-gradient-to-r from-transparent via-border-default to-transparent" />
    <AnimatePresence>
      {!effectiveCollapsed && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-subtle/40"
        >
          Admin
        </motion.p>
      )}
    </AnimatePresence>
    <div className="space-y-0.5">
      {NAV_ADMIN.map((item) => (
        <NavItem key={item.href} {...item} index={itemIndex++} />
      ))}
    </div>
  </>
)}
```

- [ ] **Step 2: Verify middleware**

Read `src/middleware.ts` — the existing code already protects all `/admin*` paths by checking `role === 'admin'`. No changes needed since `/admin/tenants`, `/admin/dlq`, `/admin/dashboard` all match the `/admin` prefix check.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/sidebar.tsx
git commit -m "feat: add Conversas, Alertas to sidebar and expand admin nav"
```

---

## Stream 2: Client Panel

### Task 7: Conversations page — Components

**Files:**
- Create: `src/components/conversations/conversation-list.tsx`
- Create: `src/components/conversations/chat-view.tsx`
- Create: `src/components/conversations/conversation-panel.tsx`

- [ ] **Step 1: Create `src/components/conversations/conversation-list.tsx`**

Client component showing the left-column list of conversations. Props:

```typescript
interface ConversationListProps {
  conversations: ConversationSummary[]
  selectedLeadId: string | null
  onSelect: (leadId: string) => void
}
```

Implementation details:
- Import `ConversationSummary` from `@/lib/types`
- Import `StatusBadge`, `TEMPERATURE_COLORS`, `FUNNEL_COLORS` from `@/components/common/status-badge`
- Import `EmptyState` from `@/components/common/empty-state`
- Import `Input` from `@/components/ui/input`, `MessageSquare`, `Search`, `Filter` from `lucide-react`
- Import `formatRelativeTime` from `@/lib/utils/format`
- Local state: `search` (string), `filter` ('all' | 'bot' | 'human' | 'whale')
- Filter conversations by search (lead_name/lead_phone) and filter type
- Each item shows: lead_name, last_message_preview (truncated to 60 chars), formatRelativeTime(last_message_at)
- StatusBadge showing is_human_takeover ? 'Humano' : is_whale ? 'Whale' : 'Bot'
- Selected item gets `bg-accent/5 border-accent/20` highlight
- Clicking item calls `onSelect(leadId)`
- Empty state: icon=MessageSquare, title="Nenhuma conversa", description="As conversas aparecerão quando leads entrarem em contato."
- Filter bar: `Input` for search + dropdown `select` for filter (Todos/Bot/Humano/Whale)
- Scrollable with `overflow-y-auto max-h-[calc(100vh-200px)]`

- [ ] **Step 2: Create `src/components/conversations/chat-view.tsx`**

Client component showing the right-column chat. Props:

```typescript
interface ChatViewProps {
  leadId: string
  leadName: string
  leadPhone: string
  funnelStage: string
  temperature: string
  isHumanTakeover: boolean
}
```

Implementation details:
- Import `useApi` from `@/hooks/useApi`, `clientApi` from `@/lib/api/client-api`
- Import `useWebSocket` from `@/hooks/useWebSocket`
- Import `Message` from `@/lib/types`
- Import `StatusBadge`, `FUNNEL_COLORS`, `TEMPERATURE_COLORS` from `@/components/common/status-badge`
- Import `Input` from `@/components/ui/input`, `Button` from `@/components/ui/button`
- Import `Send`, `UserCheck`, `ArrowLeft` from `lucide-react`
- Import `motion` from `motion/react`, `fadeInUp`, `MOTION` from `@/lib/motion`
- Import `formatRelativeTime` from `@/lib/utils/format`
- Import `toast` from `sonner`
- Fetch messages with `useApi<Message[]>(`/conversations/${leadId}`)` (uses clientApi internally)
- WebSocket: listen for `new_message` events where payload.lead_id matches current leadId, append to local messages
- Local state: `inputText`, `sending`, `localMessages` (init from useApi data)
- Auto-scroll: `useRef` on messages container, scroll to bottom on new messages
- Header: lead name, phone, StatusBadge for funnel_stage (FUNNEL_COLORS) + temperature (TEMPERATURE_COLORS), "Assumir conversa" button if !isHumanTakeover
- Messages list: inbound (sender==='lead') left-aligned with `bg-surface-2 rounded-2xl rounded-bl-md`, outbound (sender==='agent'|'human') right-aligned with `bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl rounded-br-md`
- Below outbound messages: small badge with `msg.model ?? 'humano'`
- New messages animate in with `fadeInUp`
- Input bar at bottom: `Input` + `Button` with Send icon, calls `clientApi<Message>(`/conversations/${leadId}/messages`, { method: 'POST', body: JSON.stringify({ content: inputText }) })`
- "Assumir conversa" calls `clientApi(`/conversations/${leadId}/takeover`, { method: 'POST' })` then shows toast "Conversa assumida"

- [ ] **Step 3: Create `src/components/conversations/conversation-panel.tsx`**

Client component that combines list + chat view. Props:

```typescript
interface ConversationPanelProps {
  initialConversations: ConversationSummary[]
}
```

Implementation details:
- Two-column layout: `flex` container, list on left (`w-[380px] shrink-0 border-r border-border-default`), chat on right (`flex-1`)
- Local state: `selectedLeadId` (string | null)
- Find the selected conversation from initialConversations array
- When selectedLeadId is set, render ChatView with props from the selected conversation
- When no conversation selected, show centered message "Selecione uma conversa"
- Mobile responsive: use `useMediaQuery` or CSS. On screens < 768px:
  - If no selected → show list full width
  - If selected → show ChatView full width with ArrowLeft button that clears selection

- [ ] **Step 4: Commit**

```bash
git add src/components/conversations/
git commit -m "feat: add conversation components — list, chat view, panel"
```

---

### Task 8: Conversations page — Route

**Files:**
- Create: `src/app/(authenticated)/conversas/page.tsx`

- [ ] **Step 1: Create page**

Server component that fetches initial conversations and renders the panel:

```typescript
import { authService, conversationService } from '@/lib/services'
import { redirect } from 'next/navigation'
import { ConversationPanel } from '@/components/conversations/conversation-panel'

export default async function ConversasPage() {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const conversations = await conversationService.list(user.company_id)

  return (
    <div className="-mx-4 -my-8 sm:-mx-6 lg:-mx-8">
      <ConversationPanel initialConversations={conversations} />
    </div>
  )
}
```

Note: negative margins remove the parent layout padding so the conversation panel can be full-height. The parent layout at `src/app/(authenticated)/layout.tsx` wraps content in `<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">`.

- [ ] **Step 2: Commit**

```bash
git add src/app/\(authenticated\)/conversas/
git commit -m "feat: add /conversas page route"
```

---

### Task 9: Alerts page

**Files:**
- Create: `src/components/alerts/alert-timeline.tsx`
- Create: `src/app/(authenticated)/alertas/page.tsx`

- [ ] **Step 1: Create `src/components/alerts/alert-timeline.tsx`**

Client component. Props:

```typescript
interface AlertTimelineProps {
  alerts: Alert[]
}
```

Implementation details:
- Import `Alert`, `AlertType` from `@/lib/types`
- Import `DollarSign`, `Crown`, `PauseCircle`, `AlertTriangle`, `UserCheck` from `lucide-react`
- Import `motion` from `motion/react`, `fadeInUp`, `staggerContainer`, `MOTION` from `@/lib/motion`
- Import `formatRelativeTime` from `@/lib/utils/format`
- Import `EmptyState` from `@/components/common/empty-state`
- Import `Bell` from `lucide-react`

Alert type config map (icon + color):
```typescript
const ALERT_CONFIG: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  sale: { icon: DollarSign, color: '#34D399', label: 'Venda' },
  sale_confirmed: { icon: DollarSign, color: '#34D399', label: 'Venda Confirmada' },
  whale: { icon: Crown, color: '#4FD1C5', label: 'Whale' },
  whale_detected: { icon: Crown, color: '#4FD1C5', label: 'Whale Detectado' },
  campaign_paused: { icon: PauseCircle, color: '#E8C872', label: 'Campanha Pausada' },
  campaign_scaled: { icon: TrendingUp, color: '#4FD1C5', label: 'Escala' },
  sensor_failure: { icon: AlertTriangle, color: '#F07070', label: 'Falha' },
  human_requested: { icon: UserCheck, color: '#A78BFA', label: 'Humano Solicitado' },
  anomaly: { icon: AlertTriangle, color: '#F07070', label: 'Anomalia' },
}
```

Layout:
- Vertical timeline with connecting line: `relative` container, absolute `div` on left side (left-[19px]) with gradient line from accent/20 to transparent
- Each alert item: `relative flex gap-4 pb-8`
  - Dot: `relative z-10 h-10 w-10 shrink-0 rounded-full flex items-center justify-center` with background color from config
  - Content card: `card-surface flex-1 p-4` with icon, label badge, message, time
- Stagger animation: container uses `staggerContainer`, each child uses `fadeInUp`
- If empty: `EmptyState` with Bell icon, "Nenhum alerta", "Alertas aparecerão aqui quando houver atividade importante."

- [ ] **Step 2: Create `src/app/(authenticated)/alertas/page.tsx`**

Server component:

```typescript
import { authService, alertService } from '@/lib/services'
import { redirect } from 'next/navigation'
import { AlertTimeline } from '@/components/alerts/alert-timeline'
import { Bell } from 'lucide-react'

export default async function AlertasPage() {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const alerts = await alertService.getRecent(user.company_id, 50)

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5">
          <Bell className="h-[18px] w-[18px] text-accent" />
        </div>
        <div>
          <h1 className="font-title text-[22px] font-bold text-text-primary">Alertas</h1>
          <p className="text-[13px] text-text-muted">Acompanhe eventos importantes em tempo real</p>
        </div>
      </div>

      <AlertTimeline alerts={alerts} />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/alerts/ src/app/\(authenticated\)/alertas/
git commit -m "feat: add /alertas page with alert timeline"
```

---

### Task 10: Dashboard update — Agent status + Recent activity

**Files:**
- Create: `src/components/widgets/agent-status-card.tsx`
- Create: `src/components/widgets/recent-activity.tsx`
- Modify: `src/app/(authenticated)/dashboard/page.tsx`

- [ ] **Step 1: Create `src/components/widgets/agent-status-card.tsx`**

```tsx
'use client'

import { AnimateIn } from '@/components/ui/animate-in'
import type { AgentStatus } from '@/lib/types'

interface AgentStatusCardProps {
  agent: AgentStatus
  delay?: number
}

export function AgentStatusCard({ agent, delay = 0 }: AgentStatusCardProps) {
  const isOnline = agent.status === 'online'

  return (
    <AnimateIn delay={delay}>
      <div className="card-surface p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              {isOnline && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
              )}
              <span className={`relative inline-flex h-3 w-3 rounded-full ${isOnline ? 'bg-emerald' : 'bg-danger'}`} />
            </span>
            <div>
              <p className="font-title text-[15px] font-bold text-text-primary">{agent.name}</p>
              <p className="text-[11px] text-text-muted">{isOnline ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <div className="text-right">
            {agent.active_conversations !== undefined && (
              <p className="text-[13px] text-text-muted">
                <span className="font-title text-[20px] font-bold text-text-primary">{agent.active_conversations}</span>{' '}
                conversas ativas
              </p>
            )}
            {agent.active_campaigns !== undefined && (
              <p className="text-[13px] text-text-muted">
                <span className="font-title text-[20px] font-bold text-text-primary">{agent.active_campaigns}</span>{' '}
                campanhas ativas
              </p>
            )}
          </div>
        </div>
      </div>
    </AnimateIn>
  )
}
```

- [ ] **Step 2: Create `src/components/widgets/recent-activity.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { AnimateIn } from '@/components/ui/animate-in'
import { formatRelativeTime } from '@/lib/utils/format'
import type { ConversationSummary, Alert, AlertType } from '@/lib/types'
import { MessageSquare, DollarSign, Pause, TrendingUp, Star, User, Shield } from 'lucide-react'

const ALERT_ICONS: Record<string, typeof DollarSign> = {
  sale: DollarSign,
  sale_confirmed: DollarSign,
  campaign_paused: Pause,
  campaign_scaled: TrendingUp,
  whale: Star,
  whale_detected: Star,
  human_requested: User,
  anomaly: Shield,
  sensor_failure: Shield,
}

interface RecentActivityProps {
  conversations: ConversationSummary[]
  alerts: Alert[]
}

export function RecentActivity({ conversations, alerts }: RecentActivityProps) {
  return (
    <AnimateIn>
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent conversations */}
        <div className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-text-primary">Últimas Conversas</p>
            <Link href="/conversas" className="text-[11px] text-accent hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-1">
            {conversations.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href="/conversas"
                className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-text-subtle" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-text-primary">{c.lead_name}</p>
                  <p className="truncate text-[11px] text-text-subtle">{c.last_message_preview}</p>
                </div>
                <span className="shrink-0 text-[11px] text-text-subtle">{formatRelativeTime(c.last_message_at)}</span>
              </Link>
            ))}
            {conversations.length === 0 && (
              <p className="py-4 text-center text-[13px] text-text-subtle">Nenhuma conversa recente</p>
            )}
          </div>
        </div>

        {/* Recent alerts */}
        <div className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-text-primary">Últimos Alertas</p>
            <Link href="/alertas" className="text-[11px] text-accent hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-1">
            {alerts.slice(0, 5).map((a) => {
              const Icon = ALERT_ICONS[a.type] ?? Shield
              return (
                <Link
                  key={a.id}
                  href="/alertas"
                  className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
                >
                  <Icon className="h-4 w-4 shrink-0 text-text-subtle" />
                  <p className="min-w-0 flex-1 truncate text-[13px] text-text-muted">{a.description}</p>
                  <span className="shrink-0 text-[11px] text-text-subtle">{formatRelativeTime(a.created_at)}</span>
                </Link>
              )
            })}
            {alerts.length === 0 && (
              <p className="py-4 text-center text-[13px] text-text-subtle">Nenhum alerta recente</p>
            )}
          </div>
        </div>
      </div>
    </AnimateIn>
  )
}
```

- [ ] **Step 3: Update `src/app/(authenticated)/dashboard/page.tsx`**

Add imports at top:
```typescript
import { AgentStatusCard } from '@/components/widgets/agent-status-card'
import { RecentActivity } from '@/components/widgets/recent-activity'
import { agentService, conversationService } from '@/lib/services'
```

Add to the `Promise.all` data fetch (add `agentStatus` and `conversations`):
```typescript
const [roi, health, funnel, ltvCac, objections, hoursSaved, agents, alerts, readiness, agentStatus, conversations] = await Promise.all([
  campaignService.getTotalRoi(user.company_id),
  analyticsService.getHealthScore(user.company_id),
  leadService.getFunnelStats(user.company_id, '30d'),
  analyticsService.getLtvCac(user.company_id),
  leadService.getTopObjections(user.company_id),
  analyticsService.getHoursSaved(user.company_id),
  analyticsService.getAgentsActivity(user.company_id),
  alertService.getRecent(user.company_id),
  readinessService.check(),
  agentService.getStatus(user.company_id),
  conversationService.list(user.company_id),
])
```

Add two new sections in the JSX, before the existing "Agentes IA" section:

```tsx
{/* Section: Status dos Agentes */}
<div>
  <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
    Status dos Agentes
  </p>
  <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
    {agentStatus.map((agent, i) => (
      <AgentStatusCard key={agent.name} agent={agent} delay={i * 0.06} />
    ))}
  </div>
</div>

{/* Section: Atividade Recente */}
<div>
  <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
    Atividade Recente
  </p>
  <RecentActivity conversations={conversations} alerts={alerts} />
</div>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/widgets/agent-status-card.tsx src/components/widgets/recent-activity.tsx src/app/\(authenticated\)/dashboard/page.tsx
git commit -m "feat: add agent status cards and recent activity to dashboard"
```

---

### Task 11: Settings page — 3 tabs

**Files:**
- Modify: `src/app/(authenticated)/configuracoes/page.tsx`

- [ ] **Step 1: Rewrite settings page**

Rewrite the entire file to use `Tabs` with 3 tabs. This is a `'use client'` component.

**Tab 1: "Perfil da Empresa"**
- Import and render `CompanyProfileForm` from `@/components/onboarding/company-profile-form.tsx`
- Fetch profile with `clientApi<CompanyProfile>('/api/company/profile')` on mount
- On submit: `clientApi('/api/company/profile', { method: 'PUT', body: ... })` then toast.success

**Tab 2: "Configurações Operacionais"**
- Keep the existing fields (target_roas, target_cpl, daily_budget, card_limit, whatsapp_alerts)
- Use `PriceInput` from `@/components/common/price-input` for daily_budget and card_limit
- Fetch with `clientApi<Company>('/api/config')`, save with `clientApi('/api/config', { method: 'PUT', ... })`

**Tab 3: "Status do Sistema"**
- Import `ReadinessChecklist` from `@/components/onboarding/readiness-checklist`
- Import `AgentStatusCard` from `@/components/widgets/agent-status-card`
- Fetch readiness with `useReadiness()` hook
- Fetch agent status with `useApi<AgentStatus[]>('/agents')`
- Fetch system health with `useApi<SystemHealth>('/health')`
- Show readiness checklist, agent status cards, and system health indicators

Use existing `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `@/components/ui/tabs`.

Keep the page header (Settings icon + title) and warning banner from the current implementation.

- [ ] **Step 2: Commit**

```bash
git add src/app/\(authenticated\)/configuracoes/page.tsx
git commit -m "feat: restructure settings page into 3 tabs"
```

---

## Stream 3: Admin Panel

### Task 12: Admin layout + route restructure

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/dashboard/page.tsx` (placeholder initially — full implementation in Task 13)
- Modify: `src/app/admin/page.tsx` — redirect to `/admin/dashboard`

- [ ] **Step 1: Create `src/app/admin/layout.tsx`**

Server component that wraps admin pages with the authenticated shell:

```typescript
import { redirect } from 'next/navigation'
import { authService, alertService } from '@/lib/services'
import { AuthShell } from '@/components/layout/auth-shell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await authService.getSession()
  if (!user) redirect('/login')
  if (user.role !== 'admin') redirect('/dashboard')

  const alerts = await alertService.getRecent(user.company_id)

  return (
    <AuthShell
      isAdmin={true}
      userName={user.name}
      alertCount={alerts.length}
    >
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </AuthShell>
  )
}
```

- [ ] **Step 2: Update `src/app/admin/page.tsx` to redirect**

```typescript
import { redirect } from 'next/navigation'

export default function AdminPage() {
  redirect('/admin/dashboard')
}
```

- [ ] **Step 3: Remove old admin detail page**

Delete `src/app/admin/[empresaId]/page.tsx` — it's replaced by `/admin/tenants/[id]`.

```bash
rm -rf src/app/admin/\[empresaId\]
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/
git commit -m "feat: add admin layout and redirect /admin to /admin/dashboard"
```

---

### Task 13: Admin Dashboard

**Files:**
- Create: `src/components/admin/system-health-card.tsx`
- Create: `src/app/admin/dashboard/page.tsx`

- [ ] **Step 1: Create `src/components/admin/system-health-card.tsx`**

```tsx
'use client'

import { AnimateIn } from '@/components/ui/animate-in'
import type { SystemHealth } from '@/lib/types'

const SERVICES: { key: keyof SystemHealth; label: string }[] = [
  { key: 'supabase', label: 'Supabase' },
  { key: 'redis', label: 'Redis' },
  { key: 'kairos', label: 'Kairos' },
  { key: 'ares', label: 'Ares' },
  { key: 'whatsapp', label: 'WhatsApp' },
]

export function SystemHealthCard({ health }: { health: SystemHealth }) {
  return (
    <AnimateIn>
      <div className="card-hero p-6">
        <p className="mb-4 font-title text-[15px] font-bold text-text-primary">Saúde do Sistema</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {SERVICES.map(({ key, label }) => {
            const up = health[key]
            return (
              <div key={key} className="flex items-center gap-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] p-3">
                <span className="relative flex h-3 w-3">
                  {up && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
                  )}
                  <span className={`relative inline-flex h-3 w-3 rounded-full ${up ? 'bg-emerald' : 'bg-danger'}`} />
                </span>
                <span className="text-[13px] text-text-muted">{label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </AnimateIn>
  )
}
```

- [ ] **Step 2: Create `src/app/admin/dashboard/page.tsx`**

Server component:

```typescript
import { adminService, healthService } from '@/lib/services'
import { KpiCard } from '@/components/widgets/kpi-card'
import { SystemHealthCard } from '@/components/admin/system-health-card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/format'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const [dashboard, tenants, health] = await Promise.all([
    adminService.getDashboard(),
    adminService.getTenants(),
    healthService.check(),
  ])

  return (
    <div className="space-y-8">
      <h1 className="font-title text-[22px] font-bold text-text-primary">Painel Admin</h1>

      {/* KPIs */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-3">
        <KpiCard label="Total de Clientes" value={dashboard.total_tenants} icon="BarChart3" accentColor="#4FD1C5" delay={0} />
        <KpiCard label="Total de Leads" value={dashboard.total_leads} icon="TrendingUp" accentColor="#34D399" delay={0.06} />
        <KpiCard label="Total de Whales" value={dashboard.total_whales} icon="DollarSign" accentColor="#E8C872" delay={0.12} />
      </div>

      {/* System Health */}
      <SystemHealthCard health={health} />

      {/* Tenant list */}
      <div className="card-surface overflow-hidden">
        <div className="border-b border-border-default px-6 py-4">
          <p className="font-title text-[15px] font-bold text-text-primary">Clientes</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default bg-surface-2/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-b border-border-default/50 transition-colors hover:bg-accent/5">
                  <td className="px-4 py-3">
                    <Link href={`/admin/tenants/${t.id}`} className="font-medium text-accent hover:underline">
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-text-muted">{t.slug}</td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/system-health-card.tsx src/app/admin/dashboard/
git commit -m "feat: add admin dashboard with KPIs, system health, and tenant list"
```

---

### Task 14: Tenant List page

**Files:**
- Create: `src/app/admin/tenants/page.tsx`

- [ ] **Step 1: Create page**

Server component with tenant list table, search, and "Novo Cliente" button:

```typescript
import Link from 'next/link'
import { adminService } from '@/lib/services'
import { formatDate } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'
import { Building2, Plus } from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'

export default async function TenantsPage() {
  const tenants = await adminService.getTenants()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5">
            <Building2 className="h-[18px] w-[18px] text-accent" />
          </div>
          <div>
            <h1 className="font-title text-[22px] font-bold text-text-primary">Clientes</h1>
            <p className="text-[13px] text-text-muted">Gerencie todos os tenants da plataforma</p>
          </div>
        </div>
        <Button asChild className="h-10 rounded-xl bg-accent px-5 text-[13px] font-semibold text-primary-foreground hover:brightness-110">
          <Link href="/admin/tenants/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Link>
        </Button>
      </div>

      {tenants.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nenhum cliente"
          description="Crie o primeiro cliente para começar."
          actionLabel="Criar Cliente"
          actionHref="/admin/tenants/new"
        />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default bg-surface-2/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Data de Criação</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">Ações</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id} className="border-b border-border-default/50 transition-colors hover:bg-accent/5">
                    <td className="px-4 py-3 font-medium text-text-primary">{t.name}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-text-muted">{t.slug}</td>
                    <td className="px-4 py-3 text-text-muted">{formatDate(t.created_at)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/tenants/${t.id}`} className="text-[13px] text-accent hover:underline">
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/tenants/page.tsx
git commit -m "feat: add /admin/tenants list page"
```

---

### Task 15: Create Tenant page

**Files:**
- Create: `src/components/admin/tenant-form.tsx`
- Create: `src/app/admin/tenants/new/page.tsx`

- [ ] **Step 1: Create `src/components/admin/tenant-form.tsx`**

Client component. A large form with 6 collapsible sections. Props:

```typescript
interface TenantFormProps {
  initialData?: Partial<Tenant>
  onSubmit: (data: CreateTenantPayload) => Promise<void>
  submitLabel?: string
  maskKeys?: boolean // true for edit mode — show masked API keys
}
```

Implementation details:
- Import all needed types: `Tenant`, `CreateTenantPayload`, `HandoffConfig`, `OrchestratorConfig`, `TenantQuotas`, `ToneOfVoice` from `@/lib/types`
- Import `Input`, `Label`, `Textarea`, `Button` from UI components
- Import `PriceInput` from `@/components/common/price-input`
- Import `ChipInput` from `@/components/common/chip-input`
- Import `motion`, `AnimatePresence` from `motion/react`
- Import `ChevronDown`, `Eye`, `EyeOff`, `Loader2` from `lucide-react`
- Import `Badge` from `@/components/ui/badge`

Use `INPUT_CLASS` constant matching existing pattern.

State: one big form state object, `openSections` (Set of section indices), `showKeys` (Record of field→boolean for password toggles).

**6 Accordion sections** — each section is a collapsible `div`:
- Header: clickable, shows section title + chevron that rotates
- Content: hidden/shown with AnimatePresence + motion.div height animation

**Section 1: Dados Básicos** — name (required), slug (auto-gen from name via kebab-case on name change, editable), tone_of_voice (tone selector buttons like CompanyProfileForm), approach_script (Textarea)

**Section 2: Pagamentos** — asaas_key, stripe_key (both password inputs with eye toggle). If `maskKeys` and value exists, show `Badge variant="outline" className="border-emerald/30 text-emerald"` → "Configurado", else `Badge` → "Não configurado"

**Section 3: Meta Ads** — meta_account_id, meta_access_token (password+eye), pixel_id, whatsapp_phone_id, whatsapp_token (password+eye). Same badge pattern.

**Section 4: Configuração Operacional** — daily_budget (PriceInput), card_limit (PriceInput), target_roas (number), max_cpa (number), alert_phone (tel), competitors (ChipInput)

**Section 5: Configuração Avançada** — handoff fields (max_negative_turns default 2, max_llm_failures default 2, whale_auto_takeover toggle default true, escalation_phone) + orchestrator fields (budget_near_limit_threshold default 90, bottleneck_threshold default 120000, whale_score_threshold default 85, budget_scale_factor default 15, roas_target_modifier default 1.0)

**Section 6: Quotas** — rate_limit_per_hour default 200, max_whatsapp_instances default 3, monthly_message_quota default 10000

Submit button at bottom.

Slug auto-generation: on name change, if slug hasn't been manually edited, auto-set slug to `name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')`.

- [ ] **Step 2: Create `src/app/admin/tenants/new/page.tsx`**

Client component page:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { TenantForm } from '@/components/admin/tenant-form'
import { clientApi } from '@/lib/api/client-api'
import { toast } from 'sonner'
import type { Tenant, CreateTenantPayload } from '@/lib/types'
import { Building2 } from 'lucide-react'

export default function NewTenantPage() {
  const router = useRouter()

  async function handleSubmit(data: CreateTenantPayload) {
    try {
      const tenant = await clientApi<Tenant>('/admin/tenants', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      toast.success('Cliente criado com sucesso')
      router.push(`/admin/tenants/${tenant.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar cliente')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5">
          <Building2 className="h-[18px] w-[18px] text-accent" />
        </div>
        <div>
          <h1 className="font-title text-[22px] font-bold text-text-primary">Novo Cliente</h1>
          <p className="text-[13px] text-text-muted">Configure um novo tenant na plataforma</p>
        </div>
      </div>

      <TenantForm onSubmit={handleSubmit} submitLabel="Criar Cliente" />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/tenant-form.tsx src/app/admin/tenants/new/
git commit -m "feat: add create tenant form and /admin/tenants/new page"
```

---

### Task 16: Tenant Detail page (4 tabs)

**Files:**
- Create: `src/components/admin/tenant-detail-tabs.tsx`
- Create: `src/components/admin/decision-timeline.tsx`
- Create: `src/app/admin/tenants/[id]/page.tsx`

- [ ] **Step 1: Create `src/components/admin/decision-timeline.tsx`**

Client component. Same visual pattern as alert-timeline but for OrchestratorDecision. Props:

```typescript
interface DecisionTimelineProps {
  decisions: OrchestratorDecision[]
}
```

- Import `OrchestratorDecision` from `@/lib/types`
- Import `StatusBadge`, `DECISION_TYPE_COLORS` from `@/components/common/status-badge`
- Import `EmptyState` from `@/components/common/empty-state`
- Import `motion` from `motion/react`, `fadeInUp`, `staggerContainer`, `MOTION` from `@/lib/motion`
- Import `formatRelativeTime` from `@/lib/utils/format`
- Import `GitBranch` from `lucide-react` (for empty state icon)

Layout: same timeline pattern as alert-timeline — vertical line on left, decision cards on right.

Each decision shows:
- `StatusBadge` with type + `DECISION_TYPE_COLORS`
- `input_summary` text
- `result` text (slightly muted)
- `formatRelativeTime(created_at)`

Empty state: "Nenhuma decisão registrada"

- [ ] **Step 2: Create `src/components/admin/tenant-detail-tabs.tsx`**

Client component with 4 tabs. Props:

```typescript
interface TenantDetailTabsProps {
  tenant: Tenant
}
```

Implementation:
- Uses `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `@/components/ui/tabs`
- Tab values: 'overview', 'config', 'leads', 'decisions'

**Tab 1 (overview):** Display readiness-like checklist (check if key fields are set on tenant), stats (products count, leads count can be derived from tenant data or fetched separately). Show company name, slug, created_at info.

**Tab 2 (config):** Render `TenantForm` with `initialData={tenant}`, `maskKeys={true}`, `submitLabel="Salvar alterações"`. On submit: `clientApi(`/admin/tenants/${tenant.id}`, { method: 'PUT', body })` then toast.

**Tab 3 (leads):** Fetch leads with `useApi<Lead[]>(`/admin/tenants/${tenant.id}/leads`)`. Render paginated table with columns: Nome, Telefone, Temp (StatusBadge+TEMPERATURE_COLORS), Funil (StatusBadge+FUNNEL_COLORS), Whale (boolean badge), Agente, Atualizado.

**Tab 4 (decisions):** Fetch decisions with `useApi<OrchestratorDecision[]>(`/admin/tenants/${tenant.id}/decisions`)`. Render `DecisionTimeline`.

- [ ] **Step 3: Create `src/app/admin/tenants/[id]/page.tsx`**

Server component:

```typescript
import { adminService } from '@/lib/services'
import { notFound } from 'next/navigation'
import { TenantDetailTabs } from '@/components/admin/tenant-detail-tabs'
import { Badge } from '@/components/ui/badge'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TenantDetailPage({ params }: PageProps) {
  const { id } = await params
  let tenant
  try {
    tenant = await adminService.getTenant(id)
  } catch {
    notFound()
  }

  // Derive basic readiness from tenant fields
  const hasProfile = !!tenant.name
  const hasWhatsApp = !!tenant.whatsapp_phone_id
  const hasOrchestrator = !!tenant.orchestrator_config

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-title text-[22px] font-bold text-text-primary">{tenant.name}</h1>
            <span className="font-mono text-[13px] text-text-subtle">{tenant.slug}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            {hasProfile && hasWhatsApp && hasOrchestrator ? (
              <Badge variant="outline" className="border-emerald/30 bg-emerald/10 text-emerald">Pronto</Badge>
            ) : (
              <Badge variant="outline" className="border-gold/30 bg-gold/10 text-gold">Incompleto</Badge>
            )}
          </div>
        </div>
      </div>

      <TenantDetailTabs tenant={tenant} />
    </div>
  )
}
```

Note: The delete functionality with `ConfirmDialog` requiring slug input should be in `TenantDetailTabs` header area within the client component, since it requires client-side state.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/decision-timeline.tsx src/components/admin/tenant-detail-tabs.tsx src/app/admin/tenants/\[id\]/
git commit -m "feat: add tenant detail page with 4 tabs"
```

---

### Task 17: DLQ page

**Files:**
- Create: `src/components/admin/dlq-table.tsx`
- Create: `src/app/admin/dlq/page.tsx`

- [ ] **Step 1: Create `src/components/admin/dlq-table.tsx`**

Client component. Props:

```typescript
interface DLQTableProps {
  initialEntries: DLQEntry[]
}
```

Implementation:
- Import `DLQEntry` from `@/lib/types`
- Import `ConfirmDialog` from `@/components/common/confirm-dialog`
- Import `Button` from `@/components/ui/button`
- Import `clientApi` from `@/lib/api/client-api`
- Import `toast` from `sonner`
- Import `formatDate` from `@/lib/utils/format`
- Import `ChevronDown`, `RotateCcw` from `lucide-react`
- Import `motion`, `AnimatePresence` from `motion/react`

State: `entries` (local copy for optimistic updates), `expandedId` (string | null), `replayTarget` (DLQEntry | null for confirm dialog), `replaying` (boolean)

Table with columns: ID (truncated first 8 chars), Tipo, Data, Erro (truncated 60 chars), Ações

Expandable row: clicking row toggles `expandedId`. When expanded, show:
```tsx
<motion.tr initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
  <td colSpan={5} className="px-4 py-4">
    <pre className="overflow-auto rounded-lg bg-surface-2 p-4 font-mono text-[12px] text-text-muted">
      {JSON.stringify(entry.data, null, 2)}
    </pre>
  </td>
</motion.tr>
```

"Reprocessar" button → sets `replayTarget` → opens `ConfirmDialog` with title "Reprocessar evento", message "Tem certeza que deseja reprocessar este evento?", variant "default". On confirm: `clientApi(`/admin/dlq/${entry.id}/replay`, { method: 'POST' })` then toast.success, remove entry from local list.

- [ ] **Step 2: Create `src/app/admin/dlq/page.tsx`**

Server component:

```typescript
import { adminService } from '@/lib/services'
import { DLQTable } from '@/components/admin/dlq-table'
import { AlertTriangle } from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'

export default async function DLQPage() {
  const entries = await adminService.getDLQ()

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-danger/15 to-danger/5">
          <AlertTriangle className="h-[18px] w-[18px] text-danger" />
        </div>
        <div>
          <h1 className="font-title text-[22px] font-bold text-text-primary">Dead-Letter Queue</h1>
          <p className="text-[13px] text-text-muted">Eventos que falharam e podem ser reprocessados</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="DLQ vazia"
          description="Nenhum evento falho no momento. Tudo funcionando normalmente."
        />
      ) : (
        <DLQTable initialEntries={entries} />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/dlq-table.tsx src/app/admin/dlq/
git commit -m "feat: add DLQ page with expandable entries and replay"
```

---

## Final: Build verification

### Task 18: Build check and fix

- [ ] **Step 1: Run the build**

```bash
cd /Users/lucas-couto/www/athenio/olympus/olympus-frontend && npm run build
```

Expected: may have TypeScript errors or import issues.

- [ ] **Step 2: Fix any build errors**

Address any TypeScript errors, missing imports, or type mismatches that the build reveals. Common issues:
- Missing exports from barrel files
- Type mismatches between spec and actual API
- Import path issues

- [ ] **Step 3: Commit fixes**

```bash
git add -A
git commit -m "fix: resolve build errors from frontend spec v2 implementation"
```
