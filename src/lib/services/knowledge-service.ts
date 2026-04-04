import type { IKnowledgeService } from './interfaces/knowledge-service'
import type { KnowledgeEntry, CreateKnowledgeEntryPayload } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class KnowledgeService implements IKnowledgeService {
  async getAll(): Promise<KnowledgeEntry[]> {
    return apiClient<KnowledgeEntry[]>('/api/company/knowledge')
  }

  async create(data: CreateKnowledgeEntryPayload): Promise<KnowledgeEntry> {
    return apiClient<KnowledgeEntry>('/api/company/knowledge', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async update(id: string, data: Partial<CreateKnowledgeEntryPayload>): Promise<KnowledgeEntry> {
    return apiClient<KnowledgeEntry>(`/api/company/knowledge/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete(id: string): Promise<void> {
    await apiClient<void>(`/api/company/knowledge/${id}`, { method: 'DELETE' })
  }
}
