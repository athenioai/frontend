import type {
  IChannelAccountService,
  ChannelAccount,
  ConnectChannelParams,
  SupportedChannel,
} from './interfaces/channel-account-service'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export class ChannelAccountService implements IChannelAccountService {
  private async getToken(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get('access_token')?.value ?? null
  }

  private async authFetch(path: string, init?: RequestInit): Promise<Response> {
    const token = await this.getToken()
    if (!token) throw new Error('NOT_AUTHENTICATED')

    return fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async list(): Promise<ChannelAccount[]> {
    const res = await this.authFetch('/channel-accounts')

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to list channel accounts')
    }

    const json = await res.json()
    return json.data ?? []
  }

  async connect(params: ConnectChannelParams): Promise<ChannelAccount> {
    const res = await this.authFetch('/channel-accounts', {
      method: 'POST',
      body: JSON.stringify(params),
    })

    if (!res.ok) {
      if (res.status === 409) throw new Error('CONFLICT')
      if (res.status === 400) throw new Error('BAD_REQUEST')
      if (res.status === 502) throw new Error('UPSTREAM_ERROR')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to connect channel')
    }

    return res.json()
  }

  async disconnect(channel: SupportedChannel): Promise<void> {
    const res = await this.authFetch(`/channel-accounts/${channel}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      if (res.status === 502) throw new Error('UPSTREAM_ERROR')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to disconnect channel')
    }
  }
}
