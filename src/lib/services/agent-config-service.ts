import type {
  IAgentConfigService,
  AgentConfig,
  UpdateAgentConfigParams,
} from './interfaces/agent-config-service'
import { authFetch } from './auth-fetch'

export class AgentConfigService implements IAgentConfigService {
  async getConfig(): Promise<AgentConfig> {
    const res = await authFetch('/agent/config')

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch agent config')
    }

    return res.json()
  }

  async updateConfig(params: UpdateAgentConfigParams): Promise<AgentConfig> {
    const res = await authFetch('/agent/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to update agent config')
    }

    return res.json()
  }
}
