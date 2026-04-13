# Relatorio de Auditoria -- Image Upload + Agent Config

**Data:** 2026-04-12
**Escopo:** Upload de imagem (services/products), instrucoes do agente (por item), configuracao do agente (global)
**Auditor:** Security Auditor Agent (SVVA)

## Sumario Executivo

- Total de findings: 7
- Criticos: 0 | Altos: 1 | Medios: 3 | Baixos: 2 | Info: 1

## Top 3 Riscos Imediatos

1. **[ALTO]** Validacao de tipo de imagem baseada apenas em `file.type` (spoofable) -- sem magic bytes
2. **[MEDIO]** Campo `description` sem `maxLength` no schema Zod server-side
3. **[MEDIO]** Object URL (blob:) nao revogado no unmount do componente -- memory leak

---

## Findings Detalhados

---

### [ALTO] F01 -- Validacao de tipo MIME baseada apenas em file.type (sem magic bytes)

- **Arquivo:** `src/app/(authenticated)/catalogo/actions.ts:80-82`
- **CWE:** CWE-434 (Unrestricted Upload of File with Dangerous Type)
- **Categoria OWASP:** A04 - Insecure Design

**Evidencia:**

```typescript
// actions.ts linhas 75-90
function extractImage(formData: FormData): { image?: File; error?: string } {
  const file = formData.get('image')
  if (!file || !(file instanceof File) || file.size === 0) {
    return {}
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {                // <-- file.type e' spoofable
    return { error: 'Formato de imagem invalido. Use JPEG, PNG ou WebP.' }
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { error: 'Imagem muito grande. Maximo 5MB.' }
  }

  return { image: file }
}
```

**Impacto:**
A propriedade `file.type` e' derivada do header `Content-Type` da parte multipart, que e' controlada pelo cliente. Um atacante pode enviar um arquivo `.html`, `.svg` (com JS embutido), ou qualquer binario arbitrario com `Content-Type: image/jpeg`. Se o backend armazena e serve este arquivo sem revalidacao propria, isso pode levar a stored XSS (via SVG com `<script>`) ou servir conteudo malicioso a partir do dominio da aplicacao.

**Nota:** O frontend envia o arquivo via `authFetch` para o backend. A responsabilidade final de validacao de magic bytes recai sobre o backend. Porem, defense-in-depth no frontend e' recomendado.

**Remediacao:**

```typescript
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
}

async function validateMagicBytes(file: File): Promise<boolean> {
  const buffer = await file.slice(0, 12).arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const signatures = MAGIC_BYTES[file.type]
  if (!signatures) return false
  return signatures.some((sig) =>
    sig.every((byte, i) => bytes[i] === byte)
  )
}

async function extractImage(formData: FormData): Promise<{ image?: File; error?: string }> {
  const file = formData.get('image')
  if (!file || !(file instanceof File) || file.size === 0) return {}

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: 'Formato de imagem invalido. Use JPEG, PNG ou WebP.' }
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { error: 'Imagem muito grande. Maximo 5MB.' }
  }
  if (!(await validateMagicBytes(file))) {
    return { error: 'Arquivo nao corresponde ao tipo de imagem declarado.' }
  }
  return { image: file }
}
```

**Referencia:** https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html

---

### [MEDIO] F02 -- Campo `description` sem maxLength no schema Zod server-side

- **Arquivo:** `src/app/(authenticated)/catalogo/actions.ts:27` e `actions.ts:40`
- **CWE:** CWE-770 (Allocation of Resources Without Limits or Throttling)
- **Categoria OWASP:** A04 - Insecure Design

**Evidencia:**

```typescript
// actions.ts linha 27
const CreateServiceSchema = z.object({
  // ...
  description: z.string().optional(),   // <-- sem .max()
  // ...
})

// actions.ts linha 40
const UpdateServiceSchema = z.object({
  // ...
  description: z.string().optional(),   // <-- sem .max()
  // ...
})
```

O client-side tem `maxLength={500}` no textarea (services-table.tsx:570, products-table.tsx:570), mas isso e' bypassavel. Um atacante pode enviar uma descricao de tamanho arbitrario diretamente para o server action.

**Impacto:**
Um atacante autenticado pode enviar descricoes com megabytes de texto, potencialmente causando uso excessivo de memoria no servidor, payload grande armazenado no banco, e degradacao de performance ao renderizar listas.

**Remediacao:**

```typescript
description: z.string().max(500, 'Descricao max. 500 caracteres.').optional(),
```

**Referencia:** https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html

---

### [MEDIO] F03 -- Object URL (blob:) nao revogado no unmount do componente

