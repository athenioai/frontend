import type {
  IWhatsAppService,
  WhatsAppInstance,
  WhatsAppInstanceDetail,
  ConnectParams,
  SendTextParams,
  SendTextSequenceParams,
  SendTextResponse,
  SendTextSequenceResponse,
} from './interfaces/whatsapp-service'
import { authFetch } from './auth-fetch'

export class WhatsAppService implements IWhatsAppService {
  async listInstances(): Promise<WhatsAppInstance[]> {
    const res = await authFetch('/whatsapp/instances')

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch instances')
    }

    const data = await res.json()
    if (!Array.isArray(data)) {
      throw new Error(data?.error ?? 'Failed to fetch instances')
    }

    return data
  }

  async getInstance(id: string): Promise<WhatsAppInstance> {
    const res = await authFetch(`/whatsapp/instances/${id}`)

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch instance')
    }

    return res.json()
  }

  async deleteInstance(id: string): Promise<void> {
    const res = await authFetch(`/whatsapp/instances/${id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to delete instance')
    }
  }

  async connect(id: string, params: ConnectParams): Promise<WhatsAppInstance> {
    const res = await authFetch(`/whatsapp/instances/${id}/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!res.ok) {
      if (res.status === 400) throw new Error('VALIDATION_ERROR')
      if (res.status === 404) throw new Error('NOT_FOUND')
      if (res.status === 409) throw new Error('CONFLICT')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to connect instance')
    }

    return res.json()
  }

  async disconnect(id: string): Promise<{ status: string }> {
    const res = await authFetch(`/whatsapp/instances/${id}/disconnect`, {
      method: 'POST',
    })

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to disconnect instance')
    }

    return res.json()
  }

  async getStatus(id: string): Promise<WhatsAppInstanceDetail> {
    const res = await authFetch(`/whatsapp/instances/${id}/status`)

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch status')
    }

    return res.json()
  }

  async sendText(id: string, params: SendTextParams): Promise<SendTextResponse> {
    const res = await authFetch(`/whatsapp/instances/${id}/send/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!res.ok) {
      if (res.status === 400) throw new Error('VALIDATION_ERROR')
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to send message')
    }

    return res.json()
  }

  async sendTextSequence(
    id: string,
    params: SendTextSequenceParams,
  ): Promise<SendTextSequenceResponse> {
    const res = await authFetch(`/whatsapp/instances/${id}/send/text-sequence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!res.ok) {
      if (res.status === 400) throw new Error('VALIDATION_ERROR')
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to send messages')
    }

    return res.json()
  }
}
