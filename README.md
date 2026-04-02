# Athenio.ai — Dashboard de Operacoes

Painel de controle em tempo real para gerenciamento de agentes de IA que operam campanhas de marketing, qualificacao de leads e vendas via WhatsApp. O dashboard conecta o empresario aos agentes **Hermes** (Marketing), **Ares** (Comercial) e **Athena** (Orquestradora), dando visibilidade total sobre ROI, funil, conversas e saude da operacao.

---

## Objetivo do Sistema

O Athenio e uma plataforma onde agentes de IA autonomos gerenciam todo o ciclo comercial de um negocio — desde a criacao de campanhas de anuncios ate o fechamento de vendas pelo WhatsApp. Este frontend e o **centro de comando** do empresario:

- Visualizar metricas de ROI, ROAS e health score em tempo real
- Acompanhar conversas dos agentes com leads
- Monitorar funil de vendas com taxas de conversao
- Gerenciar campanhas ativas e pausadas
- Gerar relatorios em PDF
- Ajustar configuracoes de tom de voz, orcamento e metas
- Chat de suporte com IA integrado

Tambem inclui um **painel admin interno** para a equipe da Athenio monitorar todas as empresas clientes e identificar riscos de churn.

---

## Stack Tecnologica

| Camada | Tecnologia | Versao |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.2.1 |
| Linguagem | TypeScript (strict) | 5.x |
| UI | React + shadcn/ui (base-nova) | 19.2.4 |
| Estilizacao | Tailwind CSS v4 (CSS-first) | 4.x |
| Animacoes | Motion (Framer Motion) | 12.x |
| Graficos | Recharts | 3.8.1 |
| PDF | @react-pdf/renderer | 4.3.2 |
| Icones | Lucide React | 1.7.0 |
| Testes | Vitest | 4.1.2 |
| Tema | next-themes (dark/light) | 0.4.6 |

---

## Arquitetura

### Estrutura de Diretorios

