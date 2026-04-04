# Onboarding, Produtos & Knowledge Base — Design Spec

**Data:** 2026-04-04
**Escopo:** Integrar novos endpoints do backend (onboarding, produtos, variantes, knowledge base, readiness) no frontend Olympus.

---

## Decisoes de Escopo

- **Wizard fullscreen** em `/onboarding` + paginas reutilizaveis no sidebar (`/produtos`, `/knowledge-base`)
- **Sem WebSocket** nesta iteracao — foco no onboarding
- **Checklist do cliente mostra 3 checks** (perfil, produtos, knowledge base) — checks de admin (whatsapp, orchestrator) ficam ocultos
- **Entries auto e manual sao editaveis/deletaveis** pelo cliente
- **Nao alterar** cores, fontes ou logo existentes

---

## 1. Rotas e Layout

### Novas Rotas

```
/onboarding                      → Layout fullscreen (sem sidebar/topbar)
  Step 1: Perfil da Empresa
  Step 2: Produtos & Variantes
  Step 3: Knowledge Base
  Step 4: Checklist de Prontidao

/(authenticated)/produtos        → Pagina no sidebar
/(authenticated)/knowledge-base  → Pagina no sidebar
```

### Layout do Onboarding

- Fullscreen — sem sidebar, sem topbar
- Logo Athenio no topo esquerdo
- Stepper horizontal com 4 passos (completed/current/upcoming)
- Botoes "Voltar" e "Proximo" no footer
- Background com efeito sutil usando cores do tema existente

### Fluxo de Redirecionamento (pos-login)

1. Chama `GET /api/company/readiness`
2. Se `ready: false` E `company_profile.ready === false` → redireciona para `/onboarding`
3. Se `ready: false` mas perfil ja existe → dashboard com banner de onboarding incompleto
4. Se `ready: true` → dashboard normal

### Sidebar — Novas Entradas

- **Produtos** (`/produtos`) — icone `Package`
- **Knowledge Base** (`/knowledge-base`) — icone `BookOpen`

---

## 2. Tipos

### CompanyProfile

```typescript
interface CompanyProfile {
  id: string
  tenant_id: string
  company_name: string
  description?: string
  segment?: string
  target_audience?: string
  tone?: 'formal' | 'informal' | 'neutro' | 'ousado'
  differentials?: string[]
  created_at: string
  updated_at: string
}
```

### Product & Variant

```typescript
interface Product {
  id: string
  tenant_id: string
  name: string
  description?: string
  benefits?: string[]
  objection_busters?: string[]
  is_active: boolean
  variants: Variant[]
  created_at: string
  updated_at: string
}

interface Variant {
  id: string
  product_id: string
  name: string
  price_cents: number
  billing_cycle?: 'monthly' | 'yearly' | 'one_time'
  features?: string[]
  is_active: boolean
  created_at: string
}

// Para criacao (sem IDs)
interface CreateProductPayload {
  name: string
  description?: string
  benefits?: string[]
  objection_busters?: string[]
  variants: CreateVariantPayload[]
}

interface CreateVariantPayload {
  name: string
  price_cents: number
  billing_cycle?: 'monthly' | 'yearly' | 'one_time'
  features?: string[]
}
```

### KnowledgeEntry

```typescript
interface KnowledgeEntry {
  id: string
  question: string
  answer: string
  tags: string[]
}

interface CreateKnowledgeEntryPayload {
  question: string
  answer: string
  tags?: string[]
}
```

### Readiness

```typescript
type ReadinessCheckName = 'company_profile' | 'products' | 'knowledge_base' | 'whatsapp' | 'orchestrator_config'

interface ReadinessCheck {
  name: ReadinessCheckName
  ready: boolean
  detail: string
}

interface ReadinessResult {
  ready: boolean
  checks: ReadinessCheck[]
}
```

---

## 3. Services

Todos seguem o padrao existente: interface em `services/interfaces/`, implementacao com `apiClient`, singleton exportado de `services/index.ts`.

### CompanyProfileService

| Metodo | Endpoint | Retorno |
|--------|----------|---------|
| `get()` | `GET /api/company/profile` | `CompanyProfile \| null` (404 → null) |
| `create(data)` | `POST /api/company/profile` | `CompanyProfile` |
| `update(data)` | `PUT /api/company/profile` | `CompanyProfile` |

### ProductService

| Metodo | Endpoint | Retorno |
|--------|----------|---------|
| `getAll()` | `GET /api/company/products` | `Product[]` |
| `getById(id)` | `GET /api/company/products/:id` | `Product` |
| `create(data)` | `POST /api/company/products` | `Product` |
| `update(id, data)` | `PUT /api/company/products/:id` | `Product` |
| `delete(id)` | `DELETE /api/company/products/:id` | `void` |
| `addVariant(productId, data)` | `POST /api/company/products/:id/variants` | `Variant` |
| `updateVariant(id, data)` | `PUT /api/company/variants/:id` | `Variant` |
| `deleteVariant(id)` | `DELETE /api/company/variants/:id` | `void` |

### KnowledgeService

| Metodo | Endpoint | Retorno |
|--------|----------|---------|
| `getAll()` | `GET /api/company/knowledge` | `KnowledgeEntry[]` |
| `create(data)` | `POST /api/company/knowledge` | `KnowledgeEntry` |
| `update(id, data)` | `PUT /api/company/knowledge/:id` | `KnowledgeEntry` |
| `delete(id)` | `DELETE /api/company/knowledge/:id` | `void` |

