# Relatorio de Auditoria de Seguranca -- Modulos Financeiros

**Data:** 2026-04-12
**Escopo:** Modulos Cobrancas e Catalogo (frontend)
**Auditor:** security-auditor (SVVA)
**Classificacao:** Confidencial

---

## Sumario Executivo

A auditoria analisou 14 arquivos dos modulos financeiros do Olympus Frontend (Cobrancas e Catalogo), cobrindo server actions, componentes client-side, camada de servico e interfaces TypeScript. A arquitetura segue um padrao consistente: pages server-side que buscam dados via `financeService`, server actions com `'use server'` para mutacoes, e componentes client para interatividade.

A camada de autenticacao esta bem estruturada: o middleware (`src/middleware.ts`) garante presenca de tokens em rotas autenticadas, o layout (`src/app/(authenticated)/layout.tsx`) verifica sessao via `authService.getSession()`, e todas as chamadas de API passam por `authFetch` que injeta Bearer token. O isolamento multi-tenant depende integralmente do backend (a API filtra por tenant_id com base no JWT). No frontend, nao ha manipulacao direta de tenant_id, o que e o padrao correto para esta arquitetura.

Foram identificados **9 findings**: 0 criticos, 2 altos, 4 medios, 2 baixos e 1 informativo. Os riscos mais relevantes sao a possibilidade de manipulacao de valor pelo cliente na criacao de cobrancas e a ausencia de validacao de formato de IDs nos modulos financeiros (ao contrario do padrao UUID do modulo CRM).

---

## Findings

### [ALTO] F01 -- Valor da cobranca controlado pelo cliente sem re-validacao server-side

- **Arquivo:** `src/app/(authenticated)/cobrancas/nova/actions.ts:41`
- **CWE:** CWE-472 (External Control of Assumed-Immutable Web Parameter)
- **OWASP:** A04:2021 -- Insecure Design

**Descricao:** A server action `createInvoice` valida que `amount > 0` mas aceita qualquer valor enviado pelo cliente, incluindo para cobrancas do tipo `service` ou `product`. Quando o usuario seleciona um servico/produto no formulario, o preco e preenchido client-side a partir dos dados recebidos, mas o valor enviado ao backend pode ser livremente manipulado. A action repassa `params` diretamente ao `financeService.createInvoice(params)` na linha 41, sem re-consultar o preco real do servico/produto referenciado.

**Evidencia:**

```typescript
// src/app/(authenticated)/cobrancas/nova/actions.ts:19-46
export async function createInvoice(
  params: CreateInvoiceParams,
): Promise<{ success: boolean; error?: string }> {
  const leadId = typeof params.leadId === 'string' ? params.leadId.trim() : ''
  const description = typeof params.description === 'string' ? params.description.trim() : ''
  const amount = typeof params.amount === 'number' ? params.amount : NaN
  // ...
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Valor deve ser maior que zero.' }
  }
  // ...
  try {
    await financeService.createInvoice(params)  // <-- repassa amount do cliente
```

**Impacto:** Um atacante autenticado pode criar cobrancas com valor R$0.01 para servicos que custam R$1.000, ou inflar o valor para fraude. O calculo de desconto (`finalAmount`) tambem depende do `amount` enviado, permitindo manipulacao completa do valor financeiro.

**Recomendacao:** Para cobrancas do tipo `service` ou `product`, o server action deve buscar o preco real do item referenciado antes de enviar ao backend:

```typescript
if (params.type === 'service' && params.referenceId) {
  // Buscar preco real server-side
  // Ou: garantir que o backend ignora o amount do payload e busca do catalogo
}
```

**Nota:** Se o backend REST ja implementa esta validacao (ignorando o `amount` do payload e buscando do catalogo), este finding e mitigado. Requer verificacao manual no backend.

---

### [ALTO] F02 -- Ausencia de validacao de formato de ID em server actions financeiras

- **Arquivo:** `src/app/(authenticated)/cobrancas/actions.ts:18-40`
- **Arquivo:** `src/app/(authenticated)/catalogo/actions.ts:77-156,210-289`
- **CWE:** CWE-20 (Improper Input Validation)
- **OWASP:** A03:2021 -- Injection