```
src/
├── app/
│   ├── layout.tsx                    # Layout raiz (fontes, ThemeProvider, metadata)
│   ├── globals.css                   # Tema Tailwind v4 + variaveis CSS + card styles
│   ├── page.tsx                      # "/" → redirect para /dashboard
│   ├── middleware.ts                 # Auth + role gating
│   │
│   ├── login/                        # Tela de login (split layout com branding animado)
│   │   ├── page.tsx
│   │   └── actions.ts                # Server action de autenticacao
│   │
│   ├── (authenticated)/              # Route group protegido por sessao
│   │   ├── layout.tsx                # AuthShell (sidebar + topbar + health banner)
│   │   ├── dashboard/page.tsx        # Dashboard bento grid
│   │   ├── funil/page.tsx            # Funil de vendas com filtros de periodo
│   │   ├── leads/
│   │   │   ├── page.tsx              # Tabela de leads com filtros/busca
│   │   │   └── [id]/page.tsx         # Detalhe do lead com tabs
│   │   ├── campanhas/page.tsx        # Grid de campanhas
│   │   ├── relatorios/page.tsx       # Preview + download PDF
│   │   ├── suporte/page.tsx          # Chat de suporte com IA
│   │   └── configuracoes/page.tsx    # Formulario de ajustes
│   │
│   ├── admin/                        # Painel admin (role check no middleware)
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Lista de empresas clientes
│   │   └── [empresaId]/page.tsx      # Dashboard read-only por empresa
│   │
│   └── api/
│       ├── auth/logout/route.ts      # POST — limpa sessao
│       ├── leads/[id]/route.ts       # GET — dados do lead
│       ├── campanhas/[id]/performance/route.ts  # GET — performance historica
│       └── relatorios/pdf/route.ts   # POST — gera PDF server-side
│
├── components/
│   ├── ui/                           # shadcn/ui + componentes customizados
│   │   ├── count-up.tsx              # Animacao de numeros (0 → valor)
│   │   ├── animate-in.tsx            # Fade-in-up na viewport
│   │   ├── skeleton-block.tsx        # Skeleton loader
│   │   ├── logo.tsx                  # Logo SVG (dark/light)
│   │   └── ...                       # button, card, input, select, sheet, tabs, etc.
│   │
│   ├── layout/                       # Shell da aplicacao
│   │   ├── auth-shell.tsx            # Wrapper client (sidebar + topbar + cmd palette)
│   │   ├── sidebar.tsx               # Navegacao lateral colapsavel + mobile
│   │   ├── topbar.tsx                # Breadcrumb, busca, tema, notificacoes
│   │   ├── command-palette.tsx       # ⌘K — busca de paginas e acoes
│   │   ├── health-banner.tsx         # Banner de alerta (health score < 60)
│   │   └── theme-toggle.tsx          # Toggle dark/light
│   │
│   ├── charts/                       # Wrappers Recharts customizados
│   │   ├── gauge-chart.tsx           # Gauge semicircular (Health Score)
│   │   ├── funil-chart.tsx           # Funil vertical com taxas de conversao
│   │   ├── bar-chart-horizontal.tsx  # Barras horizontais (objecoes)
│   │   └── line-chart-simple.tsx     # Linha temporal (performance campanha)
│   │
│   ├── widgets/                      # Widgets do dashboard
│   │   ├── roi-card.tsx              # ROI hero com sparkline + count-up
│   │   ├── health-score.tsx          # Gauge + indicadores de saude
│   │   ├── kpi-card.tsx              # Card generico de KPI
│   │   ├── funil-widget.tsx          # Mini funil
│   │   ├── top-objecoes.tsx          # Ranking de objecoes com barras
│   │   ├── atividade-agentes.tsx     # Status Hermes/Ares/Athena
│   │   ├── feed-alertas.tsx          # Feed cronologico de alertas
│   │   └── dashboard-greeting.tsx    # Saudacao personalizada
│   │
│   ├── leads/                        # Componentes de leads
│   │   ├── leads-table.tsx           # Tabela desktop + cards mobile
│   │   ├── lead-detail-tabs.tsx      # Tabs: Visao Geral, Conversas, Pagamentos
│   │   └── lead-detail-drawer.tsx    # Drawer lateral com resumo
│   │
│   ├── support/
│   │   └── support-chat.tsx          # Chat com IA de suporte
│   │
│   └── skeletons/
│       └── dashboard-skeleton.tsx    # Skeleton do bento grid
│
└── lib/
    ├── types/                        # Interfaces TypeScript do dominio
    │   ├── lead.ts                   # Lead, LeadFilters, FunilStats
    │   ├── campaign.ts               # Campaign, CampaignPerformance, RoiTotal
    │   ├── conversation.ts           # Conversation, Message
    │   ├── payment.ts                # PaymentLog
    │   ├── analytics.ts              # HealthScoreData, AgentesAtividade
    │   ├── alert.ts                  # Alert
    │   ├── empresa.ts                # Empresa
    │   └── support.ts                # SupportTicket, SupportMessage
    │
    ├── services/
    │   ├── interfaces/               # Contratos de servico
    │   │   ├── auth-service.ts       # IAuthService
    │   │   ├── lead-service.ts       # ILeadService
    │   │   ├── campaign-service.ts   # ICampaignService
    │   │   ├── analytics-service.ts  # IAnalyticsService
    │   │   ├── alert-service.ts      # IAlertService
    │   │   ├── empresa-service.ts    # IEmpresaService
    │   │   └── admin-service.ts      # IAdminService
    │   ├── mock/                     # Implementacoes mock para desenvolvimento
    │   │   ├── data.ts               # Dataset ficticio completo
    │   │   └── *.ts                  # Um mock por interface
    │   └── index.ts                  # Exports ativos (swap mock ↔ real aqui)
    │
    ├── constants/
    │   └── theme.ts                  # Paleta de cores, helpers de cor
    │
    ├── motion.ts                     # Constantes de animacao (duracoes, easings)
    │
    └── utils/
        ├── format.ts                 # Formatacao BR (moeda, data, telefone, %)
        └── __tests__/format.test.ts  # Testes unitarios
```

### Camada de Servicos

O acesso a dados e completamente abstraido por interfaces. Todas as paginas consomem servicos via import centralizado:

```
Componente (UI) → Service Interface → Mock Implementation (dev)
                                    → Supabase Implementation (producao)
```

```typescript
// src/lib/services/index.ts
import { MockLeadService } from './mock/lead-service'
export const leadService = new MockLeadService()

// Para trocar para Supabase, basta mudar o import:
// import { SupabaseLeadService } from './supabase/lead-service'
// export const leadService = new SupabaseLeadService()
```

Nenhum componente precisa de mudanca ao trocar de backend.

**Interfaces disponiveis:** `IAuthService`, `ILeadService`, `ICampaignService`, `IAnalyticsService`, `IAlertService`, `IEmpresaService`, `IAdminService`

### Autenticacao

- Login com email/senha via Server Action
- Sessao armazenada em cookie HTTP-only (`athenio-session`, validade 7 dias)
- Middleware valida sessao em todas as rotas protegidas
- Rotas `/admin/*` exigem `role === 'admin'`
- Logout via API route (`POST /api/auth/logout`)

### Agentes IA

| Agente | Funcao | Cor | Icone |
|--------|--------|-----|-------|
| Hermes | Marketing — cria campanhas, nutre leads, gera criativos | Teal `#4FD1C5` | Megaphone |
| Ares | Comercial — negocia, fecha vendas via WhatsApp, faz follow-ups | Gold `#E8C872` | MessageSquare |
| Athena | Orquestradora — monitora sensores, toma decisoes, dispara alertas | Violet `#A78BFA` | Shield |

