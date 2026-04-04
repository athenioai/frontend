'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  confirmLabel?: string
  variant?: 'destructive' | 'default'
  onConfirm: () => void | Promise<void>
  requireSlug?: string
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = 'Confirmar',
  variant = 'default',
  onConfirm,
  requireSlug,
  loading = false,
}: ConfirmDialogProps) {
  const [slugInput, setSlugInput] = useState('')

  const canConfirm = !requireSlug || slugInput === requireSlug

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setSlugInput('')
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        {requireSlug && (
          <div className="space-y-2">
            <p className="text-[13px] text-text-muted">
              Digite <span className="font-mono font-semibold text-text-primary">{requireSlug}</span> para confirmar:
            </p>
            <Input
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value)}
              placeholder={requireSlug}
              className="h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"
            />
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={!canConfirm || loading}
            className={variant === 'destructive' ? '' : 'bg-accent text-primary-foreground hover:brightness-110'}
          >
            {loading ? 'Processando...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
