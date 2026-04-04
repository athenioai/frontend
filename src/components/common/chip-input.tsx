'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

interface ChipInputProps {
  value: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  maxItems?: number
  className?: string
  id?: string
}

export function ChipInput({ value, onChange, placeholder = 'Digite e pressione Enter', maxItems, className, id }: ChipInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        const trimmed = inputValue.trim()
        if (!trimmed) return
        if (value.includes(trimmed)) return
        if (maxItems && value.length >= maxItems) return
        onChange([...value, trimmed])
        setInputValue('')
      }
    },
    [inputValue, value, onChange, maxItems],
  )

  const removeItem = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index))
    },
    [value, onChange],
  )

  return (
    <div className={className}>
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-1 rounded-lg bg-accent/10 px-2.5 py-1 text-[12px] font-medium text-accent"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-accent/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        id={id}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"
      />
    </div>
  )
}
