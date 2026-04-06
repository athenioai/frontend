import { chatService } from '@/lib/services'
import { ConversasShell } from './_components/conversas-shell'
import { SessionPanel } from './_components/session-panel'
import type { ChatSession, Pagination } from '@/lib/services/interfaces/chat-service'

async function fetchSessions() {
  let sessions: ChatSession[] = []
  let pagination: Pagination = { page: 1, limit: 100, total: 0 }

  try {
    const result = await chatService.listSessions({ limit: 100 })
    sessions = result.data
    pagination = result.pagination
  } catch {
    // Falls back to empty list
  }

  return { sessions, pagination }
}

export default async function ConversasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { sessions, pagination } = await fetchSessions()

  return (
    <ConversasShell
      sidebar={
        <SessionPanel
          initialSessions={sessions}
          initialPagination={pagination}
        />
      }
    >
      {children}
    </ConversasShell>
  )
}
