'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'

const INPUT_CLASS = 'h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10'

interface ChipInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  maxItems?: number
  label?: string
}

export function ChipInput({ value, onChange, placeholder = 'Adicionar...', maxItems = 10, label }: ChipInputProps) {
  const [input, setInput] = useState('')

  function add() {
    const trimmed = input.trim()
    if (!trimmed || value.length >= maxItems) return
    if (value.includes(trimmed)) return
    onChange([...value, trimmed])
    setInput('')
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {label && (
        <span className="text-[12px] font-medium text-text-muted">
          {label} {value.length > 0 && `(${value.length}/${maxItems})`}
        </span>
      )}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          className={`${INPUT_CLASS} flex-1`}
          placeholder={placeholder}
          disabled={value.length >= maxItems}
        />
        <Button
          type="button"
          variant="outline"
          onClick={add}
          disabled={!input.trim() || value.length >= maxItems}
          className="h-11 rounded-xl"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <AnimatePresence>
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {value.map((chip, i) => (
              <motion.span
                key={chip + i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-1 px-3 py-1.5 text-[12px] text-text-muted"
              >
                {chip}
                <button type="button" onClick={() => remove(i)} className="text-text-subtle hover:text-danger transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
