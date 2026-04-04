'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X, Loader2 } from 'lucide-react'
import type { KnowledgeEntry, CreateKnowledgeEntryPayload } from '@/lib/types'

const INPUT_CLASS = "h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"

interface KnowledgeEntryFormProps {
  initialData?: KnowledgeEntry
  onSubmit: (data: CreateKnowledgeEntryPayload) => Promise<void>
  onCancel: () => void
}

export function KnowledgeEntryForm({ initialData, onSubmit, onCancel }: KnowledgeEntryFormProps) {
  const [question, setQuestion] = useState(initialData?.question ?? '')
  const [answer, setAnswer] = useState(initialData?.answer ?? '')
  const [tags, setTags] = useState<string[]>(initialData?.tags.filter((t) => t !== 'auto' && t !== 'manual') ?? [])
  const [newTag, setNewTag] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function addTag() {
    const trimmed = newTag.trim()
    if (!trimmed || tags.length >= 10) return
    setTags([...tags, trimmed])
    setNewTag('')
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (question.trim().length < 5) errs.question = 'Pergunta deve ter pelo menos 5 caracteres'
    if (answer.trim().length < 5) errs.answer = 'Resposta deve ter pelo menos 5 caracteres'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      await onSubmit({
        question: question.trim(),
        answer: answer.trim(),
        ...(tags.length > 0 && { tags }),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-[12px] font-medium text-text-muted">
          Pergunta <span className="text-danger">*</span>
        </Label>
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} className={INPUT_CLASS} placeholder="Ex: Vocês emitem nota fiscal?" />
        {errors.question && <p className="text-[11px] text-danger">{errors.question}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-[12px] font-medium text-text-muted">
          Resposta <span className="text-danger">*</span>
        </Label>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={3}
          className="rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"
          placeholder="Escreva a resposta..."
        />
        {errors.answer && <p className="text-[11px] text-danger">{errors.answer}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-[12px] font-medium text-text-muted">Tags</Label>
        <div className="flex gap-2">
          <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className={INPUT_CLASS + ' flex-1'} placeholder="Ex: fiscal" />
          <Button type="button" variant="outline" onClick={addTag} className="h-11 rounded-xl"><Plus className="h-4 w-4" /></Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span key={tag + i} className="inline-flex items-center gap-1 rounded-md border border-border-default px-2 py-1 text-[11px] text-text-muted">
                {tag}
                <button type="button" onClick={() => setTags(tags.filter((_, j) => j !== i))} className="text-text-subtle hover:text-danger"><X className="h-2.5 w-2.5" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="h-11 flex-1 rounded-xl">Cancelar</Button>
        <Button
          type="submit"
          disabled={saving}
          className="h-11 flex-1 rounded-xl bg-accent px-6 text-[14px] font-semibold text-primary-foreground shadow-[0_0_24px_rgba(79,209,197,0.12)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_32px_rgba(79,209,197,0.18)]"
        >
          {saving ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Salvando...</span> : (initialData ? 'Atualizar' : 'Adicionar')}
        </Button>
      </div>
    </form>
  )
}
