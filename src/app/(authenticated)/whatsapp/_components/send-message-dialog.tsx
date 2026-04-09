'use client'

import { useState, useTransition } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { sendWhatsAppText } from '../actions'
import type { WhatsAppInstance } from '@/lib/services/interfaces/whatsapp-service'

interface SendMessageDialogProps {
  instance: WhatsAppInstance | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SendMessageDialog({
  instance,
  open,
  onOpenChange,
}: SendMessageDialogProps) {
  const [phone, setPhone] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSending, startSend] = useTransition()

  function handleClose() {
    if (!isSending) {
      setPhone('')
      setContent('')
      setError(null)
      onOpenChange(false)
    }
  }

  function handleSend() {
    if (!instance) return

    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 15) {
      setError('Número inválido. Use formato: 5511999999999')
      return
    }

    const text = content.trim()
    if (!text) {
      setError('Mensagem não pode ser vazia.')
      return
    }
    if (text.length > 4096) {
      setError('Mensagem deve ter no máximo 4096 caracteres.')
      return
    }

    setError(null)

    startSend(async () => {
      const result = await sendWhatsAppText(instance.id, digits, text)
      if (result.success) {
        toast.success('Mensagem enviada')
        setPhone('')
        setContent('')
        onOpenChange(false)
      } else {
        setError(result.error ?? 'Erro ao enviar mensagem.')
      }
    })
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none">
          <div className="card-glass w-full max-w-sm p-6">
            <div className="flex items-start justify-between">
              <Dialog.Title className="font-title text-lg font-semibold text-text-primary">
                Enviar Mensagem
              </Dialog.Title>
              <Dialog.Close
                disabled={isSending}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-text-subtle transition-colors hover:bg-surface-2 hover:text-text-primary disabled:pointer-events-none"
              >
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            {instance && (
              <p className="mt-1 text-xs text-text-subtle">
                Via: {instance.display_name || instance.id}
              </p>
            )}

            <div className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted">
                  Número de destino
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="5511999999999"
                  className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm tabular-nums text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                />
                <p className="text-[11px] text-text-subtle">
                  Inclua código do país (55) + DDD + número
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted">
                  Mensagem
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  maxLength={4096}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-border-default bg-surface-2 px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-danger/8 px-3 py-2.5">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close
                disabled={isSending}
                className="inline-flex h-9 items-center rounded-xl px-4 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary disabled:pointer-events-none disabled:opacity-50"
              >
                Cancelar
              </Dialog.Close>
              <Button
                onClick={handleSend}
                disabled={isSending}
                className="h-9 rounded-xl bg-accent px-4 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
              >
                {isSending ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    Enviando...
                  </span>
                ) : (
                  'Enviar'
                )}
              </Button>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
