# Athenio.ai — Dashboard

Painel de controle em tempo real para clientes da **Athenio.ai** acompanharem o desempenho dos agentes de IA que gerenciam suas operacoes de marketing e vendas.

## Sobre o Projeto

A Athenio.ai opera com tres agentes autonomos de IA:

- **Hermes** (Marketing) — Cria e gerencia campanhas de anuncios, gera criativos, nutre leads.
- **Ares** (Comercial) — Conduz conversas de vendas via WhatsApp, faz follow-ups, fecha negocios.
- **Athena** (Orquestrador) — Monitora todos os sensores, toma decisoes estrategicas (pausar campanhas, escalar orcamento, disparar alertas).

Este dashboard permite que o cliente visualize tudo o que os agentes estao fazendo, o retorno sobre investimento e a saude da operacao — sem precisar entender a complexidade por tras.

Tambem inclui um **painel admin interno** para a equipe da Athenio monitorar todas as empresas clientes e identificar riscos de churn.

## Stack Tecnologica

| Tecnologia | Uso |
|---|---|
| **Next.js 16** (App Router) | Framework principal, SSR/SSG |
| **React 19** | UI library |
| **TypeScript** | Tipagem estatica em todo o projeto |
| **Tailwind CSS v4** | Estilizacao utility-first |
| **shadcn/ui** | Componentes base (Button, Card, Input, Select, Sheet, etc.) |
| **Motion (Framer Motion v11+)** | Animacoes — sidebar collapse, viewport entry, count-up |
| **Recharts** | Graficos (gauge, barras, linhas, funil, sparklines) |
| **next-themes** | Toggle dark/light mode com persistencia |
| **@react-pdf/renderer** | Geracao de PDF server-side |
| **Lucide React** | Icones |
| **Vitest** | Testes unitarios |

## Arquitetura

### Service Layer Pattern

O projeto usa um padrao de Service Layer que separa completamente o acesso a dados da UI:

```
Componente (UI) → Service Interface → Mock Implementation
                                    → Supabase Implementation (futuro)
```

Para trocar de mock para Supabase, basta alterar os imports em `src/lib/services/index.ts`. Nenhum componente precisa mudar.

### Estrutura de Pastas

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (ThemeProvider, fontes)
│   ├── page.tsx                      # Redirect → /dashboard
│   ├── login/
│   │   ├── page.tsx                  # Pagina de login
│   │   └── actions.ts                # Server action de autenticacao
│   ├── (authenticated)/              # Route group — requer sessao
│   │   ├── layout.tsx                # AuthShell + Health Banner
│   │   ├── dashboard/page.tsx        # Dashboard bento grid
│   │   ├── funil/page.tsx            # Funil de vendas expandivel
│   │   ├── leads/                    # Tabela de leads com filtros
│   │   ├── campanhas/                # Grid de campanhas + drawer
│   │   ├── relatorios/page.tsx       # Preview + download PDF
│   │   └── configuracoes/page.tsx    # Formulario de config
│   ├── admin/                        # Painel admin (role check)
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Lista de empresas
│   │   └── [empresaId]/page.tsx      # Dashboard read-only por empresa
│   └── api/
│       ├── auth/logout/route.ts
│       ├── campanhas/[id]/performance/route.ts
│       └── relatorios/pdf/route.ts
├── components/
│   ├── ui/                           # shadcn/ui + componentes customizados
│   │   ├── count-up.tsx              # Animacao de numeros (0 → valor)
│   │   ├── animate-in.tsx            # Fade-in-up na viewport
│   │   └── skeleton-block.tsx        # Bloco de skeleton loader
│   ├── charts/                       # Wrappers Recharts customizados
│   │   ├── gauge-chart.tsx           # Gauge semicircular (Health Score)
│   │   ├── funil-chart.tsx           # Funil vertical com taxas
│   │   ├── bar-chart-horizontal.tsx  # Barras horizontais (objecoes)
│   │   └── line-chart-simple.tsx     # Linha temporal (performance)
│   ├── widgets/                      # Widgets do dashboard
│   │   ├── roi-card.tsx              # ROI hero com sparkline + count-up
│   │   ├── health-score.tsx          # Gauge + indicadores
│   │   ├── kpi-card.tsx              # Card generico de KPI
│   │   ├── funil-widget.tsx          # Mini funil
│   │   ├── top-objecoes.tsx          # Objecoes mais frequentes
│   │   ├── atividade-agentes.tsx     # Status Hermes/Ares/Athena
│   │   └── feed-alertas.tsx          # Feed cronologico colorido
│   ├── skeletons/
│   │   └── dashboard-skeleton.tsx    # Skeleton do bento grid
│   └── layout/
│       ├── auth-shell.tsx            # Shell client — sidebar + topbar + cmd palette
│       ├── sidebar.tsx               # Navegacao lateral colapsavel
│       ├── topbar.tsx                # Breadcrumb, busca, tema, notificacoes
│       ├── theme-toggle.tsx          # Toggle dark/light
│       ├── command-palette.tsx       # ⌘K — busca de paginas e acoes
│       └── health-banner.tsx         # Banner de alerta (score < 60)
├── lib/
│   ├── motion.ts                     # Constantes de animacao compartilhadas
│   ├── types/                        # Tipos do dominio
│   ├── services/
│   │   ├── interfaces/               # Contratos TypeScript
│   │   ├── mock/                     # Implementacoes com dados ficticios
│   │   └── index.ts                  # Provider ativo (swap aqui)
│   ├── utils/
│   │   ├── format.ts                 # Formatacao BR (moeda, data, %)
│   │   └── __tests__/format.test.ts  # 10 testes unitarios
│   └── constants/
│       └── theme.ts                  # Cores, helpers de tema
├── middleware.ts                      # Auth check + role guard
└── styles/
    └── globals.css                   # Tailwind + design tokens + card classes
