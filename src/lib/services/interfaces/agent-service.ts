import type { AgentStatus } from '@/lib/types'

export interface IAgentService {
  getStatus(companyId: string): Promise<AgentStatus[]>
}