**Descricao:** As server actions `markInvoicePaid`, `cancelInvoice`, `updateService`, `deleteService`, `updateProduct`, `deleteProduct` recebem um parametro `id: string` que e passado diretamente para as chamadas de API sem validacao de formato. O modulo CRM (`src/app/(authenticated)/crm/actions.ts`) utiliza validacao UUID rigorosa com regex (`/^[0-9a-f]{8}-...$/i`), mas os modulos financeiros nao seguem este padrao.

**Evidencia:**

```typescript
// src/app/(authenticated)/cobrancas/actions.ts:18-28
export async function markInvoicePaid(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await financeService.markInvoicePaid(id)  // id sem validacao
```

```typescript
// src/app/(authenticated)/catalogo/actions.ts:146-156
export async function deleteService(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await financeService.deleteService(id)  // id sem validacao
```

Comparacao com o padrao CRM:

```typescript
// src/app/(authenticated)/crm/actions.ts:13-14,20-22
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function isValidId(id: unknown): id is string {
  return typeof id === 'string' && UUID_RE.test(id)
}
```

**Impacto:** Valores arbitrarios como path traversal (`../../admin/invoices/x`) sao interpolados na URL: `authFetch(\`/services/${id}\`)` (finance-service.ts:64). Embora o `authFetch` use `fetch()` com template literals (nao concatenacao de path), strings maliciosas podem causar comportamento inesperado no backend dependendo de como ele roteia. O risco principal e IDOR se o backend nao valida ownership.

**Recomendacao:** Adicionar validacao UUID consistente em todos os server actions:

```typescript
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function markInvoicePaid(id: string) {
  if (!UUID_RE.test(id)) return { success: false, error: 'ID invalido.' }
  // ...
}
```

---

### [MEDIO] F03 -- Desconto calculado apenas client-side

- **Arquivo:** `src/app/(authenticated)/cobrancas/nova/_components/create-invoice-form.tsx:16-23,120-144`
- **CWE:** CWE-602 (Client-Side Enforcement of Server-Side Security)
- **OWASP:** A04:2021 -- Insecure Design

**Descricao:** O calculo de desconto (PIX e Cartao) e feito inteiramente no componente client. As funcoes `calcDiscount` e `calcFinal` calculam o valor com desconto, mas o valor efetivamente enviado ao backend e `form.amount` (preco original), nao `finalAmount`. O campo `paymentMethod` e enviado, mas a logica de desconto depende do que o backend faz com ele.

**Evidencia:**

```typescript
// src/app/(authenticated)/cobrancas/nova/_components/create-invoice-form.tsx:16-23
function calcDiscount(amount: number, discountPercent: number): number {
  return Math.round(amount * discountPercent) / 100
}

function calcFinal(amount: number, discountPercent: number): number {
  return Math.max(0, amount - calcDiscount(amount, discountPercent))
}
```

```typescript
// Linha 220-231: O submit envia form.amount (original), nao finalAmount
const result = await createInvoice({
  leadId: form.leadId,
  // ...
  amount: form.amount,           // <-- valor original, nao com desconto
  paymentMethod: form.paymentMethod === 'none' ? undefined : form.paymentMethod,
```

**Impacto:** Se o backend calcula o desconto corretamente com base no `paymentMethod` e `referenceId`, isto e apenas uma questao de UX. Porem, se o backend confia no `amount` enviado, o desconto exibido ao usuario na interface (tela de resumo) pode nao corresponder ao valor real cobrado, gerando disputa com clientes.

**Recomendacao:** Confirmar que o backend recalcula `finalAmount` com base em `paymentMethod` + preco do catalogo. Documentar esta responsabilidade claramente na interface.

---

### [MEDIO] F04 -- Server action createInvoice repassa payload original, ignorando sanitizacao parcial

- **Arquivo:** `src/app/(authenticated)/cobrancas/nova/actions.ts:19-46`
- **CWE:** CWE-20 (Improper Input Validation)
- **OWASP:** A03:2021 -- Injection

**Descricao:** A action `createInvoice` sanitiza `leadId`, `description`, `amount` e `dueDate` nas linhas 22-25, mas na linha 41 envia o objeto `params` original (nao os valores sanitizados) para `financeService.createInvoice(params)`. Isso significa que `params.description` pode conter o valor nao-trimmed original, e campos extras no payload sao repassados sem filtragem.

