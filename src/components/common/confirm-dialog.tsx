'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  requireSlug?: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = 'Confirmar',
  variant = 'default',
  requireSlug,
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const [slugInput, setSlugInput] = useState('')

  const canConfirm = requireSlug ? slugInput === requireSlug : true

  async function handleConfirm() {
    await onConfirm()
    setSlugInput('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        {requireSlug && (
          <div className="space-y-2 py-2">
            <p className="text-[12px] text-text-muted">
              Digite <span className="font-mono font-semibold text-text-primary">{requireSlug}</span> para confirmar:
            </p>
            <Input
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value)}
              placeholder={requireSlug}
              className="h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary"
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
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
