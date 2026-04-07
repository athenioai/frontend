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
│   │   ├── dashboard/                  # Página de boas-vindas + quick links
│   │   ├── conversas/                  # Chat WhatsApp-style (split panel)
│   │   ├── agenda/                     # Calendário dia/semana/mês (Google Calendar)
│   │   ├── configuracoes/              # Configurações com tabs (Agenda, Perfil, Notificações)
│   │   └── admin/                      # Admin-only (guard por role)
│   │       ├── dashboard/              # Dashboard admin (stat cards + gráficos)
│   │       ├── planos/                 # CRUD de planos
│   │       └── usuarios/              # Gestão de usuários + contexto por user
│   │           └── [id]/              # Visualização do user (4 tabs)
│
├── components/
│   ├── ui/                             # Componentes base (button, input, label, logo)
│   ├── sidebar.tsx                     # Sidebar colapsável + seção admin condicional
│   └── providers.tsx                   # Provider wrapper
│
├── lib/
│   ├── services/                       # 8 services (class-based, authFetch + cookies)
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
| **Dashboard** | Boas-vindas com saudação por horário, stat cards placeholder e links rápidos para Conversas, Agendamentos e Performance. |
| **Conversas** | Split panel estilo WhatsApp. Lista de sessões à esquerda, thread de mensagens à direita com bubbles (lead/assistant), timestamps, badge de agendamento, input bar com modo takeover. |
| **Agenda** | Calendário com 3 views (Dia/Semana/Mês). Blocos de agendamento posicionados por horário, indicador de hora atual, navegação por setas, modal de detalhe. |
| **Configurações** | Tabs (Agenda, Perfil, Notificações). Tab Agenda: editor de horários por dia (toggle + time inputs), duração do slot, antecedência. |

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
3. Middleware intercepta requests: se access_token expirou, tenta refresh via `/auth/refresh` e seta novos cookies
4. Falha no refresh → limpa cookies e redireciona para `/login`
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

---

## Segurança

- **RBAC**: Admin layout guard verifica `user.role === 'admin'`
- **Security Headers**: X-Frame-Options (DENY), HSTS, X-Content-Type-Options (nosniff), Referrer-Policy, Permissions-Policy
- **Cookies**: httpOnly, sameSite: lax, secure em produção
- **Error Handling**: Mensagens genéricas para o cliente (sem leakage de erros do backend)
- **File Upload**: Validação de MIME type + magic bytes (`%PDF-`) para uploads de contrato
- **CSRF**: Proteção nativa do Next.js via server actions

Relatório completo: `docs/security/audit-2026-04-06.md`

---

## Specs

Especificações formais (SVVA) em `docs/specs/`:

| Spec | Feature |
|------|---------|
| `SPEC-plans.yaml` | Admin Plans CRUD |
| `SPEC-admin-users.yaml` | Admin Users Management |
| `SPEC-admin-dashboard.yaml` | Admin Dashboard |
| `SPEC-admin-user-context.yaml` | Admin User Context View |

---

## Desenvolvimento

- Labels em Português (pt-BR)
- Moeda: BRL (`R$ 1.234,50`)
- CNPJ: `XX.XXX.XXX/XXXX-XX`
- Tema: Dark-only (classe `dark` no `<html>`)
- Padding padrão: `px-6 py-8 lg:py-10`
- Fontes: Space Grotesk (títulos) + Sora (corpo)