**Evidencia:**

```typescript
// src/app/(authenticated)/cobrancas/nova/actions.ts:22-25 (sanitizacao)
const leadId = typeof params.leadId === 'string' ? params.leadId.trim() : ''
const description = typeof params.description === 'string' ? params.description.trim() : ''
const amount = typeof params.amount === 'number' ? params.amount : NaN
const dueDate = typeof params.dueDate === 'string' ? params.dueDate.trim() : ''

// Linha 41 (envio): usa params original, NAO os valores sanitizados
await financeService.createInvoice(params)  // <-- deveria ser o objeto reconstruido
```

**Impacto:** A sanitizacao e validacao existente (trim, type check, amount > 0) e efetivamente um dead code de seguranca -- os valores validados nao sao usados no envio. Campos adicionais injetados no payload (ex: `status: 'paid'`, `finalAmount: 0`) seriam repassados ao backend.

**Recomendacao:** Reconstruir o payload apenas com campos validados:

```typescript
await financeService.createInvoice({
  leadId,
  type: params.type,
  referenceId: params.referenceId,
  description,
  amount,
  paymentMethod: params.paymentMethod,
  dueDate,
  lateFeePercent: params.lateFeePercent,
  lateInterestType: params.lateInterestType,
  lateInterestPercent: params.lateInterestPercent,
})
```

---

### [MEDIO] F05 -- Preco zero aceito na criacao de servicos e produtos do catalogo

- **Arquivo:** `src/app/(authenticated)/catalogo/actions.ts:36,169`
- **CWE:** CWE-20 (Improper Input Validation)
- **OWASP:** A04:2021 -- Insecure Design

**Descricao:** As validacoes de preco em `createService` e `createProduct` aceitam `price = 0` (`price < 0` e rejeitado, mas `price == 0` passa). Um servico/produto com preco R$0,00 no catalogo pode ser usado para gerar cobrancas de valor zero.

**Evidencia:**

```typescript
// src/app/(authenticated)/catalogo/actions.ts:36
if (isNaN(price) || price < 0 || price > 999999.99) {
  return { success: false, error: 'Preco invalido.' }
}
```

Comparacao: A action `createInvoice` valida `amount <= 0` (rejeita zero), mas a de catalogo aceita `price == 0`.

**Impacto:** Servicos e produtos com preco zero no catalogo podem ser usados para gerar cobrancas, potencialmente burlando controles financeiros. Pode ser intencional (amostras gratis), mas para um sistema financeiro, merece validacao explicita ou flag separada.

**Recomendacao:** Mudar para `price <= 0` ou adicionar flag `isFree: boolean` caso amostras gratis sejam intencionais:

```typescript
if (isNaN(price) || price <= 0 || price > 999999.99) {
  return { success: false, error: 'Preco deve ser maior que zero.' }
}
```

---

### [MEDIO] F06 -- Ausencia de validacao de limites para campos de mora (lateFeePercent / lateInterestPercent)

- **Arquivo:** `src/app/(authenticated)/cobrancas/nova/actions.ts:19-46`
- **CWE:** CWE-20 (Improper Input Validation)
- **OWASP:** A04:2021 -- Insecure Design

**Descricao:** A server action `createInvoice` nao valida os campos `lateFeePercent`, `lateInterestType` e `lateInterestPercent`. Estes valores sao repassados diretamente do payload do cliente. Um atacante pode enviar `lateFeePercent: 10000` ou `lateInterestPercent: -50` ou `lateInterestType: 'xss_payload'`.

**Evidencia:**

```typescript
// src/app/(authenticated)/cobrancas/nova/actions.ts:19-46
// Os campos lateFeePercent, lateInterestType e lateInterestPercent
// NAO aparecem em nenhuma validacao server-side.
// Sao repassados via params direto ao financeService.createInvoice(params)
```

O formulario client-side limita `min="0" max="100"` para estes campos (create-invoice-form.tsx:494-499), mas esta restricao e trivialmente burlavel.