---

## Paginas

### `/login`

Split layout com branding animado (orbs de gradiente, aneis orbitais, stats) na esquerda e formulario de login na direita. Mobile: formulario full-width com logo no topo.

### `/dashboard`

Bento grid de 12 colunas com 5 zonas:

1. **Hero Zone** — ROI (8 cols, gradiente, sparkline 7d, count-up) + Health Score (4 cols, gauge semicircular)
2. **KPI Strip** — 4 cards: Revenue, Conversao, LTV/CAC, Horas Salvas
3. **Analise** — Funil de Vendas (8 cols) + Top Objecoes (4 cols, barras horizontais)
4. **Agentes** — 3 cards com cores distintas: Hermes (teal), Ares (gold), Athena (violet)
5. **Alertas** — Feed cronologico com icones coloridos por tipo

### `/funil`

Funil de vendas full-width com toggle de periodo (Hoje / 7d / 30d). Cada etapa mostra volume e taxa de conversao.

### `/leads`

Tabela filtravel com busca por nome/telefone, filtros por temperatura e estagio do funil, ordenacao por colunas, paginacao. Desktop: tabela completa. Mobile: cards empilhados.

### `/leads/[id]`

Detalhe do lead com hero card (avatar com score ring, badges, KPIs) e 3 tabs:
- **Visao Geral** — KPIs, origem UTM, campanha de origem, objecoes ativas
- **Conversas** — historico de chat com agentes IA (bubbles estilo WhatsApp)
- **Pagamentos** — historico financeiro com status colorido

### `/campanhas`

Grid de cards de campanhas com status (ativa/pausada), ROAS, CPL, leads gerados. Click abre drawer com grafico de performance temporal.

### `/relatorios`

Selecao de mes/ano, preview em cards e botao "Baixar PDF". PDF gerado server-side com `@react-pdf/renderer`.

### `/suporte`

Chat com IA de suporte do Athenio. Layout two-panel: lista de chamados na esquerda, chat ativo na direita. Mobile: painel unico com navegacao back. Inclui historico de chamados, status (aberto/resolvido), indicador de digitacao, e respostas simuladas da IA.

### `/configuracoes`

Formulario em secoes (Metas, Orcamento, Comunicacao, Empresa) com mascaras de moeda e telefone. Dados persistem em localStorage.

### `/admin`

Tabela de empresas ordenada por Health Score. Clientes com score < 60 tem fundo vermelho. Click abre dashboard read-only da empresa selecionada.

### Command Palette (`⌘K`)

Modal de busca rapida por paginas e acoes. Navegacao por teclado (arrows + enter + esc). Acessivel via icone de busca na topbar ou atalho ⌘K / Ctrl+K.

---

## Design System

Design premium dark SaaS inspirado em Linear, Vercel e Stripe. Suporte a dark mode (padrao) e light mode.

### Paleta de Cores

| Token | Dark Mode | Light Mode | Uso |
|-------|-----------|------------|-----|
| `bg-base` | `#0E1012` | `#F8F6F3` | Background da pagina |
| `surface-1` | `#161A1E` | `#FFFFFF` | Cards padrao |
| `surface-2` | `#1E2228` | `#F4F4F5` | Cards elevados, dropdowns |
| `accent` | `#4FD1C5` | `#0D9488` | CTAs, links, destaque |
| `emerald` | `#34D399` | `#34D399` | Sucesso, valores confirmados |
| `gold` | `#E8C872` | `#E8C872` | Financeiro, Ares |
| `violet` | `#A78BFA` | `#A78BFA` | Dados comparativos, Athena |
| `danger` | `#F07070` | `#F07070` | Erros, alertas, objecoes |

### Tipografia

- **Titulos:** Space Grotesk (weight 400-700)
- **Body:** Sora (weight 400-600)
- Fontes carregadas via Google Fonts no root layout

### Animacoes

Sistema de animacoes com Motion (Framer Motion):
- **Count-up:** numeros KPI animam de 0 ao valor na viewport
- **Viewport entry:** widgets com fade-in-up escalonado (60ms stagger)
- **Layout:** sidebar collapse/expand, tab pill slide, sheet transitions
- **Micro-interacoes:** hover com scale, glow effects, typing indicator
- Constantes compartilhadas em `src/lib/motion.ts`

### Card Styles

Definidos em `globals.css` como classes utilitarias:
- `.card-surface` — glassmorphism com border sutil (padrao)
- `.card-elevated` — shadow mais forte
- `.card-hero` — gradiente accent para secoes destaque
- `.card-glass` — blur pesado para modais/login

### Responsividade

