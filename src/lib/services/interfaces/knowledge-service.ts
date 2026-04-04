import type { KnowledgeEntry, CreateKnowledgeEntryPayload } from '@/lib/types'

export interface IKnowledgeService {
  getAll(): Promise<KnowledgeEntry[]>
  create(data: CreateKnowledgeEntryPayload): Promise<KnowledgeEntry>
  update(id: string, data: Partial<CreateKnowledgeEntryPayload>): Promise<KnowledgeEntry>
  delete(id: string): Promise<void>
}
