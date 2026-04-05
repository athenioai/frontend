# Olympus Frontend

Dashboard for [Athenio.ai](https://athenio.ai) autonomous AI sales agents. This is the command center where business owners monitor their AI-driven sales pipeline, manage products and knowledge bases, track conversations with leads, and review real-time analytics. It also includes an internal admin panel for the Athenio team to manage tenants and system health.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.1 |
| Language | TypeScript (strict) | 5.x |
| UI Components | React + shadcn/ui | 19.2.4 |
| Styling | Tailwind CSS v4 (CSS-first config) | 4.x |
| Animations | Motion (Framer Motion) | 12.x |
| Charts | Recharts | 3.8.1 |
| Auth | Supabase Auth (cookie-based sessions) | |
| Icons | Lucide React | |
| Tests | Vitest | |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
git clone <repo-url>
cd olympus-frontend
cp .env.local.example .env.local
# Fill in the environment variables (see below)
npm install
npm run dev
```

The dev server starts at `http://localhost:3000`.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (watch mode) |
| `npm run test:run` | Vitest (single run) |

---

## Environment Variables

Create a `.env.local` file from `.env.local.example` with the following variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key |
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:3003`) |

---

## Project Structure

```
src/
├── app/
│   ├── login/                     # Login page
│   ├── onboarding/                # Fullscreen onboarding wizard (4 steps)
│   ├── (authenticated)/           # Protected client routes (sidebar layout)
│   │   ├── dashboard/             # Bento grid dashboard with KPIs and alerts
│   │   ├── conversas/             # Real-time conversations with leads
│   │   ├── alertas/               # Alert timeline
│   │   ├── leads/                 # Lead table + detail view
│   │   ├── campanhas/             # Campaign management
│   │   ├── produtos/              # Product and variant CRUD
│   │   ├── knowledge-base/        # Q&A knowledge base CRUD
│   │   ├── funil/                 # Sales funnel visualization
│   │   ├── relatorios/            # PDF report generation
│   │   ├── suporte/               # AI support chat
│   │   └── configuracoes/         # Settings (profile, operations, system status)
│   ├── admin/                     # Admin panel (role-gated)
│   │   ├── dashboard/             # Admin KPIs and system health
│   │   ├── tenants/               # Tenant CRUD (list, create, detail)
│   │   └── dlq/                   # Dead-letter queue management
│   └── api/                       # API routes (auth, leads, campaigns, PDF)
│
├── components/
│   ├── ui/                        # shadcn/ui base components
│   ├── common/                    # Shared components (StatusBadge, ConfirmDialog, etc.)
│   ├── layout/                    # App shell (sidebar, topbar, command palette)
│   ├── charts/                    # Recharts wrappers (gauge, funnel, bar, line)
│   ├── widgets/                   # Dashboard widgets (ROI, health, KPIs, agents)
│   ├── onboarding/                # Onboarding wizard components
│   ├── conversations/             # Conversation panel and chat view
│   ├── alerts/                    # Alert timeline component
│   ├── leads/                     # Lead table and detail components
│   ├── admin/                     # Admin-specific components
│   └── skeletons/                 # Loading skeleton components
│
├── hooks/
│   ├── useAuth.ts                 # Auth state (user, role, logout)
│   ├── useWebSocket.ts            # Real-time messaging via WebSocket
│   ├── useReadiness.ts            # Client-side readiness check
│   └── useApi.ts                  # Generic data fetching with error handling
│
└── lib/
    ├── types/                     # Domain TypeScript interfaces
    ├── services/
    │   ├── interfaces/            # Service contracts (13 interfaces)
    │   └── ...                    # Service implementations
    ├── api/                       # Client-side API helpers
    ├── constants/                 # Theme palette and color helpers
    ├── motion.ts                  # Animation constants (durations, easings)
    └── utils/                     # Formatting utilities (currency, dates, phone)
```

---

## Features

### Client Panel

| Page | Description |
|------|-------------|
| **Dashboard** | Bento grid with ROI, health score gauge, KPIs, sales funnel, agent status, recent activity, and alerts. Shows readiness banner when onboarding is incomplete. |
| **Conversations** | Two-column real-time chat interface with lead conversations. WebSocket-powered with human takeover support. |
| **Alerts** | Vertical timeline of system alerts (sales, whale detection, campaign pauses, sensor failures). |
| **Leads** | Filterable lead table with search, temperature/funnel filters, and detail view with conversation history and payment logs. |
| **Campaigns** | Campaign grid with status, ROAS, CPL metrics, and performance charts. |
| **Products** | CRUD for products and pricing variants with billing cycle management. |
| **Knowledge Base** | CRUD for Q&A entries (AI-generated and manual) used by sales agents. |
| **Sales Funnel** | Full-width funnel visualization with period toggles and conversion rates. |
| **Reports** | Monthly PDF report generation and download. |
| **Settings** | Three tabs: company profile, operational config (budget, ROAS targets), and system status. |
| **Support** | AI-powered support chat with ticket history. |
| **Onboarding** | Fullscreen 4-step wizard: company profile, products, knowledge base, readiness checklist. |

### Admin Panel

| Page | Description |
|------|-------------|
| **Dashboard** | KPI cards (total clients, leads, whales), system health indicators, and client list with readiness status. |
| **Tenants** | Full CRUD for tenant management with configuration for payments, Meta Ads, WhatsApp, orchestrator settings, and quotas. |
| **Tenant Detail** | Four tabs: overview with readiness checklist, full configuration form, paginated leads table, and orchestrator decision timeline. |
| **DLQ** | Dead-letter queue viewer with expandable JSON details and replay functionality. |

---

## Architecture

### Server Components by Default

Pages use React Server Components for data fetching. Client components (`'use client'`) are used only where browser APIs are required: charts (Recharts needs DOM), forms, animations (Motion), and real-time features (WebSocket).

### Service Layer

All data access is abstracted behind service interfaces, allowing the data source to be swapped without changing UI code:

```
Page (Server Component) --> Service Interface --> Implementation (mock or Supabase)
Client Component        --> clientApi          --> Backend API
```

### Authentication

- Login via Supabase Auth (email/password)
- Session stored in HTTP-only cookies
- Middleware validates sessions on all protected routes
- Routes under `/admin/*` require `role === 'admin'`

### Routing

The `(authenticated)` route group applies the shared app shell (sidebar, topbar, command palette) to all client-facing pages. Admin routes use a separate layout with admin-specific navigation.

---

## Development Notes

- All UI labels are in Brazilian Portuguese (pt-BR)
- Currency formatting follows BRL conventions (`R$ 1.234,50`)
- Dates use `dd/mm/yyyy` with `America/Sao_Paulo` timezone
- Dark mode is the default theme; light mode is also supported
- The command palette (`Cmd+K` / `Ctrl+K`) provides quick navigation across all pages