```

## Design System

Design premium SaaS moderno inspirado em Linear, Vercel e Stripe. Suporte a dark mode (padrao) e light mode.

### Paleta de Cores

**Dark mode (padrao):**

| Token | Cor | Uso |
|---|---|---|
| `bg-base` | `#090F0F` | Background da pagina |
| `surface-1` | `#111919` | Cards padrao |
| `surface-2` | `#162020` | Cards elevados, dropdowns |
| `accent` | `#4FD1C5` | CTAs, valores destaque, links |
| `amber` | `#FBBF24` | Destaques financeiros (ROI, revenue) |
| `violet` | `#A78BFA` | Dados comparativos, accent terciario |
| `danger` | `#E07070` | Erros, Health Score baixo |

**Light mode:** backgrounds claros (`#FAFBFC`, `#FFFFFF`, `#F4F7F7`), teal primary escurece para `#0D9488` (contraste WCAG AA), cards usam shadow em vez de border.

### Tipografia

- **Titulos:** Space Grotesk (weight 400-700)
- **Body:** Sora (weight 400-600)
- **Hero numbers:** `clamp(36px, 5vw, 56px)`, weight 700
- **Section titles:** 14px, weight 600, uppercase, letter-spacing 0.05em

### Animacoes

Sistema de animacoes com Motion (Framer Motion):
- **Hover:** cards com `translateY(-2px)`, botoes com `scale(1.02)` — 150ms
- **Count-up:** numeros KPI animam de 0 ao valor na viewport — 400ms
- **Viewport entry:** widgets com fade-in-up escalonado (60ms stagger) — 400ms
- **Layout:** sidebar collapse/expand com transicao suave — 250ms
- **Respeita `prefers-reduced-motion`**

## Paginas

### `/login`
Card clean com grid sutil e orbs de gradiente (teal + violet). Qualquer email/senha autentica (mock). Emails com "admin" ou "athenio" ganham role admin.

### `/dashboard`
Bento grid de 12 colunas com 5 zonas:

1. **Hero Zone** — ROI (8 cols, gradiente, sparkline 7 dias, count-up) + Health Score (4 cols, gauge)
2. **KPI Strip** — 4 cards: Revenue (amber), Conversao (teal), LTV/CAC (violet), Horas Salvas (teal)
3. **Analise** — Funil de Vendas (8 cols) + Top Objecoes (4 cols)
4. **Agentes** — 3 cards com cores distintas: Hermes (teal), Ares (amber), Athena (violet)
5. **Alertas** — Feed cronologico com icones coloridos por tipo

