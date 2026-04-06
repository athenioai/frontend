import { MessagesSquare } from 'lucide-react'

export default function ConversasPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
        <MessagesSquare className="h-8 w-8 text-text-subtle/50" />
      </div>
      <p className="mt-4 font-title text-lg font-semibold text-text-muted">
        Selecione uma conversa
      </p>
      <p className="mt-1 text-sm text-text-subtle">
        Escolha uma conversa ao lado para ver as mensagens
      </p>
    </div>
  )
}
