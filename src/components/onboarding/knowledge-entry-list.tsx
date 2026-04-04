'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Plus, Sparkles, User, MessageSquareText } from 'lucide-react'
import { KnowledgeEntryForm } from './knowledge-entry-form'
import type { KnowledgeEntry, CreateKnowledgeEntryPayload } from '@/lib/types'

interface KnowledgeEntryListProps {
  entries: KnowledgeEntry[]
  onCreate: (data: CreateKnowledgeEntryPayload) => Promise<void>
  onUpdate: (id: string, data: Partial<CreateKnowledgeEntryPayload>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
}

export function KnowledgeEntryList({ entries, onCreate, onUpdate, onDelete, isLoading }: KnowledgeEntryListProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  async function handleCreate(data: CreateKnowledgeEntryPayload) {
    await onCreate(data)
    setShowForm(false)
  }

  async function handleUpdate(data: CreateKnowledgeEntryPayload) {
    if (!editingId) return
    await onUpdate(editingId, data)
    setEditingId(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-surface p-5">
            <div className="space-y-3">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          </div>
        ))}
        <p className="text-center text-[13px] text-text-muted">A IA está gerando o knowledge base...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!showForm && (
        <Button variant="outline" onClick={() => setShowForm(true)} className="h-10 rounded-xl text-[13px]">
          <Plus className="h-4 w-4 mr-1.5" /> Nova Entrada
        </Button>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card-surface p-5">
            <KnowledgeEntryForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {entries.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mb-4">
            <MessageSquareText className="h-6 w-6 text-accent" />
          </div>
          <p className="text-[14px] font-medium text-text-primary">Nenhuma entrada no knowledge base</p>
          <p className="mt-1 text-[12px] text-text-subtle">Entries serão geradas automaticamente ao cadastrar produtos</p>
        </div>
      )}

      <AnimatePresence>
        {entries.map((entry, i) => {
          const isAuto = entry.tags.includes('auto')
          const isEditing = editingId === entry.id

          if (isEditing) {
            return (
              <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-surface p-5">
                <KnowledgeEntryForm initialData={entry} onSubmit={handleUpdate} onCancel={() => setEditingId(null)} />
              </motion.div>
            )
          }

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ delay: i * 0.03 }}
              className="card-surface overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className={`text-[10px] ${isAuto ? 'text-accent bg-accent/10' : 'text-violet bg-violet/10'}`}>
                        {isAuto ? <><Sparkles className="h-2.5 w-2.5 mr-0.5" />Auto</> : <><User className="h-2.5 w-2.5 mr-0.5" />Manual</>}
                      </Badge>
                      {entry.tags.filter((t) => t !== 'auto' && t !== 'manual' && !t.startsWith('product:')).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                    <p className="text-[14px] font-medium text-text-primary">{entry.question}</p>
                    <p className="mt-1.5 text-[13px] text-text-muted leading-relaxed">{entry.answer}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => setEditingId(entry.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-subtle hover:bg-accent/10 hover:text-accent transition-all">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => onDelete(entry.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-subtle hover:bg-danger-bg hover:text-danger transition-all">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
