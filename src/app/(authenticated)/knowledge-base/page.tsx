'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { KnowledgeEntryList } from '@/components/onboarding/knowledge-entry-list'
import { clientApi } from '@/lib/api/client-api'
import type { KnowledgeEntry, CreateKnowledgeEntryPayload } from '@/lib/types'

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    clientApi<KnowledgeEntry[]>('/api/company/knowledge')
      .then(setEntries)
      .catch(() => toast.error('Erro ao carregar knowledge base'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(data: CreateKnowledgeEntryPayload) {
    const created = await clientApi<KnowledgeEntry>('/api/company/knowledge', { method: 'POST', body: JSON.stringify(data) })
    setEntries((prev) => [...prev, created])
    toast.success('Entrada adicionada')
  }

  async function handleUpdate(id: string, data: Partial<CreateKnowledgeEntryPayload>) {
    const updated = await clientApi<KnowledgeEntry>(`/api/company/knowledge/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)))
    toast.success('Entrada atualizada')
  }

  async function handleDelete(id: string) {
    await clientApi<void>(`/api/company/knowledge/${id}`, { method: 'DELETE' })
    setEntries((prev) => prev.filter((e) => e.id !== id))
    toast.success('Entrada removida')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet/15 to-violet/5">
          <BookOpen className="h-[18px] w-[18px] text-violet" />
        </div>
        <div>
          <h1 className="font-title text-[22px] font-bold text-text-primary">Knowledge Base</h1>
          <p className="text-[13px] text-text-muted">{entries.length} entrada{entries.length !== 1 && 's'}</p>
        </div>
      </div>

      <KnowledgeEntryList
        entries={entries}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  )
}