### `/funil`
Funil full-width com toggle de periodo (Hoje / 7d / 30d). Cada etapa e expandivel para mostrar os leads naquele estagio.

### `/leads`
Tabela completa com busca, filtros por temperatura/estagio, ordenacao, paginacao. Mobile: cards empilhados.

### `/campanhas`
Grid de cards com hover interativo. Click abre drawer lateral com grafico de performance temporal.

### `/relatorios`
Selecao de mes/ano, preview em card elevado e botao "Baixar PDF". PDF gerado server-side com `@react-pdf/renderer`.

### `/configuracoes`
Formulario em secoes (Metas, Orcamento, Comunicacao, Empresa). Persiste em localStorage.

### `/admin`
Tabela de empresas ordenada por Health Score. Clientes com score < 60 ganham fundo vermelho. Click abre dashboard read-only da empresa.

### Command Palette (`⌘K`)
Modal de busca rapida por paginas e acoes. Navegacao por teclado (arrows + enter + esc).

## Autenticacao

**Mock auth** com cookie `athenio-session`:
- Qualquer email/senha autentica
- Emails com "admin" ou "athenio" recebem `role: 'admin'`
- Middleware protege rotas autenticadas e valida role para `/admin`
- Tipado para swap para Supabase Auth

## Dados Mock

10 leads, 3 campanhas, 3 pagamentos, 5 conversas, 7 alertas e 3 empresas. Dados realistas de uma academia digital (TechFit) com metricas coerentes entre si.

## Formatacao Brasil

- Moeda: `R$ 1.234,50` via `Intl.NumberFormat('pt-BR')`
- Datas: `dd/mm/aaaa` com timezone `America/Sao_Paulo`
- Timestamps relativos: "agora", "ha 5 min", "ha 2h", "ontem"
- Toda a UI em portugues brasileiro

## Preparado para Producao

### Swap para Supabase

1. Criar implementacoes em `src/lib/services/supabase/`
2. Alterar imports em `src/lib/services/index.ts`
3. Nenhum componente precisa mudar

### Deploy

O projeto e otimizado para Vercel:

```bash
npm run build    # Build de producao
npm run start    # Servidor de producao local
```

## Como Rodar

### Pre-requisitos

- Node.js 18+
- npm

### Instalacao

```bash
git clone <repo-url>
cd frontend
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Voce sera redirecionado para `/login`.

**Login cliente:** qualquer email (ex: `eu@email.com`) + qualquer senha
**Login admin:** email com "admin" (ex: `admin@athenio.ai`) + qualquer senha

### Testes

```bash
npm test          # Watch mode
npm run test:run  # Roda uma vez
```

### Build

```bash
npm run build
```

## Decisoes Tecnicas

| Decisao | Motivacao |
|---|---|
| **Server Components por padrao** | Dados mock sao instantaneos; quando trocar para Supabase, fetch ja sera server-side |
| **Client Components so para interatividade** | Charts (Recharts exige DOM), formularios, animacoes (Motion) |
| **Route group `(authenticated)`** | Aplica AuthShell (sidebar/topbar/command palette) sem repetir em cada pagina |
| **Service Layer com interfaces** | Swap de data source sem tocar UI — crucial para migracao futura |
| **Mock auth via cookie** | Simula fluxo real completo (middleware, role check) sem dependencia externa |
| **CSS custom properties + Tailwind** | Permite tematizacao dark/light consistente e uso tanto em classes quanto em JS (charts) |
| **Motion para animacoes** | Viewport entry, count-up e layout animations suaves com performance |
| **next-themes para tema** | Persistencia automatica, SSR-safe, toggle sem flash |
| **Bento grid 12 colunas** | Hierarquia visual clara — ROI como hero, KPIs como strip, secoes tematicas |
| **Sidebar colapsavel** | Mais espaco para conteudo, estado persiste em localStorage |
| **Command Palette** | Navegacao rapida por teclado, padrao premium SaaS |
| **`@react-pdf/renderer` server-side** | Zero dependencia de browser para gerar PDF — funciona em serverless |
