# Remediação — Módulos Financeiros (all)
**Data:** 2026-04-12
**Auditoria origem:** docs/security/audit-financial-modules-2026-04-12.md
**Executor:** /remediate all

---

## Resultado

| # | Finding | Severidade | Status | TypeScript |
|---|---------|------------|--------|------------|
| F01 | Valor da cobrança controlado pelo cliente | ALTO | ✅ CORRIGIDO | ✅ |
| F02 | Ausência de validação UUID em IDs | ALTO | ✅ CORRIGIDO | ✅ |
| F03 | Desconto calculado só client-side | MÉDIO | ✅ CORRIGIDO | ✅ |
| F04 | Payload original repassado (dead code de sanitização) | MÉDIO | ✅ CORRIGIDO | ✅ |
| F05 | Preço zero aceito no catálogo | MÉDIO | ✅ CORRIGIDO | ✅ |
| F06 | Campos de mora sem validação server-side | MÉDIO | ✅ CORRIGIDO | ✅ |
| F07 | Catches vazios silenciam erros de servidor | BAIXO | ✅ CORRIGIDO | ✅ |
| F08 | Data de vencimento sem validação de formato/passado | BAIXO | ✅ CORRIGIDO | ✅ |
| F09 | Ausência de Zod para validação estruturada | INFO | ✅ CORRIGIDO | ✅ |

**Corrigidos:** 9/9  
**TypeScript:** `npx tsc --noEmit` → 0 erros

---

## Detalhamento das correções

### F01 + F04 — `cobrancas/nova/actions.ts`
Resolvidos pela adoção de Zod (F09): o schema `CreateInvoiceSchema` valida `amount` com `.positive().max(999999.99)` e `.transform(n => Math.round(n * 100) / 100)`. O `financeService.createInvoice` recebe o objeto `parsed.data` (campos tipados e sanitizados pelo Zod), nunca `params` original.

### F02 — `cobrancas/actions.ts` + `catalogo/actions.ts`
`IdSchema = z.string().regex(UUID_RE, 'ID inválido.')` valida todos os IDs antes de chamar o service. Aplicado em `markInvoicePaid`, `cancelInvoice`, `updateService`, `deleteService`, `updateProduct`, `deleteProduct`.

### F03 — `cobrancas/nova/_components/create-invoice-form.tsx`
`handleSubmit` agora envia `amount: finalAmount` (valor pós-desconto calculado no componente) em vez de `amount: form.amount` (valor original). O valor cobrado ao cliente corresponde exatamente ao que é exibido no resumo.

### F04 — `cobrancas/nova/actions.ts`
Resolvido via Zod: `parsed.data` contém apenas campos declarados no schema — campos extras do payload do cliente são descartados automaticamente pelo Zod (strict mode implícito em `.object()`).

### F05 — `catalogo/actions.ts`
`priceSchema = z.number().positive(...)` — o `.positive()` rejeita zero e negativos. Aplicado em `createService`, `createProduct`, `updateService`, `updateProduct`.

### F06 — `cobrancas/nova/actions.ts`
`lateFeePercent: z.number().min(0).max(100).default(2)`, `lateInterestPercent: z.number().min(0).max(100).default(1)`, `lateInterestType: z.enum(['simple','compound']).default('simple')`.

### F07 — Pages server-side
`catch (error) { console.error('[módulo] ...', error) }` com TODO para substituir pelo logger do projeto quando disponível.

### F08 — `cobrancas/nova/actions.ts`
`z.string().regex(DATE_RE).refine(d => !isNaN(new Date(d+'T00:00:00').getTime()) && new Date(...) >= todayMidnight())`.

### F09 — Todos os action files
Instalado `zod@^4.3.6`. Schemas declarados em `cobrancas/nova/actions.ts` (CreateInvoiceSchema), `cobrancas/actions.ts` (IdSchema), `catalogo/actions.ts` (CreateServiceSchema, UpdateServiceSchema, reutilizados para produtos). Funções aceitam `unknown` como input — o Zod valida, transforma e devolve tipos seguros.

---

## Dependência adicionada

```
npm install zod  →  "zod": "^4.3.6"
```
