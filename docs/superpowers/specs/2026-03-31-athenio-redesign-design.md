# Athenio.ai Frontend Redesign — Design Spec

**Data:** 2026-03-31
**Direção:** Premium SaaS moderno (referências: Linear, Vercel, Stripe)
**Abordagem:** Redesign de Layout (#2) — nova pele + reestruturar grids + command palette + skeleton loaders

---

## 1. Paleta de Cores e Tokens

### Dark Mode (padrão)

| Token | Valor | Uso |
|-------|-------|-----|
| `bg-base` | `#090F0F` | Background da página |
| `surface-1` | `#111919` | Cards padrão |
| `surface-2` | `#162020` | Cards elevados, dropdowns |
| `surface-3` | gradiente `#132626 → #111919` | Hero cards (ROI) |
| `border-default` | `rgba(79, 209, 197, 0.08)` | Borders sutis |
| `border-hover` | `rgba(79, 209, 197, 0.20)` | Borders em hover |
| `text-primary` | `#FFFFFF` | Texto principal |
| `text-muted` | `rgba(255,255,255,0.6)` | Texto secundário |
| `text-subtle` | `rgba(255,255,255,0.4)` | Labels, captions |

### Cores de Marca

| Token | Valor | Uso |
|-------|-------|-----|
| `teal-400` (primary dark) | `#4FD1C5` | Accent principal em dark mode |
| `teal-300` | `#81E6D9` | Hover states em dark |
| `teal-600` (primary light) | `#0D9488` | Accent principal em light mode |
| `amber-400` | `#FBBF24` | Warnings, destaques financeiros (ROI, revenue) |
| `violet-400` | `#A78BFA` | Dados comparativos, accent terciário |
| `danger` | `#E07070` | Erros, alertas críticos |
| `success` | `#4FD1C5` | Estados positivos |

### Light Mode

| Token | Valor |
|-------|-------|
| `bg-base` | `#FAFBFC` |
| `surface-1` | `#FFFFFF` |
| `surface-2` | `#F4F7F7` |
| `text-primary` | `#111827` |
| `text-muted` | `#6B7280` |
| `text-subtle` | `#9CA3AF` |

Light mode usa `box-shadow: 0 1px 3px rgba(0,0,0,0.06)` em cards em vez de borders.

### Tipografia

- **Fontes:** Space Grotesk (títulos) + Sora (body) — sem mudança
- **Hero numbers:** `clamp(36px, 5vw, 56px)`, weight 700
- **Section titles:** `14px`, weight 600, uppercase, `letter-spacing: 0.05em`
- **Body:** `14px`, weight 400
- **Caption/labels:** `12px`, weight 500, `text-muted`

---

## 2. Layout Shell

### Sidebar Colapsável

- **Expandido:** `w-64`, logo "Athenio.ai" + labels dos itens
- **Colapsado:** `w-16`, só ícones + tooltip no hover
- **Toggle:** botão chevron no bottom da sidebar
- **Transição:** `width 200ms ease` via Framer Motion `layout`
- **Persist:** estado salvo em `localStorage`
- **Seções:**
  - Principal: Dashboard, Funil, Leads, Campanhas
  - Relatórios: Relatórios, Configurações
  - Separador visual sutil entre grupos
- **Item ativo:** background `teal-500/10`, barra esquerda `2px` teal, texto teal
- **Item hover:** background `white/5` (dark) ou `gray-100` (light)
- **Footer:** avatar (iniciais em círculo teal) + nome (some quando colapsado)
- **Admin:** seção separada com badge "Admin"

### Topbar

- Altura: `h-14`
- **Esquerda:** breadcrumb contextual
- **Direita:** search trigger (`⌘K` badge) → theme toggle (Sun/Moon) → notificações (bell + badge counter — usa contagem de `alertService.getRecentes()`) → user dropdown (nome + role + logout)
- Background: `surface-1` + `backdrop-blur-xl` + border bottom sutil
- Sticky

### Mobile (< lg)

- Sidebar vira sheet/drawer com novo visual
- Topbar: hamburger esquerda, logo centro, avatar direita
- Command palette via ícone de busca

---

## 3. Dashboard — Bento Grid

Grid de 12 colunas em desktop, 1 coluna em mobile.

```
Row 1:  [  ROI Hero — span 8  ] [ Health Score — span 4 ]
Row 2:  [ Revenue — 3 ] [ Conversão — 3 ] [ LTV/CAC — 3 ] [ Economia — 3 ]
Row 3:  [  Funil — span 8  ] [ Top Objeções — span 4 ]
Row 4:  [ Hermes — 4 ] [ Ares — 4 ] [ Athena — 4 ]
Row 5:  [  Feed de Alertas — span 12  ]
```

### Row 1 — Hero Zone

**ROI Card (span 8):**
- Background: gradiente sutil `teal-950 → surface-1`
- ROAS: hero number `clamp(36px,5vw,56px)`, count-up animation
- Valor monetário em `amber-400`
- Sparkline no canto: tendência últimos 7 dias (mock service precisa ser estendido com `historico_7d: number[]` no tipo `RoiTotal`)
- Texto explicativo abaixo do número

**Health Score (span 4):**
- Gauge chart mantido, card `surface-2`
- Score com count-up
- Indicadores com mini badges coloridos (verde/amarelo/vermelho)

### Row 2 — KPI Strip

4 mini cards idênticos, cada com:
- Ícone + label em cima
- Número grande embaixo
- Badge de variação (+12% verde, -3% vermelho)
- Hover: `translateY(-2px)` + border clareia

| Card | Ícone | Cor |
|------|-------|-----|
| Revenue | DollarSign | amber | (usa `roi.retorno` do serviço existente)
| Conversão | TrendingUp | teal |
| LTV/CAC | BarChart | violet |
| Economia | Clock | teal |

### Row 3 — Análise

**Funil (span 8):**
- Barras horizontais com gradiente teal
- Labels à esquerda
- Animação: barras crescem da esquerda ao entrar na viewport

**Top Objeções (span 4):**
- Lista rankada com barras de progresso horizontais
- Hover destaca objeção

### Row 4 — Agentes

3 cards iguais, border-left colorida por agente:
- Hermes: teal — Marketing
- Ares: amber — Comercial
- Athena: violet — Orquestrador

Cada card:
- Header: avatar ícone + nome + badge status (pulsing dot verde)
- Body: 4 métricas `label: value` com separadores
- Footer: "Última ação: há Xmin" em text-muted

### Row 5 — Alertas

- Full width, max-height com scroll
- Cada alerta: ícone circular colorido + descrição + timestamp
- Alertas novos (< 5min): animação slide-in
- Hover: background highlight

### Skeleton Loaders

- Cada widget tem skeleton que replica seu layout real
- Pulse: gradiente `surface-1 → surface-2 → surface-1`
- Crossfade suave skeleton → conteúdo

---

## 4. Páginas Secundárias

### Funil

- Header: título + toggle group de período (7d, 30d, 90d)
- Funil vertical com stages como cards expansíveis
- Barras com gradiente teal, % conversão como badges entre stages
- Stage expandido: lista de leads com mini cards
- Barras entram escalonadas

### Leads

- Header: título + botão "Novo Lead" (outline teal) + busca inline
- Filtros: row de filter chips clicáveis (status, canal, data)
- Tabela:
  - Hover highlight sutil
  - Avatar com iniciais coloridas
  - Status: badges coloridos (verde/amber/gray)
  - Sort indicators nos headers
  - Paginação estilizada
- Mobile: cards empilhados

### Campanhas

- Grid 2 colunas (1 mobile)
- Cards: nome + status badge + sparkline + métricas (CPA, ROAS, leads)
- Drawer redesenhado com tabs (Visão Geral, Métricas, Timeline)
- Drawer: slide + fade overlay

### Relatórios

- Preview limpo com fundo `surface-2` simulando folha
- Botão PDF estilizado com loading state

### Configurações

- Sections separadas por cards
- Inputs consistentes com labels acima
- Botão salvar fixo no bottom com toast de sucesso

### Admin

- Tabela consistente com Leads
- Drill-down por empresa com métricas
- Badge "Admin" visível na sidebar

### Padrões Compartilhados

- Toda página: header com título + breadcrumb + ações à direita
- Espaçamento: `py-8 px-6` no `main`
- Empty states: ícone grande + texto + CTA
- Loading: skeleton loaders por página
- Page transition: fade `opacity 0→1, 150ms`

---

## 5. Sistema de Animações

### Dependência

- Adicionar `motion` (Framer Motion v11+)
- CSS puro onde possível, Motion só para layout e orquestração

### Motion Tokens

| Token | Valor | Uso |
|-------|-------|-----|
| `duration-fast` | `150ms` | Hovers, toggles |
| `duration-normal` | `250ms` | Transições de estado, sidebar |
| `duration-slow` | `400ms` | Entrada de widgets, page transitions |
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entradas |
| `ease-in-out` | `cubic-bezier(0.45, 0, 0.55, 1)` | Transições |

### Categorias

1. **Hover/Focus (CSS):** cards `translateY(-2px)`, botões `scale(1.02)`, sidebar links bg fade — `duration-fast`
2. **Count-up (Motion):** KPIs animam 0 → valor na viewport — `duration-slow`
3. **Viewport Entry (Motion):** `opacity 0→1` + `translateY(12px→0)`, stagger 60ms, trigger uma vez — `duration-slow`
4. **Charts (Recharts + CSS):** barras crescem, linhas draw-in, gauge anima — `duration-slow`
5. **Layout (Motion `layout`):** sidebar collapse, drawer, filter chips reflow — `duration-normal`
6. **Skeleton (CSS):** pulse gradiente horizontal
7. **Page Transitions:** fade `opacity 0→1` — `duration-fast`

### Regras

- `prefers-reduced-motion: reduce` → desabilita tudo exceto opacity
- Nenhuma animação bloqueia interação
- Skeleton → conteúdo: crossfade suave

---

## 6. Theme System

- CSS custom properties como source of truth
- `next-themes` para toggle e persistência
- Classe `.dark` no `<html>`
- Toggle: Sun/Moon no topbar
- Transição: `transition-colors duration-normal` no `<html>`
- Light mode: cards com shadow em vez de border
- Teal primary: `teal-400` (dark) → `teal-600` (light) para contraste WCAG AA

---

## 7. Command Palette (⌘K)

- Overlay: `black/50` + `backdrop-blur-sm`
- Modal: `surface-1`, `max-w-xl`, `rounded-xl`, shadow grande
- Input: sem borda, `text-lg`, placeholder "Buscar páginas, ações..."
- Resultados agrupados:
  - **Navegação:** Dashboard, Funil, Leads, Campanhas, Relatórios, Configurações
  - **Ações:** Exportar relatório PDF, Abrir configurações
  - Admin items só para admin
- Cada resultado: ícone + label + hint (atalho)
- Navegação: arrows + enter + esc
- Busca: `includes` lowercase (sem lib externa)
- Animação: `scale 0.98→1` + `opacity 0→1`, `duration-fast`
- A11y: `role="dialog"`, `aria-modal`, focus trap

---

## 8. Acessibilidade

- Focus rings: `ring-2 ring-teal-500/50` em todos interativos
- Contraste WCAG AA em ambos os temas
- Command palette com focus trap e roles ARIA
- `prefers-reduced-motion` respeitado
- Semântica HTML correta (nav, main, aside, header)