### ReadinessService

| Metodo | Endpoint | Retorno |
|--------|----------|---------|
| `check()` | `GET /api/company/readiness` | `ReadinessResult` |

---

## 4. Componentes

### Componentes Compartilhados (wizard + paginas)

**`CompanyProfileForm`**
- Campos: company_name (obrigatorio), description, segment, target_audience, tone (select: formal/informal/neutro/ousado), differentials (lista dinamica com add/remove)
- Validacao client-side: company_name 2-200 chars
- Submit via prop callback `onSubmit(data)`

**`ProductForm`**
- Secao principal: name (obrigatorio), description, benefits (lista dinamica), objection_busters (lista dinamica)
- Secao variantes: card para cada variante com name, price (input em R$ → converte para centavos), billing_cycle (select), features (lista dinamica)
- Minimo 1 variante obrigatoria. Botao "Adicionar variante" e remover por variante
- Submit via prop callback `onSubmit(data)`

**`ProductCard`**
- Nome do produto, quantidade de variantes, range de precos (menor→maior)
- Badges de billing_cycle
- Botoes editar/excluir

**`KnowledgeEntryList`**
- Lista de cards Q&A
- Badge "Auto" (cor teal) ou "Manual" (cor violet) baseado em `tags.includes('auto')`
- Botoes editar/excluir por entry
- Botao "Adicionar entrada" no topo

**`KnowledgeEntryForm`**
- Campos: question, answer (textarea), tags (input com chips)
- Usado em dialog para criar e editar

**`ReadinessChecklist`**
- 3 items (perfil, produtos, knowledge base) — filtra checks do admin
- Cada item: icone check verde ou X vermelho + nome + detalhe
- Tudo verde: mensagem "Sistema pronto!" + botao "Ir para o Dashboard"
- Algo faltando: link para o step correspondente no wizard

### Componente do Wizard

**`OnboardingStepper`**
- 4 steps com numeros + labels
- Completed = teal com check, current = teal anel, upcoming = cinza
- Linha conectora com preenchimento progressivo

### Paginas do Sidebar

**`/produtos`**
- Header: titulo "Produtos" + botao "Novo Produto"
- Grid de ProductCard (2 colunas desktop, 1 mobile)
- Criar/editar via dialog com ProductForm
- Empty state quando nao ha produtos

**`/knowledge-base`**
- Header: titulo "Knowledge Base" + botao "Nova Entrada" + total de entries
- KnowledgeEntryList como conteudo principal
- Toast "Knowledge base sendo atualizado..." quando ha entries recentes
- Empty state quando nao ha entries

### Modificacao no Dashboard

- Banner `card-hero` no topo do bento grid quando `readiness.ready === false`
- Texto: "Complete a configuracao para ativar seus agentes"
- Botao: "Continuar configuracao" → `/onboarding` no step adequado

---

## 5. Fluxo de Dados e Estados

### Wizard — Estado

- Cada step salva independentemente ao clicar "Proximo"
- Step 1: `POST /api/company/profile` (ou `PUT` se 409)
- Step 2: lista produtos + permite criar/editar/excluir. Avancar valida >= 1 produto
- Step 3: `GET /api/company/knowledge` com polling a cada 5s enquanto 0 entries. Permite CRUD completo
- Step 4: `GET /api/company/readiness` filtrando 3 checks do cliente

### Navegacao entre Steps

- Pode voltar a steps anteriores
- Nao pode pular para frente alem do step atual
- Ao retornar ao wizard, determina step atual via readiness:
  - `company_profile.ready === false` → Step 1
  - `products.ready === false` → Step 2
  - `knowledge_base.ready === false` → Step 3
  - Caso contrario → Step 4

### Loading e Feedback

- Submit: botao com spinner + "Salvando..." (desabilita double-click)
- Knowledge base geracao: skeleton cards + "A IA esta gerando o knowledge base..." + polling
- Readiness: transicao animada vermelho→verde quando check resolvido
- Toast (Sonner) para sucesso/erro
- Sem optimistic UI — aguarda resposta da API

### Erros

- Erros de API → toast com mensagem do backend
- 409 no perfil → silenciosamente faz PUT
- Validacao client-side antes de submit
- Token expirado → redirect para `/login` (comportamento existente)

---

## 6. Design Visual

### Restricoes

- **Manter** cores existentes (teal accent, dark surfaces, status colors)
- **Manter** fontes existentes (Space Grotesk + Sora)
- **Manter** logo existente
- Usar componentes UI existentes (Card, Button, Input, Badge, Dialog, etc.)
- Seguir padroes de glassmorphism e card styles ja definidos

### Wizard — Estilo

- Background: surface base (#0E1012) com efeito grid pattern sutil
- Stepper: usa accent teal para progresso
- Cards de form: `card-surface` com glassmorphism
- Transicoes entre steps: fade + slide horizontal (Motion library)

### Paginas — Estilo

- Seguem o padrao visual existente das outras paginas (leads, campanhas, etc.)
- Cards de produto e knowledge entry usam `card-surface`
- Empty states com icone + texto centralizado
- Responsivo: mobile-first como o resto da app
