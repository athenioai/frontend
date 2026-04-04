# Frontend Spec V2 — Design Document

**Date:** 2026-04-04
**Source:** `olympus-backend/docs/frontend-specification.md`
**Scope:** Full implementation of new spec features — conversations, alerts, admin panel overhaul, infrastructure updates

---

## Approach

**3-stream parallel implementation with dependency ordering:**

1. **Stream 1 (Infrastructure):** Hooks, shared components, types, sidebar/middleware — everything else depends on this
2. **Stream 2 (Client Panel):** Conversations, Alerts, Dashboard update, Settings update — runs after Stream 1
3. **Stream 3 (Admin Panel):** Admin dashboard, Tenants CRUD, DLQ — runs after Stream 1

Streams 2 and 3 are fully independent and run in parallel.

## Design Constraints

- **Keep:** existing colors, fonts (Space Grotesk + Sora), logo, dark/light theme
- **Keep:** existing design system (card-surface, card-hero, card-glass, glow effects, grain texture)
- **Keep:** existing service layer pattern (interface → implementation → singleton export)
- **Keep:** existing component patterns (shadcn/ui, Motion animations, Lucide icons)
- **Framework:** Next.js 16 App Router, server components by default, client components where needed
- **Language:** Portuguese (pt-BR) for all UI labels

---

## Stream 1: Infrastructure

### New Hooks (`src/hooks/`)

#### `useAuth.ts`
Wraps Supabase browser client auth state.
```typescript
const { user, session, role, tenantId, isAdmin, isClient, logout } = useAuth()
```
- `user`: AuthUser (id, email, company_id, role, name)
- `role`: 'client' | 'admin'
- `tenantId`: user.company_id
- `isAdmin` / `isClient`: boolean helpers
- `logout()`: calls `/api/auth/logout` + redirect to `/login`

#### `useWebSocket.ts`
Real-time messaging via WebSocket.
```typescript
const { connected, lastMessage, messages } = useWebSocket()
```
- Connects to `ws://{NEXT_PUBLIC_API_URL}/ws?token={jwt}`
- Auto-reconnect with exponential backoff: 1s, 2s, 4s, 8s, max 30s
- Resets backoff on successful connection
- `connected`: 'connected' | 'reconnecting' | 'disconnected'
- `lastMessage`: latest WebSocket event
- `messages`: accumulated messages array

Events handled:
- `new_message` → add to message list if lead is open, increment unread count

#### `useReadiness.ts`
Client-side readiness check.
```typescript
const { readiness, loading, refetch } = useReadiness()
```
- Fetches via `clientApi<ReadinessResult>('/api/company/readiness')`
- Returns current ReadinessResult with loading state

#### `useApi.ts`
Generic data fetching hook for client components.
```typescript
const { data, loading, error, refetch } = useApi<T>(url, options?)
```
- Uses `clientApi` internally
- Auto-handles toast notifications on error based on HTTP status codes
- Supports manual refetch

### New Shared Components

#### `StatusBadge` (`src/components/common/status-badge.tsx`)
Generic badge with dynamic color based on value.
```typescript
type StatusBadgeProps = {
  status: string
  colorMap?: Record<string, 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange' | 'purple'>
}
```
Uses existing `Badge` component. Pre-built color maps exported for:
- `FUNNEL_COLORS`: greeting→gray, qualifying→blue, consulting→purple, negotiating→orange, closing→yellow, converted→green, lost→red
- `TEMPERATURE_COLORS`: cold→blue, warm→yellow, hot→red
- `CAMPAIGN_STATUS_COLORS`: active→green, paused→yellow, killed→red, scaling→blue
- `DECISION_TYPE_COLORS`: scale_budget→green, pause_campaigns→yellow, reduce_bids→orange, whale_detected→blue, handoff→purple, cycle_summary→gray, tenant_config_invalid→red, reflection_failed→red

#### `PriceInput` (`src/components/common/price-input.tsx`)
Monetary input for BRL.
- Shows "R$" prefix
- Accepts value in reais (e.g., "197,00")
- Stores value in centavos internally (value * 100)
- Display: `(cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })`
- Built on existing `Input` component

#### `ConfirmDialog` (`src/components/common/confirm-dialog.tsx`)
Destructive action confirmation modal.
- Uses existing `Dialog` component
- Props: title, message, confirmLabel, variant ('destructive' | 'default'), onConfirm, requireSlug?: string
- Destructive → red confirm button; default → blue
- When `requireSlug` is set → user must type the slug to enable confirm button