**Impacto:** Valores abusivos de multa e juros podem ser definidos, criando cobrancas com valores extorsivos (ex: 10.000% de multa). Tambem permite tipo de juros invalido, potencialmente causando erro no backend.

**Recomendacao:** Adicionar validacao server-side:

```typescript
const lateFeePercent = typeof params.lateFeePercent === 'number' ? params.lateFeePercent : 2
const lateInterestPercent = typeof params.lateInterestPercent === 'number' ? params.lateInterestPercent : 1
if (lateFeePercent < 0 || lateFeePercent > 100) {
  return { success: false, error: 'Multa deve estar entre 0% e 100%.' }
}
if (lateInterestPercent < 0 || lateInterestPercent > 100) {
  return { success: false, error: 'Juros deve estar entre 0% e 100%.' }
}
const validInterestTypes = ['simple', 'compound']
if (params.lateInterestType && !validInterestTypes.includes(params.lateInterestType)) {
  return { success: false, error: 'Tipo de juros invalido.' }
}
```

---

### [BAIXO] F07 -- Erros silenciados com catch vazio nas pages server-side

- **Arquivo:** `src/app/(authenticated)/cobrancas/page.tsx:13-15`
- **Arquivo:** `src/app/(authenticated)/cobrancas/nova/page.tsx:20-22`
- **Arquivo:** `src/app/(authenticated)/catalogo/page.tsx:47-49`
- **CWE:** CWE-390 (Detection of Error Condition Without Action)
- **OWASP:** A09:2021 -- Security Logging and Monitoring Failures

**Descricao:** As funcoes `fetchInvoices`, `fetchFormData` e o bloco try/catch do catalogo capturam excecoes com `catch { // empty }`, descartando informacoes de erro sem logging.

**Evidencia:**

```typescript
// src/app/(authenticated)/cobrancas/page.tsx:13-15
  } catch {
    // empty
  }
```

```typescript
// src/app/(authenticated)/catalogo/page.tsx:47-49
  } catch {
    // fallback to defaults
  }
```

**Impacto:** Falhas de autenticacao, erros de rede e violacoes de acesso sao silenciadas. Em ambiente de producao, nao ha como diagnosticar falhas, detectar ataques, ou saber se dados financeiros falharam ao carregar. O usuario ve uma pagina vazia sem indicacao de erro.

**Recomendacao:** Implementar logging server-side e feedback visual:

```typescript
} catch (error) {
  logger.error('Failed to fetch invoices', { error, page, status, type })
  // Opcionalmente: retornar flag de erro para o componente exibir mensagem
}
```

---

### [BAIXO] F08 -- Ausencia de validacao de data de vencimento (dueDate) no passado

- **Arquivo:** `src/app/(authenticated)/cobrancas/nova/actions.ts:37-38`
- **CWE:** CWE-20 (Improper Input Validation)
- **OWASP:** A04:2021 -- Insecure Design

**Descricao:** A validacao de `dueDate` verifica apenas se o campo nao esta vazio, mas nao valida se a data esta no formato correto (ISO/YYYY-MM-DD), se e uma data valida, ou se esta no passado.

**Evidencia:**

```typescript
// src/app/(authenticated)/cobrancas/nova/actions.ts:37-38
if (!dueDate) {
  return { success: false, error: 'Data de vencimento e obrigatoria.' }
}
```

**Impacto:** Um atacante pode enviar `dueDate: 'not-a-date'` ou `dueDate: '2020-01-01'` (data no passado), criando cobrancas com vencimento invalido ou ja vencido (que imediatamente acumula juros).

**Recomendacao:**

```typescript
const dateRegex = /^\d{4}-\d{2}-\d{2}$/
if (!dueDate || !dateRegex.test(dueDate)) {
  return { success: false, error: 'Data de vencimento invalida.' }
}
const dueDateObj = new Date(dueDate)
if (isNaN(dueDateObj.getTime())) {
  return { success: false, error: 'Data de vencimento invalida.' }
}
const today = new Date()
today.setHours(0, 0, 0, 0)
if (dueDateObj < today) {
  return { success: false, error: 'Data de vencimento nao pode ser no passado.' }
}
```

---

### [INFO] F09 -- Ausencia de Zod para validacao de input estruturada

- **Arquivo:** Todos os server actions auditados
- **CWE:** N/A
- **OWASP:** A03:2021 -- Injection