- **Desktop:** sidebar fixa (colapsavel 256px ↔ 64px), grids de 12 colunas
- **Tablet:** grids de 2 colunas, sidebar hidden
- **Mobile:** layout single-column, sidebar via Sheet (hamburger), cards empilhados, tabs com icones compactos
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px)
- Viewport height: usa `dvh` para compatibilidade com address bar mobile

---

## Dados Mock

Dataset ficticio de uma academia digital (TechFit) com dados coerentes:
- 10 leads com temperaturas, scores, estagios e objecoes variados
- 3 campanhas (ativa/pausada) com metricas de ROAS e CPL
- 5 conversas com 36 mensagens de chat (agente ↔ lead)
- 3 pagamentos (confirmado/pendente)
- 7 alertas de diferentes tipos (venda, baleia, anomalia, etc.)
- 3 empresas clientes para o painel admin
- 3 chamados de suporte com historico de mensagens

### Formatacao Brasil

- Moeda: `R$ 1.234,50` via `Intl.NumberFormat('pt-BR')`
- Datas: `dd/mm/aaaa` com timezone `America/Sao_Paulo`
- Timestamps relativos: "agora", "ha 5 min", "ha 2h", "ontem"
- Telefone: `+55 11 99999-9999`
- Toda a UI em portugues brasileiro

---

## Desenvolvimento

### Pre-requisitos

- Node.js 20+
- npm 10+

### Setup

```bash
git clone <repo-url>
cd olympius-frontend
npm install
npm run dev
```

O servidor inicia em `http://localhost:3000` e redireciona para `/login`.

### Login (Mock)

Qualquer email/senha funciona:
- **Usuario comum:** qualquer email (ex: `user@test.com`)
- **Admin:** email contendo "admin" ou "athenio" (ex: `admin@athenio.ai`)

### Scripts

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de producao |
| `npm run start` | Rodar build de producao |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (watch mode) |
| `npm run test:run` | Vitest (single run) |

---

## Transicao para Producao

### Conectar ao Supabase

1. Criar implementacoes reais em `src/lib/services/supabase/`
2. Implementar as interfaces de `src/lib/services/interfaces/`
3. Trocar imports em `src/lib/services/index.ts`
4. Configurar variaveis de ambiente:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Nenhuma mudanca em paginas ou componentes e necessaria.

### Deploy

Otimizado para Vercel:

```bash
npm run build
npm run start
```

---

## Decisoes Tecnicas

| Decisao | Motivacao |
|---------|-----------|
| Server Components por padrao | Dados mock sao instantaneos; Supabase futuro sera server-side fetch |
| Client Components so para interatividade | Charts (Recharts exige DOM), formularios, animacoes (Motion) |
| Route group `(authenticated)` | Aplica AuthShell sem repetir em cada pagina |
| Service Layer com interfaces | Swap de data source sem tocar UI |
| Mock auth via cookie | Simula fluxo real completo (middleware, role check) sem dependencia externa |
| CSS variables + Tailwind v4 | Tematizacao dark/light consistente, usavel em classes e JS (charts) |
| Motion para animacoes | Viewport entry, count-up e layout animations com performance |
| Sidebar colapsavel + mobile Sheet | Mais espaco para conteudo, estado persiste em localStorage |
| Command Palette (⌘K) | Navegacao rapida, padrao premium SaaS |
| `@react-pdf/renderer` server-side | Zero dependencia de browser para gerar PDF |
| Tabs customizadas (lead detail) | Base-ui tabs tinha estilos default que conflitavam com o design system |
| `100dvh` em vez de `100vh` | Melhor comportamento com address bar mobile |

---

## Rotas — Resumo

### Publicas

| Rota | Descricao |
|------|-----------|
| `/login` | Tela de login com branding animado |

### Protegidas (Cliente)

| Rota | Descricao |
|------|-----------|
| `/dashboard` | Bento grid com ROI, health score, KPIs, funil, agentes, alertas |
| `/funil` | Funil de vendas com taxas de conversao |
| `/leads` | Tabela filtravel de leads |
| `/leads/[id]` | Detalhe do lead com tabs |
| `/campanhas` | Grid de campanhas com performance |
| `/relatorios` | Relatorio PDF |
| `/suporte` | Chat com IA de suporte |
| `/configuracoes` | Ajustes de metas e configuracao |

### Protegidas (Admin)

| Rota | Descricao |
|------|-----------|
| `/admin` | Lista de empresas com health score |
| `/admin/[empresaId]` | Dashboard read-only da empresa |

### API Routes

| Rota | Metodo | Descricao |
|------|--------|-----------|
| `/api/auth/logout` | POST | Limpa cookie de sessao |
| `/api/leads/[id]` | GET | Dados do lead + conversas + pagamentos |
| `/api/campanhas/[id]/performance` | GET | Performance historica |
| `/api/relatorios/pdf` | POST | Gera e retorna PDF |
