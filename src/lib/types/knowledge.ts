export interface KnowledgeEntry {
  id: string
  question: string
  answer: string
  tags: string[]
}

export interface CreateKnowledgeEntryPayload {
  question: string
  answer: string
  tags?: string[]
}
