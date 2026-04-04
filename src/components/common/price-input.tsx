'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'

interface PriceInputProps {
  value: number | undefined
  onChange: (centavos: number) => void
  placeholder?: string
  className?: string
  id?: string
  disabled?: boolean
}

export function PriceInput({ value, onChange, placeholder = '0,00', className, id, disabled }: PriceInputProps) {
  const [displayValue, setDisplayValue] = useState(() => {
    if (value === undefined || value === 0) return ''
    return (value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  })

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^\d,]/g, '')
      setDisplayValue(raw)

      const normalized = raw.replace(',', '.')
      const parsed = parseFloat(normalized)
      if (!isNaN(parsed)) {
        onChange(Math.round(parsed * 100))
      } else if (raw === '') {
        onChange(0)
      }
    },
    [onChange],
  )

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-text-muted">
        R$
      </span>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`pl-9 h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10 ${className ?? ''}`}
      />
    </div>
  )
}
