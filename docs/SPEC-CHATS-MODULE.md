# Módulo de Chats

Visualização do histórico de conversas entre leads e agentes de IA (Horos, futuros agentes). O usuário vê suas conversas agrupadas por sessão, pode abrir o detalhe de cada uma e deletar.

---

## Rotas do backend

### GET /chats

Lista sessões de chat do usuário autenticado.

**Query params:**

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| page | number | 1 | Página |
| limit | number | 20 | Itens por página (max 100) |
| agent | string | — | Filtra por agente (ex: "horos") |

**Response 200:**

```json
{
  "data": [
    {
      "sessionId": "c85c0fb8-7648-4ab3-a2b3-c6f60e4cc3b7",
      "agent": "horos",
      "lastMessage": "Agendamento confirmado, Pedro! 🎉",
      "lastRole": "assistant",
      "messageCount": 10,
      "startedAt": "2026-04-06T20:42:40.215Z",
      "lastMessageAt": "2026-04-06T20:43:09.887Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1 }
}
```

---

### GET /chats/:sessionId/messages

Mensagens de uma sessão em ordem cronológica.

**Params:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| sessionId | UUID | ID da sessão |

**Query params:**

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| page | number | 1 | Página |
| limit | number | 50 | Itens por página (max 100) |

**Response 200:**

```json
{
  "data": [
    {
      "id": "a1b2c3d4-...",
      "sessionId": "c85c0fb8-...",
      "agent": "horos",
      "role": "lead",
      "content": "Quero agendar uma consulta",
      "appointmentId": null,
      "createdAt": "2026-04-06T20:42:40.215Z"
    },
    {
      "id": "e5f6g7h8-...",
      "sessionId": "c85c0fb8-...",
      "agent": "horos",
      "role": "assistant",
      "content": "Agendamento confirmado! 🎉",
      "appointmentId": "36e6ba7d-be50-4c2f-a76f-d487332473f4",
      "createdAt": "2026-04-06T20:43:09.887Z"
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 10 }
}
```

**Response 404:**

```json
{ "error": "NOT_FOUND", "message": "Conversa nao encontrada" }
```

---

### DELETE /chats/:sessionId

Soft delete de uma sessão inteira.

**Params:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| sessionId | UUID | ID da sessão |

**Response 200:**

```json
{ "message": "Conversa deletada com sucesso" }
```

**Response 404:**

```json
{ "error": "NOT_FOUND", "message": "Conversa nao encontrada" }
```

---

## Tipos

```typescript
interface ChatSession {
  sessionId: string
  agent: string
  lastMessage: string
  lastRole: "lead" | "assistant"
  messageCount: number
  startedAt: string
  lastMessageAt: string
}

interface ChatMessage {
  id: string
  sessionId: string
  agent: string
  role: "lead" | "assistant"
  content: string
  appointmentId: string | null
  createdAt: string
}
```

---

## Telas

### /conversas — Lista de sessões

- Cards com: badge do agent, preview da última mensagem (~80 chars), quem mandou por último, quantidade de mensagens, data relativa, botão delete com confirmação
- Filtro por agent (dropdown)
- Paginação
- Estado vazio: "Nenhuma conversa ainda"

### /conversas/[sessionId] — Detalhe

- Botão voltar + badge do agent + data de início
- Thread estilo chat:
  - **lead**: alinhado à esquerda, fundo cinza
  - **assistant**: alinhado à direita, fundo accent
  - Se `appointmentId` presente: badge "Agendamento criado"
  - Timestamp em cada mensagem
- "Carregar mais" no topo para mensagens antigas

---

## Campos importantes

| Campo | Descrição |
|-------|-----------|
| `agent` | Identifica qual IA respondeu (ex: "horos"). Vai ter mais agentes no futuro. |
| `role` | `"lead"` = mensagem do cliente. `"assistant"` = resposta da IA. |
| `appointmentId` | Presente quando a IA criou um agendamento naquela mensagem. |
| `lastRole` | Quem mandou a última mensagem na sessão. |

---

## Errors

| Status | Quando |
|--------|--------|
| 401 | Token ausente ou expirado |
| 404 | Sessão não existe ou pertence a outro usuário |
| 400 | Params inválidos (sessionId não é UUID, page < 1, etc.) |
