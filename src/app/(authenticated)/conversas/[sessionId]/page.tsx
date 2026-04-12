import { chatService, authService } from '@/lib/services'
import { notFound } from 'next/navigation'
import { MessageThread } from './_components/message-thread'
import type { ChatMessage, Pagination } from '@/lib/services/interfaces/chat-service'

async function fetchMessages(sessionId: string) {
  let messages: ChatMessage[] = []
  let pagination: Pagination = { page: 1, limit: 50, total: 0 }
  let notFoundError = false

  try {
    const probe = await chatService.getMessages(sessionId, { limit: 50, page: 1 })
    const lastPage =
      Math.ceil(probe.pagination.total / probe.pagination.limit) || 1

    if (lastPage <= 1) {
      messages = probe.data
      pagination = probe.pagination
    } else {
      const latest = await chatService.getMessages(sessionId, {
        page: lastPage,
        limit: 50,
      })
      messages = latest.data
      pagination = latest.pagination
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      notFoundError = true
    } else {
      throw error
    }
  }

  return { messages, pagination, notFoundError }
}

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const [{ messages, pagination, notFoundError }, sessions, user] = await Promise.all([
    fetchMessages(sessionId),
    chatService.listSessions({ limit: 100 }).catch(() => ({ data: [] })),
    authService.getSession(),
  ])

  if (notFoundError) notFound()

  const session = sessions.data.find((s) => s.sessionId === sessionId)

  return (
    <MessageThread
      sessionId={sessionId}
      userName={user?.name ?? 'Você'}
      initialMessages={messages}
      initialPagination={pagination}
      initialHandoff={session?.handoff ?? false}
    />
  )
}