#### `ChipInput` (`src/components/common/chip-input.tsx`)
Array input with chips (tags).
- Type + Enter → adds chip
- X button on chip → removes
- `maxItems` prop (optional)
- Built on existing `Input` component
- Extracted from existing onboarding form patterns (differentials, benefits, etc.)

#### `EmptyState` (`src/components/common/empty-state.tsx`)
Empty state placeholder for lists.
- Props: icon (Lucide icon component), title, description, actionLabel?, actionHref?
- Motion `fadeInUp` entrance animation
- Optional CTA button

### Sidebar Update (`src/components/layout/sidebar.tsx`)

Add to `NAV_MAIN` (after Campanhas):
```typescript
{ href: '/conversas', label: 'Conversas', icon: MessageSquare },
{ href: '/alertas', label: 'Alertas', icon: Bell },
```

Admin section: when user is on `/admin/*` routes, show expanded admin nav:
```typescript
const NAV_ADMIN = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/tenants', label: 'Clientes', icon: Building2 },
  { href: '/admin/dlq', label: 'DLQ', icon: AlertTriangle },
]
```

### Middleware Update (`src/middleware.ts`)

- Add `/admin/tenants`, `/admin/dlq`, `/admin/dashboard` to admin-protected paths
- Existing logic sufficient — already checks `role === 'admin'` for `/admin*`

### New Types

#### Admin types (`src/lib/types/admin.ts`)
```typescript
type Tenant = {
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

type HandoffConfig = {
  max_negative_turns: number
  max_llm_failures: number
  whale_auto_takeover: boolean
  escalation_phone?: string
}

type OrchestratorConfig = {
  budget_near_limit_threshold: number
  bottleneck_threshold: number
  whale_score_threshold: number
  budget_scale_factor: number
  roas_target_modifier: number
}

type TenantQuotas = {
  rate_limit_per_hour: number
  max_whatsapp_instances: number
  monthly_message_quota: number
}

type CreateTenantPayload = Omit<Tenant, 'id' | 'created_at' | 'updated_at'>

type OrchestratorDecision = {
  id: string
  tenant_id: string
  type: 'scale_budget' | 'pause_campaigns' | 'reduce_bids' | 'whale_detected' | 'handoff' | 'cycle_summary' | 'tenant_config_invalid' | 'reflection_failed'
  input_summary: string
  result: string
  created_at: string
}

type DLQEntry = {
  id: string
  job_type: string
  data: Record<string, unknown>
  error: string
  created_at: string
}
```

#### Agent types (`src/lib/types/agent.ts`)
```typescript
type AgentStatus = {
  name: string
  status: 'online' | 'offline'
  active_conversations?: number
  active_campaigns?: number
}
```

### Updated Services

#### `AdminService` (`src/lib/services/admin-service.ts`)
Expand existing service with new methods:
```typescript
interface IAdminService {
  // Existing
  listCompanies(): Promise<CompanySummary[]>
  // New
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

#### `ConversationService` (`src/lib/services/conversation-service.ts`)
New service for conversation management:
```typescript
interface IConversationService {
  list(companyId: string, params?: { filter?: string; search?: string }): Promise<ConversationSummary[]>
  getMessages(leadId: string): Promise<Message[]>
  sendMessage(leadId: string, content: string): Promise<Message>
}
```

#### `AgentService` (`src/lib/services/agent-service.ts`)
New service for agent status:
```typescript
interface IAgentService {
  getStatus(companyId: string): Promise<AgentStatus[]>
}
```

#### `HealthService` (`src/lib/services/health-service.ts`)
New service for system health:
```typescript
interface IHealthService {
  check(): Promise<SystemHealth>
}