**Descricao:** O projeto nao utiliza Zod (ou equivalente) para validacao de input em server actions, apesar de ser uma convencao declarada no CLAUDE.md (`Input validado com Zod na borda`). As validacoes sao feitas manualmente com `typeof` checks e comparacoes, o que e funcional mas propenso a omissoes (como demonstrado nos findings F02, F04, F06).

**Evidencia:** Resultado vazio ao buscar `import.*zod` em todo o codebase. Zod nao esta listado em `package.json`.

**Impacto:** Nao e uma vulnerabilidade direta, mas a ausencia de validacao declarativa aumenta o risco de omissoes. Schemas Zod sao mais legveis, testveis e difceis de "esquecer um campo".

**Recomendacao:** Considerar adotar Zod para server actions, especialmente nos modulos financeiros que manipulam valores monetrios:

```typescript
import { z } from 'zod'

const CreateInvoiceSchema = z.object({
  leadId: z.string().uuid(),
  type: z.enum(['service', 'product', 'manual']),
  referenceId: z.string().uuid().optional(),
  description: z.string().min(1).max(500),
  amount: z.number().positive().max(999999.99),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  paymentMethod: z.enum(['pix', 'card']).optional(),
  lateFeePercent: z.number().min(0).max(100).default(2),
  lateInterestType: z.enum(['simple', 'compound']).default('simple'),
  lateInterestPercent: z.number().min(0).max(100).default(1),
})
```

---

## Resumo de Findings

| ID  | Severidade | Titulo                                                        | Arquivo Principal                     |
|-----|------------|---------------------------------------------------------------|---------------------------------------|
| F01 | ALTO       | Valor da cobranca controlado pelo cliente                     | cobrancas/nova/actions.ts:41          |
| F02 | ALTO       | Ausencia de validacao UUID em IDs                             | cobrancas/actions.ts, catalogo/actions.ts |
| F03 | MEDIO      | Desconto calculado apenas client-side                         | create-invoice-form.tsx:16-23         |
| F04 | MEDIO      | Server action repassa payload original ignorando sanitizacao  | cobrancas/nova/actions.ts:41          |
| F05 | MEDIO      | Preco zero aceito no catalogo                                 | catalogo/actions.ts:36,169            |
| F06 | MEDIO      | Campos de mora sem validacao server-side                      | cobrancas/nova/actions.ts             |
| F07 | BAIXO      | Erros silenciados com catch vazio                             | cobrancas/page.tsx, catalogo/page.tsx |
| F08 | BAIXO      | Data de vencimento sem validacao de formato/passado            | cobrancas/nova/actions.ts:37          |
| F09 | INFO       | Ausencia de Zod para validacao estruturada                    | Todos os actions                      |

---

## Aspectos Positivos Confirmados

1. **Autenticacao consistente:** Todas as chamadas de API passam por `authFetch` que injeta Bearer token a partir de cookie httpOnly. O middleware garante presenca de token em rotas autenticadas. Confirmado em `src/lib/services/auth-fetch.ts:38-61` e `src/middleware.ts`.

2. **Cookies seguros:** Tokens sao armazenados em cookies httpOnly com `secure: true` em producao e `sameSite: 'lax'`. Confirmado em `src/lib/services/auth-fetch.ts:20-27` e `src/lib/services/auth-service.ts:22-35`.

3. **CSRF em Server Actions:** Next.js 16 protege server actions contra CSRF nativamente (tokens automaticos). As actions usam `'use server'` corretamente.

4. **Error handling seguro:** Todas as server actions usam `safeError()` para mapear erros internos para mensagens genericas, evitando information disclosure. Confirmado em `cobrancas/actions.ts:6-16`, `catalogo/actions.ts:12-23`, `cobrancas/nova/actions.ts:7-16`.

5. **Validacao de preco em catalogo:** Server actions `createService` e `createProduct` validam tipo, range (0-999999.99) e arredondamento de centavos. Confirmado em `catalogo/actions.ts:31-56`.

6. **Validacao de desconto em catalogo:** Descontos PIX, Cartao e Especial sao validados entre 0-100% server-side. Confirmado em `catalogo/actions.ts:40-56`.

