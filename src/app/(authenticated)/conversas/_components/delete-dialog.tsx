'use client'

import { Dialog } from '@base-ui/react/dialog'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

export function DeleteDialog({ open, onClose, onConfirm, isDeleting }: DeleteDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen && !isDeleting) onClose() }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none">
          <div className="card-glass w-full max-w-sm p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10">
                <AlertTriangle className="h-5 w-5 text-danger" />
              </div>
              <div>
                <Dialog.Title className="font-title text-base font-semibold text-text-primary">
                  Deletar conversa
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-text-muted">
                  Essa acao nao pode ser desfeita. A conversa sera removida permanentemente.
                </Dialog.Description>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close
                disabled={isDeleting}
                className="inline-flex h-7 items-center rounded-lg px-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary disabled:pointer-events-none disabled:opacity-50"
              >
                Cancelar
              </Dialog.Close>
              <Button
                variant="destructive"
                size="sm"
                onClick={onConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-danger/30 border-t-danger" />
                    Deletando...
                  </span>
                ) : (
                  'Deletar'
                )}
              </Button>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
