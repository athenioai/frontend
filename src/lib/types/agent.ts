export interface AgentStatus {
  name: string
  status: 'online' | 'offline'
  active_conversations?: number
  active_campaigns?: number
}