7. **Nenhum secret hardcoded:** O `.env` contem apenas `NEXT_PUBLIC_API_URL` (nao-sensivel). Nenhum token ou chave encontrado em codigo fonte.

8. **Tenant isolation delegada ao backend:** O frontend nao manipula `tenant_id` diretamente -- a API REST usa o JWT para determinar o tenant. Este e o padrao correto.

---

## Top 3 Riscos Imediatos

1. **F01 + F04 (ALTO):** A combinacao de payload original repassado sem reconstrucao (F04) com aceitacao de qualquer valor do cliente (F01) permite que um usuario autenticado manipule o valor de cobrancas livremente. Se o backend confia no `amount` enviado, e possivel criar cobrancas com valores fraudulentos.

2. **F02 (ALTO):** Ausencia de validacao UUID em 6 server actions financeiras (markInvoicePaid, cancelInvoice, updateService, deleteService, updateProduct, deleteProduct) permite envio de strings arbitrarias como IDs de recursos. O modulo CRM ja implementa esta protecao, indicando inconsistencia.

3. **F06 (MEDIO):** Campos de multa e juros sem validacao server-side permitem cobrancas com juros abusivos, potencialmente gerando problemas legais e financeiros.

---

## Recomendacoes Priorizadas

### P0 -- Correcao Imediata (esta sprint)

1. **Reconstruir payload em createInvoice (F01 + F04):** Nao repassar `params` original. Construir objeto novo com valores sanitizados.
2. **Adicionar validacao UUID em todos os IDs (F02):** Criar helper `isValidId()` compartilhado e usar em todas as actions financeiras.
3. **Validar campos de mora server-side (F06):** Adicionar limites para `lateFeePercent` (0-100), `lateInterestPercent` (0-100) e whitelist para `lateInterestType`.

### P1 -- Correcao Proxima Sprint

4. **Validar formato e range de dueDate (F08):** Regex + parse + comparacao com data atual.
5. **Decidir sobre preco zero no catalogo (F05):** Rejeitar ou documentar como intencional.
6. **Confirmar calculo de desconto no backend (F03):** Verificar se o backend recalcula `finalAmount`.

### P2 -- Melhoria Continua

7. **Implementar logging em catches vazios (F07).**
8. **Avaliar adocao de Zod para server actions (F09).**

---

## Itens Inconclusivos (Requer Revisao Manual)

1. **Multi-tenant isolation no backend:** O frontend delega tenant_id ao JWT/backend. Nao e possivel confirmar se o backend valida ownership de invoices, services e products sem acesso ao codigo do backend. Requer auditoria do backend REST.

2. **Calculo de finalAmount no backend:** Nao e possivel confirmar se o backend recalcula o valor final da cobranca com base no catalogo ou confia no `amount` do payload. Requer verificacao no endpoint `POST /invoices`.

3. **Rate limiting em server actions:** O frontend nao implementa rate limiting (esperado -- deve ser no backend/API gateway). Nao e possivel confirmar se o backend tem rate limiting nos endpoints financeiros.

4. **Audit trail de operacoes financeiras:** Nao ha logging no frontend (esperado), mas nao e possivel confirmar se o backend registra audit trail para criacao/cancelamento de cobrancas. Critico para compliance financeira.

5. **LGPD -- direito de exclusao:** O `leadId` na cobranca vincula dados financeiros a um lead. Se o lead for deletado, nao e possivel confirmar se as cobrancas sao anonimizadas. Requer verificacao no backend.

---

## Dependencias Vulneraveis (npm audit)

| Pacote           | Severidade | CVE/Advisory                                  | Impacto no Projeto |
|------------------|------------|-----------------------------------------------|-------------------|
| hono <4.12.12    | Moderada   | GHSA-26pp-8wgv-hjvm (cookie name validation)  | Dependencia transitiva via Next.js. Impacto baixo -- nao usado diretamente. |
| @hono/node-server <1.19.13 | Moderada | GHSA-92pp-h63x-v22m (path traversal serveStatic) | Dependencia transitiva. Nao afeta diretamente o frontend. |

**Recomendacao:** Manter dependencias atualizadas. Executar `npm audit fix` quando upstream disponibilizar fix.