- **Arquivo:** `src/app/(authenticated)/catalogo/_components/services-table.tsx:112,116-121`
- **Arquivo:** `src/app/(authenticated)/catalogo/_components/products-table.tsx:112,116-121`
- **CWE:** CWE-401 (Missing Release of Memory after Effective Lifetime)
- **Categoria OWASP:** A04 - Insecure Design

**Evidencia:**

```typescript
// services-table.tsx linha 112
setFormImagePreview(URL.createObjectURL(file))

// services-table.tsx linhas 116-121
function clearImage() {
  setFormImage(null)
  if (formImagePreview && !formImagePreview.startsWith('http')) {
    URL.revokeObjectURL(formImagePreview)
  }
  setFormImagePreview(null)
  if (fileInputRef.current) fileInputRef.current.value = ''
}
```

A funcao `clearImage()` revoga o Object URL corretamente quando o usuario clica para remover a imagem. Porem, nao existe um `useEffect` com cleanup function que revogue o URL quando o componente desmonta ou quando `formImagePreview` muda sem chamar `clearImage` (ex: usuario seleciona imagem A, depois seleciona imagem B sem clicar "remover" -- a URL de A nunca e' revogada).

Confirmado: busquei por `useEffect` nos dois arquivos e nao ha nenhum cleanup de Object URL no unmount.

**Impacto:**
Memory leak no browser. Cada Object URL nao-revogado mantem uma referencia ao blob em memoria. Em uso normal, o impacto e' baixo. Em uso intenso (muitas imagens selecionadas/trocadas sem fechar modal), pode degradar performance do browser.

**Remediacao:**

```typescript
// Adicionar no componente:
useEffect(() => {
  return () => {
    if (formImagePreview && !formImagePreview.startsWith('http')) {
      URL.revokeObjectURL(formImagePreview)
    }
  }
}, [formImagePreview])

// E na funcao handleImageSelect, revogar a URL anterior antes de criar nova:
function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0]
  if (!file) return
  // ...validacoes...

  // Revogar URL anterior se existir
  if (formImagePreview && !formImagePreview.startsWith('http')) {
    URL.revokeObjectURL(formImagePreview)
  }

  setFormImage(file)
  setFormImagePreview(URL.createObjectURL(file))
  setFormError(null)
}
```

**Referencia:** https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL_static

---

### [MEDIO] F04 -- File name nao sanitizado antes do envio ao backend

- **Arquivo:** `src/lib/services/finance-service.ts:36-38`
- **CWE:** CWE-22 (Improper Limitation of a Pathname to a Restricted Directory)
- **Categoria OWASP:** A03 - Injection

**Evidencia:**

```typescript
// finance-service.ts linhas 34-39
for (const [key, value] of entries) {
  if (key === 'image') {
    if (value instanceof File) {
      formData.append('image', value)    // <-- file.name original do usuario e' preservado
    }
    continue
  }
```

O `FormData.append('image', value)` preserva o `file.name` original do arquivo selecionado pelo usuario. Nomes de arquivo podem conter caracteres como `../`, `..\\`, `\0`, ou caracteres Unicode especiais que, dependendo de como o backend processa o filename para armazenamento, podem resultar em path traversal.

**Impacto:**
O risco real depende do backend. Se o backend usa o nome original do arquivo para criar o path de armazenamento sem sanitizacao, um atacante pode escrever arquivos em diretorios arbitrarios. No frontend, o controle e' limitado, mas defense-in-depth recomenda sanitizar o nome antes do envio.

**Remediacao:**

```typescript
if (key === 'image') {
  if (value instanceof File) {
    // Sanitizar filename: remover path traversal, caracteres especiais
    const safeName = value.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')
    const safeFile = new File([value], safeName, { type: value.type })
    formData.append('image', safeFile)
  }
  continue
}
```

**Referencia:** https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html#file-name

---

### [BAIXO] F05 -- Campos `specialDiscountStartsAt` e `specialDiscountEndsAt` sem validacao de formato no Zod

- **Arquivo:** `src/app/(authenticated)/catalogo/actions.ts:33-34` e `actions.ts:47-48`
- **CWE:** CWE-20 (Improper Input Validation)
- **Categoria OWASP:** A03 - Injection

**Evidencia:**

```typescript
// actions.ts linhas 33-34
specialDiscountStartsAt: z.string().nullable().optional(),
specialDiscountEndsAt: z.string().nullable().optional(),
```

Estes campos aceitam qualquer string. O client envia datas no formato ISO (services-table.tsx:207-208):

```typescript
formData.append('specialDiscountStartsAt', formSpecialStartsAt ? `${formSpecialStartsAt}T00:00:00Z` : '')
formData.append('specialDiscountEndsAt', formSpecialEndsAt ? `${formSpecialEndsAt}T23:59:59Z` : '')
```

Mas como o server action aceita qualquer string, um atacante pode enviar valores arbitrarios que poderiam causar erros no backend ou comportamento inesperado.

**Impacto:**
Baixo. O backend provavelmente valida o formato de data ao tentar persistir. Porem, strings malformadas podem causar erros nao tratados ou comportamento inesperado em logica de negocio.

**Remediacao:**

```typescript
const isoDatetimeSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
  'Data deve estar no formato ISO 8601.'
).nullable().optional()

// No schema:
specialDiscountStartsAt: isoDatetimeSchema,
specialDiscountEndsAt: isoDatetimeSchema,
```

---

### [BAIXO] F06 -- Uso de `<img>` nativo em vez de `next/image` para URLs externas

- **Arquivo:** `src/app/(authenticated)/catalogo/_components/services-table.tsx:367-371`
- **Arquivo:** `src/app/(authenticated)/catalogo/_components/products-table.tsx:367-371`
- **CWE:** CWE-829 (Inclusion of Functionality from Untrusted Control Sphere)
- **Categoria OWASP:** A05 - Security Misconfiguration

**Evidencia:**

```tsx
// services-table.tsx linhas 366-371
{/* eslint-disable-next-line @next/next/no-img-element */}
<img
  src={service.imageUrl}
  alt={service.name}
  loading="lazy"
  className="h-full w-full object-cover"
/>
```

O `imageUrl` vem da API backend e e' renderizado diretamente em um `<img src>`. O componente `next/image` nao esta sendo usado (o eslint-disable confirma isso). Confirmado que `next.config.ts` nao tem `images.remotePatterns` configurado.

**Impacto:**
Risco de XSS via `<img src>` e' muito limitado -- browsers nao executam JavaScript em atributos `src` de imagens (exceto `javascript:` URIs em browsers antigos, que nao sao mais relevantes). Porem:
1. Sem `next/image`, nao ha otimizacao de tamanho nem protecao contra URLs externas arbitrarias.
2. Se o `imageUrl` contiver um `data:text/html,...` URI, alguns browsers poderiam interpretar. Porem, React escapa atributos por padrao.
3. Ponto mais relevante: tracking pixel -- se um atacante controlar o `imageUrl` (o que requer acesso ao backend para manipular o valor), ele pode apontar para um servidor externo para tracking.

**Remediacao:**
Configurar `images.remotePatterns` em `next.config.ts` e usar `next/image`:

```typescript
// next.config.ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'seu-bucket.s3.amazonaws.com', // apenas o dominio do storage
    },
  ],
},
```

```tsx
import Image from 'next/image'

<Image
  src={service.imageUrl}
  alt={service.name}
  fill
  className="object-cover"
  sizes="(max-width: 640px) 100vw, 300px"
/>
```

---

### [INFO] F07 -- Protecoes positivas confirmadas

Os seguintes controles de seguranca foram verificados e estao **corretamente implementados**:

**1. Autorizacao via authFetch -- Confirmado**
- **Arquivo:** `src/lib/services/auth-fetch.ts:43-66`
- Todas as chamadas de API (finance-service.ts, agent-config-service.ts) usam `authFetch`, que injeta o Bearer token do cookie httpOnly. Nenhuma chamada direta ao backend sem autenticacao foi encontrada nos modulos auditados.

**2. Validacao Zod server-side para agentInstructions -- Confirmado**
- **Arquivo:** `src/app/(authenticated)/catalogo/actions.ts:35,48`
- `agentInstructions: z.string().max(2000).optional()` -- max 2000 caracteres validado server-side.
- **Arquivo:** `src/app/(authenticated)/configuracoes/agent-actions.ts:19-22`
- `customInstructions: z.string().max(2000, 'Instrucoes max. 2000 caracteres.').nullable()` -- validado server-side com trim.

**3. Validacao Zod server-side para agent config -- Confirmado**
- **Arquivo:** `src/app/(authenticated)/configuracoes/agent-actions.ts:9-23`
- `agentName`: min(1), max(100), trim
- `tone`: enum restrito a `['friendly', 'formal', 'casual']`
- `customInstructions`: max(2000), nullable, trim
- Input `data: unknown` na assinatura -- aceita qualquer tipo e valida via Zod. Correto.

**4. Validacao de ID como UUID -- Confirmado**
- **Arquivo:** `src/app/(authenticated)/catalogo/actions.ts:7-9`
- `IdSchema = z.string().regex(UUID_RE)` -- impede injection via parametro de ID.

**5. CSRF -- Confirmado (protecao nativa)**
- Server Actions do Next.js sao protegidas nativamente contra CSRF. O framework gera e valida tokens automaticamente.

**6. XSS via agentInstructions -- Nao encontrado**
- `agentInstructions` e' renderizado em `<textarea>` (services-table.tsx:779-780, products-table.tsx:779-780) e `customInstructions` em `<textarea>` (settings-hub.tsx:732). React escapa o conteudo de textarea automaticamente. Nenhum uso de `dangerouslySetInnerHTML` foi encontrado nos modulos auditados.

**7. XSS via imageUrl -- Nao encontrado**
- `imageUrl` e' usado como atributo `src` de `<img>`. React escapa atributos por padrao. Nao ha `dangerouslySetInnerHTML`. O risco de `javascript:` URI em `<img src>` e' inexistente em browsers modernos.

**8. Cookie security -- Confirmado**
- **Arquivo:** `src/lib/services/auth-fetch.ts:5-9`
- `httpOnly: true`, `secure: true` em producao, `sameSite: 'lax'`, `path: '/'`.

**9. Security headers -- Confirmado**
- **Arquivo:** `next.config.ts:10-20`
- X-Frame-Options: DENY, X-Content-Type-Options: nosniff, HSTS, Referrer-Policy, Permissions-Policy.

**10. Validacao de tamanho de arquivo (5MB) -- Confirmado**
- **Arquivo:** `src/app/(authenticated)/catalogo/actions.ts:72,85-87`
- `MAX_IMAGE_SIZE = 5 * 1024 * 1024`, validado server-side em `extractImage`.

**11. Validacao de tipo de imagem (whitelist) -- Confirmado (parcial)**
- **Arquivo:** `src/app/(authenticated)/catalogo/actions.ts:73,80-82`
- `ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']` -- whitelist correta. Porem, depende de `file.type` que e' spoofable (ver F01).

**12. FormData nao seta Content-Type manualmente -- Confirmado**
- `finance-service.ts:77-79` envia `body: formData` sem setar `Content-Type` header manualmente, permitindo que o browser/runtime defina o boundary multipart automaticamente. Correto.

**13. Error handling com safeError -- Confirmado**
- **Arquivo:** `src/app/(authenticated)/catalogo/actions.ts:55-66`
- Errors internos nao sao expostos ao usuario. Apenas mensagens de um mapa `SAFE_ERRORS` sao retornadas, com fallback generico.

---

## Recomendacoes Priorizadas

| Prioridade | Finding | Esforco | Impacto |
|-----------|---------|---------|---------|
| P1 | F01 -- Magic bytes validation | Baixo (~30 min) | Alto -- previne upload de arquivos maliciosos |
| P1 | F02 -- maxLength em description | Trivial (~5 min) | Medio -- previne abuse de recursos |
| P2 | F03 -- useEffect cleanup de Object URLs | Baixo (~15 min) | Medio -- previne memory leak |
| P2 | F04 -- Sanitizar filename antes do envio | Baixo (~15 min) | Medio -- defense-in-depth |
| P3 | F05 -- Validar formato de data ISO | Baixo (~10 min) | Baixo -- robustez |
| P3 | F06 -- Migrar para next/image | Medio (~1h) | Baixo -- performance + seguranca |

## Itens Inconclusivos (Requer Revisao Manual)

1. **Validacao de imagem no backend**: O frontend envia o arquivo para `/services` e `/products` via backend. Nao foi possivel auditar se o backend valida magic bytes, redimensiona imagens, faz virus scan, ou sanitiza o filename. **Recomendacao: auditar o backend.**
2. **Armazenamento de imagem**: Nao foi possivel determinar se imagens sao servidas de um dominio separado (CDN/S3) ou do mesmo dominio da aplicacao. Se servidas do mesmo dominio, SVGs maliciosos podem executar JS no contexto do dominio principal. **Recomendacao: verificar configuracao de storage no backend.**
3. **Tenant isolation no backend**: O frontend usa `authFetch` com Bearer token. O tenant isolation depende do backend extrair o tenant_id do JWT e aplicar filtros. Nao foi possivel confirmar isso no escopo desta auditoria. **Recomendacao: auditar RLS/filtros no backend.**
4. **Rate limiting de upload**: Nao ha rate limiting visivel no frontend. Se o backend nao implementa rate limiting para uploads, um atacante autenticado pode fazer upload massivo. **Recomendacao: verificar rate limiting no backend/API gateway.**
