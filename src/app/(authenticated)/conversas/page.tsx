import { authService, chatService } from '@/lib/services'
import { redirect } from 'next/navigation'
import { SessionList } from './_components/session-list'
import type { ChatSession, Pagination } from '@/lib/services/interfaces/chat-service'

async function fetchSessions(page: number, agent?: string) {
  let sessions: ChatSession[] = []
  let pagination: Pagination = { page: 1, limit: 20, total: 0 }

  try {
    const result = await chatService.listSessions({ page, agent })
    sessions = result.data
    pagination = result.pagination
  } catch {
    // Falls back to empty state
  }

  return { sessions, pagination }
}

export default async function ConversasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; agent?: string }>
}) {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const params = await searchParams
  const page = Number(params.page) || 1
  const agent = params.agent || undefined
  const { sessions, pagination } = await fetchSessions(page, agent)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <SessionList
        sessions={sessions}
        pagination={pagination}
        currentAgent={agent}
      />
    </div>
  )
}
