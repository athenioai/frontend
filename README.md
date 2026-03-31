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
| **Next.js 14+** (App Router) | Framework principal, SSR/SSG |
| **TypeScript** | Tipagem estatica em todo o projeto |
| **Tailwind CSS v4** | Estilizacao utility-first |
| **shadcn/ui** | Componentes base (Button, Card, Input, Select, Sheet, etc.) |
| **Recharts** | Graficos (gauge, barras, linhas, funil) |
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
│   ├── layout.tsx                    # Root layout (dark theme, fontes)
│   ├── page.tsx                      # Redirect → /dashboard
│   ├── login/
│   │   ├── page.tsx                  # Pagina de login (glassmorphism)
│   │   └── actions.ts                # Server action de autenticacao
│   ├── (authenticated)/              # Route group — requer sessao
│   │   ├── layout.tsx                # Sidebar + Topbar + Health Banner
│   │   ├── dashboard/page.tsx        # Dashboard com 8 widgets
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
│   ├── ui/                           # shadcn/ui (auto-gerados)
│   ├── charts/                       # Wrappers Recharts customizados
│   │   ├── gauge-chart.tsx           # Gauge semicircular (Health Score)
│   │   ├── funil-chart.tsx           # Funil vertical com taxas
│   │   ├── bar-chart-horizontal.tsx  # Barras horizontais (objecoes)
│   │   └── line-chart-simple.tsx     # Linha temporal (performance)
│   ├── widgets/                      # Widgets do dashboard
│   │   ├── roi-card.tsx              # ROI em tempo real (animado)
│   │   ├── health-score.tsx          # Gauge + indicadores
│   │   ├── funil-widget.tsx          # Mini funil
│   │   ├── ltv-cac.tsx              # LTV/CAC + bar chart
│   │   ├── top-objecoes.tsx          # Objecoes mais frequentes
│   │   ├── economia-tempo.tsx        # Horas economizadas
│   │   ├── atividade-agentes.tsx     # Status Hermes/Ares/Athena
│   │   └── feed-alertas.tsx          # Feed cronologico
│   └── layout/
│       ├── sidebar.tsx               # Navegacao lateral
│       ├── topbar.tsx                # Barra superior + mobile menu
│       └── health-banner.tsx         # Banner de alerta (score < 60)
├── lib/
│   ├── types/                        # Tipos do dominio
│   │   ├── lead.ts
│   │   ├── campaign.ts
│   │   ├── payment.ts
│   │   ├── conversation.ts
│   │   ├── alert.ts
│   │   ├── empresa.ts
│   │   ├── analytics.ts
│   │   └── index.ts                  # Barrel export
│   ├── services/
│   │   ├── interfaces/               # Contratos TypeScript
│   │   ├── mock/                     # Implementacoes com dados ficticios
│   │   │   ├── data.ts              # Dados mock realistas
│   │   │   ├── lead-service.ts
│   │   │   ├── campaign-service.ts
│   │   │   ├── analytics-service.ts
│   │   │   ├── alert-service.ts
│   │   │   ├── empresa-service.ts
│   │   │   ├── admin-service.ts
│   │   │   └── auth-service.ts
│   │   └── index.ts                  # Provider ativo (swap aqui)
│   ├── utils/
│   │   ├── format.ts                 # Formatacao BR (moeda, data, %)
│   │   └── __tests__/format.test.ts  # 10 testes unitarios
│   └── constants/
│       └── theme.ts                  # Cores, helpers de tema
├── middleware.ts                      # Auth check + role guard
└── styles/
    └── globals.css                   # Tailwind + variaveis Athenio
```

## Identidade Visual

Dark mode exclusivo, inspirado no site athenio.ai:

| Token | Cor | Uso |
|---|---|---|
| `accent` | `#4FD1C5` | CTAs, valores destaque, links, bordas ativas |
| `accent-light` | `#81E6D9` | Gradientes, hover states |
| `bg-base` | `#070C0C` | Background da pagina |
| `bg-elevated` | `rgba(15,61,62,0.2)` | Cards, surfaces |
| `danger` | `#E07070` | Erros, Health Score baixo |
| `warning` | `#F6E05E` | Health Score medio |
| `success` | `#4FD1C5` | Health Score bom, vendas |

**Tipografia:**
- **Titulos:** Space Grotesk (weight 700)
- **Body:** Sora (weight 400-600)
- **Valores destaque:** `clamp(34px, 5.5vw, 68px)`, cor accent

## Paginas

### `/login`
Login com glassmorphism, grid sutil e orbs flutuantes. Qualquer email/senha autentica (mock). Emails com "admin" ou "athenio" ganham role admin.

### `/dashboard`
8 widgets em grid responsivo:
1. **ROI em Tempo Real** — Valor animado a cada 8s, tipografia display
2. **Health Score** — Gauge semicircular 0-100 com 3 indicadores
3. **Funil de Vendas** — 4 etapas com taxas de conversao
4. **LTV / CAC** — Valores + bar chart individual
5. **Top Objecoes** — Barras horizontais ordenadas
6. **Economia de Tempo** — Horas economizadas no mes
7. **Atividade dos Agentes** — Cards Hermes, Ares, Athena
8. **Feed de Alertas** — Timeline cronologica scrollavel

### `/funil`
Funil full-width com filtro de periodo (Hoje / 7d / 30d). Cada etapa e expandivel para mostrar os leads naquele estagio.

### `/leads`
Tabela completa com:
- Busca por nome/telefone
- Filtros por temperatura e estagio
- Ordenacao clicavel nos headers
- Paginacao (10/25/50 por pagina)
- Mobile: vira cards empilhados

### `/campanhas`
Grid de cards (ativas no topo, pausadas com opacidade reduzida). Click abre drawer lateral com grafico de performance temporal.

### `/relatorios`
Selecao de mes/ano, preview em cards e botao "Baixar PDF". O PDF e gerado server-side com `@react-pdf/renderer` com layout dark e cores da marca.

### `/configuracoes`
Formulario em secoes (Metas, Orcamento, Comunicacao, Empresa). Persiste em localStorage (tipado para Supabase futuro).

### `/admin`
Tabela de empresas ordenada por Health Score (piores primeiro). Clientes com score < 60 ganham fundo vermelho. Click abre dashboard completo read-only da empresa.

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
| **Client Components so para interatividade** | Charts (Recharts exige DOM), formularios, animacoes |
| **Route group `(authenticated)`** | Aplica sidebar/topbar/health banner sem repetir em cada pagina |
| **Service Layer com interfaces** | Swap de data source sem tocar UI — crucial para migracao futura |
| **Mock auth via cookie** | Simula fluxo real completo (middleware, role check) sem dependencia externa |
| **CSS custom properties + Tailwind** | Permite tematizacao consistente e uso tanto em classes quanto em JS (charts) |
| **`@react-pdf/renderer` server-side** | Zero dependencia de browser para gerar PDF — funciona em serverless |
| **Dark mode exclusivo** | Alinhado com identidade visual da Athenio, sem necessidade de toggle |
