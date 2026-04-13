# Olympus — Sua Empresa Autônoma

Dashboard do [Athenio.ai](https://athenio.ai) para acompanhar agentes de IA autônomos. Painel onde o dono do negócio monitora conversas, agendamentos, leads e configurações. Inclui painel administrativo para gestão de planos, usuários e métricas.

---

## Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.2.1 |
| Linguagem | TypeScript (strict) | 5.x |
| UI | React + shadcn/ui + Base UI | 19.2.4 |
| Estilo | Tailwind CSS v4 | 4.x |
| Animações | Motion (Framer Motion) | 12.x |
| Gráficos | Recharts | 3.8.1 |
| Auth | Custom JWT (httpOnly cookies) | — |
| Validação | Zod | 4.x |
| Ícones | Lucide React | — |
| Testes | Vitest | 4.x |

---

## Setup

```bash
git clone <repo-url>
cd olympus-frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Dev server em `http://localhost:3000`.

### Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Rodar build de produção |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (watch) |
| `npm run test:run` | Vitest (single run) |

### Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | URL da API backend (default: `http://localhost:3003`) |

---

## Estrutura

```
src/
├── app/
│   ├── login/                          # Login (email/password)
│   ├── forgot-password/                # Recuperação de senha
│   ├── (authenticated)/                # Rotas protegidas
│   │   ├── dashboard/                  # Boas-vindas + métricas financeiras e operacionais
│   │   ├── conversas/                  # Chat WhatsApp-style (split panel)
│   │   ├── agenda/                     # Calendário dia/semana/mês (Google Calendar)
│   │   ├── crm/                        # Kanban de leads por status
│   │   ├── catalogo/                   # Catálogo de serviços e produtos (workType-aware)
│   │   ├── cobrancas/                  # Cobranças a leads (CRUD + nova cobrança)
│   │   ├── configuracoes/              # Tabs: Agenda, Perfil, Financeiro (pré-pagamento, juros, gateway)
│   │   └── admin/                      # Admin-only (guard por role)
│   │       ├── dashboard/              # Dashboard admin (MRR, assinaturas, inadimplência)
│   │       ├── planos/                 # CRUD de planos
│   │       ├── usuarios/              # Gestão de usuários + contexto por user
│   │       │   └── [id]/              # Visualização do user (4 tabs)
│   │       ├── assinaturas/           # Assinaturas Olympus por usuário
│   │       └── faturas/               # Faturas de cobrança da plataforma
│
├── components/
│   ├── ui/                             # Componentes base (button, input, label, logo)
│   ├── sidebar.tsx                     # Sidebar colapsável + seção admin condicional
│   └── providers.tsx                   # Provider wrapper
│
├── lib/
│   ├── services/                       # 12 services (class-based, authFetch + cookies)
│   │   ├── interfaces/                 # Contratos TypeScript
│   │   └── __tests__/                  # Testes unitários
│   ├── format.ts                       # Formatação (data, hora, CNPJ, moeda)
│   ├── motion.ts                       # Constantes de animação
│   └── utils.ts                        # cn() (clsx + tailwind-merge)
│
├── middleware.ts                        # Token refresh + auth redirect
```

---

## Módulos

### Painel do Usuário

| Página | Descrição |
|--------|-----------|
| **Dashboard** | Boas-vindas com saudação por horário, métricas financeiras (receita, pendente, vencido, ticket médio), conversas, agendamentos, leads e ROI. |
| **Conversas** | Split panel estilo WhatsApp. Lista de sessões à esquerda, thread de mensagens à direita com bubbles (lead/assistant), timestamps, badge de agendamento, input bar com modo takeover. |
| **Agenda** | Calendário com 3 views (Dia/Semana/Mês). Blocos de agendamento posicionados por horário, indicador de hora atual, navegação por setas, modal de detalhe. |
| **CRM** | Kanban de leads por status (Novo, Contatado, Qualificado, Convertido, Perdido). Drag & drop entre colunas, timeline por lead. |
| **Catálogo** | Serviços e produtos com preço, descontos PIX/cartão e **desconto especial** (nome + % + período). Badge âmbar "X% OFF" quando ativo. Visibilidade por `work_type` (services/sales/hybrid). |
| **Cobranças** | Lista de cobranças com filtros por status/tipo/lead. Formulário de nova cobrança (item do catálogo ou manual livre). |
| **Configurações** | Tabs: Agenda (horários, slot, antecedência), Perfil, Financeiro (pré-pagamento, multa, juros, gateway). |

### Painel Admin

| Página | Descrição |
|--------|-----------|
| **Dashboard** | Hero card MRR, 4 stat cards interativos (Usuários, Agendamentos, Leads, Chats) com progress bars, donut chart de planos, bar chart de receita por plano. |
| **Planos** | Tabela CRUD com busca, modal criar/editar (nome + custo R$), modal deletar com confirmação, paginação. Erro 409 inline. |
| **Usuários** | Tabela com status (Ativo/Pendente), CNPJ formatado, busca, filtros por status e plano, headers ordenáveis, modal criar com upload PDF (dropzone + validação magic byte). |
| **Contexto do Usuário** | Hero header com avatar + info. 4 tabs: Dashboard (métricas do user via API), Conversas (WhatsApp split panel), Agenda (calendário dia/semana/mês), Configurações (editável pelo admin). |

---

## Autenticação

1. Login via email/password → backend retorna JWT tokens
2. Tokens armazenados em cookies httpOnly (access_token + refresh_token)
3. **Middleware** intercepta requests:
   - Parseia JWT para detectar expiração (com buffer de 30s)
   - Token expirado + refresh_token → refresh no middleware e seta novos cookies
   - Sem access_token + refresh_token → tenta refresh
   - Falha no refresh → limpa cookies e redireciona para `/login`
4. **authFetch / getSession**: Em caso de 401 (token revogado), `tryRefresh()` faz refresh in-memory. `cookies().set()` é tentado, mas em contexto de Server Component o set é silenciado (Next.js 16 só permite set em Server Actions, Route Handlers e Middleware). O token in-memory funciona para o request atual; no próximo navigation o middleware resolve.
5. AuthUser possui campo `role` (`admin` | `user`)
6. Rotas `/admin/*` protegidas por layout guard (`user.role !== 'admin'` → 404)

---

## Service Layer

Todas as chamadas à API são feitas via classes de serviço com autenticação automática:

```
Server Component → Service Class → authFetch (cookie) → Backend API
Server Action    → Service Class → authFetch (cookie) → Backend API
```

| Serviço | Endpoint Base | Métodos |
|---------|--------------|---------|
| AuthService | `/auth/*` | login, logout, getSession, tryRefresh |
| ChatService | `/chats/*` | listSessions, getMessages, deleteSession |
| AppointmentService | `/appointments/*` | list, getById |
| CalendarConfigService | `/calendar-config` | get, update |
| PlanService | `/admin/plans/*` | list, getById, create, update, delete |
| AdminUserService | `/admin/users/*` | list, getById, create (multipart) |
| AdminDashboardService | `/admin/dashboard` | get |
| AdminUserDataService | `/admin/users/:id/*` | getDashboard, getChats, getChatMessages, getAppointments, getCalendarConfig, updateCalendarConfig |
| LeadService | `/leads/*` | listLeads, createLead, updateLead, deleteLead, getBoard, getTimeline |
| FinanceService | `/services`, `/products`, `/invoices`, `/financial-settings`, `/admin/subscriptions`, `/admin/invoices` | CRUD catálogo, cobranças, assinaturas, dashboard financeiro |
| WhatsAppService | `/whatsapp/*` | sendMessage, listTemplates, getMessageStatus |
| ChannelAccountService | `/channel-accounts/*` | list, create, update, delete |

---

## Segurança

- **RBAC**: Admin layout guard verifica `user.role === 'admin'`
- **Security Headers**: X-Frame-Options (DENY), HSTS, X-Content-Type-Options (nosniff), Referrer-Policy, Permissions-Policy
- **Cookies**: httpOnly, sameSite: lax, secure em produção
- **Error Handling**: Mensagens genéricas para o cliente (sem leakage de erros do backend)
- **File Upload**: Validação de MIME type + magic bytes (`%PDF-`) para uploads de contrato
- **CSRF**: Proteção nativa do Next.js via server actions
- **Validação de Input**: Zod schemas nos módulos financeiros (cobranças, catálogo) — UUID, ranges, whitelists
- **Token Refresh Seguro**: JWT expiry detection no middleware + try/catch em `cookies().set()` para Server Components

Relatórios de segurança em `docs/security/`:

| Relatório | Escopo |
|-----------|--------|
| `audit-2026-04-06.md` | Auditoria geral do frontend |
| `audit-whatsapp-module-2026-04-07.md` | Módulo WhatsApp |
| `audit-frontend-performance-2026-04-09.md` | Performance |
| `audit-crm-module-2026-04-10.md` | Módulo CRM |
| `audit-financial-modules-2026-04-12.md` | Módulos financeiros (9 findings, todos remediados) |

---

## Specs

Especificações formais (SVVA) em `docs/specs/`:

| Spec | Feature |
|------|---------|
| `SPEC-plans.yaml` | Admin Plans CRUD |
| `SPEC-admin-users.yaml` | Admin Users Management |
| `SPEC-admin-dashboard.yaml` | Admin Dashboard |
| `SPEC-admin-user-context.yaml` | Admin User Context View |
| `SPEC-design-tokens-v2.yaml` | Design System v2 (paleta + tipografia) |
| `SPEC-frontend-performance.yaml` | Performance optimizations |
| `SPEC-crm-module.yaml` | CRM Kanban + Lead Timeline |
| `SPEC-whatsapp-module.yaml` | WhatsApp Business API |

---

## Desenvolvimento

- Labels em Português (pt-BR)
- Moeda: BRL (`R$ 1.234,50`)
- CNPJ: `XX.XXX.XXX/XXXX-XX`
- Tema: Light-only (Pedra Clara `#F7F6F4`, accent Âmbar `#D4820A`, Teal para links)
- Padding padrão: `px-6 py-8 lg:py-10`
- Fontes: Georgia (títulos/display) + Calibri (UI/corpo, fallback Space Grotesk)
