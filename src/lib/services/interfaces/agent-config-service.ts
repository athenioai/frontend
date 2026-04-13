export interface AgentConfig {
  agentName: string
  tone: 'friendly' | 'formal' | 'casual'
  customInstructions: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateAgentConfigParams {
  agentName: string
  tone: 'friendly' | 'formal' | 'casual'
  customInstructions: string | null
}

export interface IAgentConfigService {
  getConfig(): Promise<AgentConfig>
  updateConfig(params: UpdateAgentConfigParams): Promise<AgentConfig>
}