type SystemHealth = {
  supabase: boolean
  redis: boolean
  kairos: boolean
  ares: boolean
  whatsapp: boolean
}
```

---

## Stream 2: Client Panel

### Conversations Page (`/conversas`)

**Route:** `src/app/(authenticated)/conversas/page.tsx` (server component)
**Client Component:** `src/components/conversations/conversation-panel.tsx`

**Layout:** Two-column split — list (left, 380px) + chat (right, flex-1).

**Conversation List (left column):**
- Server-fetched initial data via `conversationService.list()`
- Each item: lead name, last message preview (truncated 60 chars), relative timestamp
- StatusBadge for conversation status: 🟢 Ativo, 🤖 Bot, 👤 Humano, 🐋 Whale
- Filter dropdown: Todos | Bot | Humano | Whale
- Search input: filter by name/phone
- Selected conversation highlighted with `sidebar-active-bg` style
- EmptyState when no conversations

**Chat View (right column):**
- Header bar: lead name, phone, `StatusBadge` for funnel_stage + temperature
- Message list (scrollable):
  - Inbound (lead): left-aligned, `surface-2` bg, rounded-br corners
  - Outbound (bot/human): right-aligned, subtle accent gradient bg, rounded-bl corners
  - Small badge below each outbound message: LLM model name or "humano"
  - Timestamp on hover
  - New messages enter with `fadeInUp` motion
  - Auto-scroll to bottom on new messages
- Input bar (fixed bottom): text input + send button
- "Assumir conversa" button in header (sets `is_human_takeover = true`)

**WebSocket integration:**
- `useWebSocket` hook for real-time `new_message` events
- When a message arrives for the currently-open lead → append to chat, auto-scroll
- When a message arrives for a different lead → increment unread badge on list item

**Mobile:**
- Full-width conversation list
- Tapping a conversation → full-width chat view with "← Voltar" button in header

### Alerts Page (`/alertas`)

**Route:** `src/app/(authenticated)/alertas/page.tsx` (server component)

**Layout:** Vertical timeline with connecting gradient line.

- Centered line: 2px, gradient from `accent/20` at top to `transparent` at bottom
- Each alert card positioned relative to the line
- Alert card content:
  - Left: colored dot on the timeline line (color by type)
  - Right: `card-surface` with icon, message, relative timestamp
- Alert type → icon + color:
  - `sale_confirmed` → DollarSign, emerald
  - `whale_detected` → Crown, accent
  - `campaign_paused` → PauseCircle, gold
  - `sensor_failure` → AlertTriangle, danger
  - `human_requested` → UserCheck, violet
- Staggered entrance animation (delay per card)
- EmptyState when no alerts

### Dashboard Update

**New section: "Status dos Agentes"** (after existing "Agentes IA" section)
- Grid of 2 cards (Kairos, Ares):
  - Agent name + animated status dot (green pulsing = online, red = offline)
  - Key metric: "Conversas ativas: X" (Kairos) / "Campanhas ativas: X" (Ares)
  - `card-surface` styling
- Data from `GET /agents` (new `agentService.getStatus()`)

**New section: "Atividade Recente"** (2-column grid before existing alerts section)
- Column 1: Latest 5 conversations (name, last msg preview, time) — link to `/conversas`
- Column 2: Latest 5 alerts (type icon, message, time) — link to `/alertas`

### Settings Page (`/configuracoes`) — 3 Tabs

Restructure existing page into tabbed layout using existing `Tabs` component.

**Tab 1: "Perfil da Empresa"**
- Reuse `CompanyProfileForm` from `src/components/onboarding/company-profile-form.tsx`
- Pre-fill with `GET /api/company/profile`
- Save via `PUT /api/company/profile`

**Tab 2: "Configurações Operacionais"**
- Fields: ROAS alvo (number input), CPL máximo (number input), Budget diário (`PriceInput`), Limite do cartão (`PriceInput`), Telefone para alertas (phone input)
- Data from `GET /company` → save via `PUT /company`

**Tab 3: "Status do Sistema"**
- Readiness checklist — reuse `ReadinessChecklist` from `src/components/onboarding/readiness-checklist.tsx`
- Agent status cards (same component as dashboard)
- System health status from `GET /health`

---

## Stream 3: Admin Panel

### Route Structure

```
src/app/admin/
├── layout.tsx            ← Admin-specific layout with admin sidebar nav
├── dashboard/page.tsx    ← Admin dashboard
├── tenants/
│   ├── page.tsx          ← Tenant list
│   ├── new/page.tsx      ← Create tenant
│   └── [id]/
│       └── page.tsx      ← Tenant detail (4 tabs)
└── dlq/page.tsx          ← Dead-Letter Queue
```

### Admin Layout (`src/app/admin/layout.tsx`)

Uses existing `auth-shell.tsx` but passes admin-specific sidebar config. The Sidebar component receives different nav items when in admin mode. Header shows "Painel Admin" center text.

### Admin Dashboard (`/admin/dashboard`)

**Row 1 — KPIs (3 cards):**
- Total de Clientes → `KpiCard` with Building2 icon, accent color
- Total de Leads → `KpiCard` with Users icon, emerald color
- Total de Whales → `KpiCard` with Crown icon, gold color
- Data: `GET /admin/dashboard`

**Row 2 — System Health:**
- Single wide `card-hero` with 5 status indicators in a horizontal grid
- Each: service name (Supabase, Redis, Kairos, Ares, WhatsApp) + animated dot (green = up, red = down)
- Data: `GET /health`

**Row 3 — Client List with Readiness:**
- `Table` component: Nome, Slug, Readiness (`StatusBadge` ✅/⚠️), Leads count, Created date
- Rows clickable → navigate to `/admin/tenants/:id`
- Data: `GET /admin/tenants`

### Tenant List (`/admin/tenants`)

- Table with search by name/slug
- Columns: Nome, Slug, Data de Criação, Ações (view button)
- "Novo Cliente" button → `/admin/tenants/new`
- Row hover effect using `card-surface-interactive` pattern
- EmptyState when no tenants

### Create Tenant (`/admin/tenants/new`)

Form with 6 Accordion sections (all collapsible, first open by default).

**Section 1: Dados Básicos**
- Nome (required Input)
- Slug (auto-generated from name via kebab-case, editable Input)
- Tom de voz (Select: Formal, Informal, Neutro, Ousado)
- Script de abordagem (Textarea)

**Section 2: Pagamentos**
- Chave Asaas (password Input with eye toggle)
- Chave Stripe (password Input with eye toggle)

**Section 3: Meta Ads**
- Meta Account ID (Input)
- Meta Access Token (password Input with eye toggle)
- Pixel ID (Input)
- WhatsApp Phone ID (Input)
- WhatsApp Token (password Input with eye toggle)

**Section 4: Configuração Operacional**
- Budget diário (PriceInput)
- Limite do cartão (PriceInput)
- ROAS alvo (number Input)
- CPA máximo (number Input)
- Telefone para alertas (phone Input)
- Concorrentes (ChipInput)

**Section 5: Configuração Avançada**
- Handoff: max_negative_turns (number, default 2), max_llm_failures (number, default 2), whale_auto_takeover (toggle, default true), escalation_phone (phone Input)
- Orchestrator: budget_near_limit_threshold (%, default 90), bottleneck_threshold (ms, default 120000), whale_score_threshold (0-100, default 85), budget_scale_factor (%, default 15), roas_target_modifier (number, default 1.0)

**Section 6: Quotas**
- rate_limit_per_hour (number, default 200)
- max_whatsapp_instances (number, default 3)
- monthly_message_quota (number, default 10000)

"Criar Cliente" button at bottom → `POST /admin/tenants`
Toast on success → redirect to `/admin/tenants/:id`

### Tenant Detail (`/admin/tenants/[id]`)

**Header:**
- Tenant name + slug
- Readiness badge (✅ Pronto / ⚠️ Incompleto)
- "Editar" button (enables form editing in Tab 2)
- "Excluir" button → `ConfirmDialog` requiring slug input → `DELETE /admin/tenants/:id`

**4 Tabs:**

**Tab 1: Visão Geral**
- Readiness checklist (5 items with ✅/❌): company_profile, products, knowledge_base, whatsapp, orchestrator_config
- Stats row: number of products, number of leads
- Company profile summary (if exists): name, segment, target audience

**Tab 2: Configuração**
- Same form as create page, pre-filled from `GET /admin/tenants/:id`
- API keys shown masked: `sk_l****_xyz` format
- Badge "Configurado" (green) / "Não configurado" (gray) next to each API key field
- Clear field + type new value to update a key
- "Salvar alterações" button → `PUT /admin/tenants/:id`

**Tab 3: Leads**
- Paginated table of tenant's leads
- Columns: Nome, Telefone, Temp (StatusBadge), Funil (StatusBadge), Whale (boolean badge), Agente, Atualizado (relative time)
- Pagination controls (limit + offset)
- Data: `GET /admin/tenants/:id/leads`

**Tab 4: Decisões**
- Vertical timeline (same visual pattern as `/alertas`)
- Each decision card: type (StatusBadge with DECISION_TYPE_COLORS), input summary, result, timestamp
- Most recent first
- Decision types with colors:
  - `scale_budget` → emerald
  - `pause_campaigns` → gold
  - `reduce_bids` → orange/warning
  - `whale_detected` → accent
  - `handoff` → violet
  - `cycle_summary` → gray
  - `tenant_config_invalid` → danger
  - `reflection_failed` → danger
- Data: `GET /admin/tenants/:id/decisions`

### DLQ Page (`/admin/dlq`)

- Table: ID (truncated), Tipo (job name), Data (formatted), Erro (truncated)
- Expandable rows: click to expand → full JSON data display
  - JSON rendered in `<pre>` with monospace font, `surface-2` bg, `rounded-lg` padding
  - Syntax-aware formatting with `JSON.stringify(data, null, 2)`
- "Reprocessar" button per row → `ConfirmDialog` ("Tem certeza que deseja reprocessar este evento?") → `POST /admin/dlq/:id/replay`
- Toast on success/failure
- EmptyState when DLQ is empty

---

## Error Handling

Follows spec HTTP code mapping. Implemented in `useApi` hook and service layer:

| Code | Frontend Action |
|------|----------------|
| 400 | Show field-level validation errors |
| 401 | Redirect to `/login` |
| 403 | Toast: "Você não tem permissão para esta ação" |
| 404 | Toast or 404 page |
| 409 | Toast: "Este recurso já existe" |
| 429 | Toast: "Muitas requisições. Aguarde um momento." |
| 500 | Toast: "Erro interno. Tente novamente." |
| 503 | Banner: "Serviço temporariamente indisponível" |

Toast system: Sonner (already installed and configured).

---

## Responsiveness

| Breakpoint | Layout |
|------------|--------|
| Desktop (≥1024px) | Sidebar fixa + conteúdo |
| Tablet (768-1023px) | Sidebar colapsável + conteúdo |
| Mobile (< 768px) | Sidebar hamburger + full width |

**Conversations on mobile:** List → full width. Chat → full width with "← Voltar" header button. No side-by-side.

**Tables on mobile:** Horizontally scrollable with `overflow-x-auto`.

---

## Files Created/Modified Summary

### New Files (~35)
- `src/hooks/useAuth.ts`
- `src/hooks/useWebSocket.ts`
- `src/hooks/useReadiness.ts`
- `src/hooks/useApi.ts`
- `src/components/common/status-badge.tsx`
- `src/components/common/price-input.tsx`
- `src/components/common/confirm-dialog.tsx`
- `src/components/common/chip-input.tsx`
- `src/components/common/empty-state.tsx`
- `src/components/conversations/conversation-panel.tsx`
- `src/components/conversations/conversation-list.tsx`
- `src/components/conversations/chat-view.tsx`
- `src/components/alerts/alert-timeline.tsx`
- `src/components/admin/system-health-card.tsx`
- `src/components/admin/tenant-form.tsx`
- `src/components/admin/tenant-detail-tabs.tsx`
- `src/components/admin/dlq-table.tsx`
- `src/components/admin/decision-timeline.tsx`
- `src/app/(authenticated)/conversas/page.tsx`
- `src/app/(authenticated)/alertas/page.tsx`
- `src/app/admin/layout.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/tenants/page.tsx`
- `src/app/admin/tenants/new/page.tsx`
- `src/app/admin/tenants/[id]/page.tsx`
- `src/app/admin/dlq/page.tsx`
- `src/lib/types/admin.ts`
- `src/lib/types/agent.ts`
- `src/lib/services/interfaces/conversation-service.ts`
- `src/lib/services/interfaces/agent-service.ts`
- `src/lib/services/interfaces/health-service.ts`
- `src/lib/services/conversation-service.ts`
- `src/lib/services/agent-service.ts`
- `src/lib/services/health-service.ts`

### Modified Files (~10)
- `src/components/layout/sidebar.tsx` — add Conversas, Alertas, expanded admin nav
- `src/app/(authenticated)/dashboard/page.tsx` — add agent status + activity sections
- `src/app/(authenticated)/configuracoes/page.tsx` — restructure into 3 tabs
- `src/lib/types/index.ts` — export new types
- `src/lib/services/index.ts` — export new services
- `src/lib/services/admin-service.ts` — expand with tenant CRUD, DLQ, decisions
- `src/lib/services/interfaces/admin-service.ts` — expand interface
- `src/middleware.ts` — ensure admin sub-routes protected
- `src/app/admin/page.tsx` — redirect to `/admin/dashboard`
