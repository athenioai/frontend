'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'

const INPUT_CLASS = 'h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10'

interface PriceInputProps {
  value: number // cents
  onChange: (cents: number) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function PriceInput({ value, onChange, placeholder = '0,00', className, disabled }: PriceInputProps) {
  const [displayValue, setDisplayValue] = useState(() =>
    value > 0 ? (value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      setDisplayValue(raw)
      const clean = raw.replace(/\./g, '').replace(',', '.')
      const num = parseFloat(clean)
      if (!isNaN(num)) {
        onChange(Math.round(num * 100))
      }
    },
    [onChange]
  )

  const handleBlur = useCallback(() => {
    if (value > 0) {
      setDisplayValue(
        (value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      )
    }
  }, [value])

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-text-subtle">R$</span>
      <Input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`${INPUT_CLASS} pl-10 ${className ?? ''}`}
      />
    </div>
  )
}
