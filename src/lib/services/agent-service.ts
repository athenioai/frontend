import type { IAgentService } from './interfaces/agent-service'
import type { AgentStatus } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class AgentService implements IAgentService {
  async getStatus(_companyId: string): Promise<AgentStatus[]> {
    return apiClient<AgentStatus[]>('/agents')
  }
}
