import type {
  IChannelAccountService,
  ChannelAccount,
  ConnectChannelParams,
  SupportedChannel,
} from './interfaces/channel-account-service'
import { authFetch } from './auth-fetch'

export class ChannelAccountService implements IChannelAccountService {
  async list(): Promise<ChannelAccount[]> {
    const res = await authFetch('/channel-accounts')

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to list channel accounts')
    }

    const json = await res.json()
    return json.data ?? []
  }

  async connect(params: ConnectChannelParams): Promise<ChannelAccount> {
    const res = await authFetch('/channel-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await authFetch(`/channel-accounts/${channel}`, {
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
