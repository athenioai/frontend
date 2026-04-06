import { authService, chatService } from '@/lib/services'
import { redirect, notFound } from 'next/navigation'
import { MessageThread } from './_components/message-thread'
import type { ChatMessage, Pagination } from '@/lib/services/interfaces/chat-service'

async function fetchMessages(sessionId: string) {
  let messages: ChatMessage[] = []
  let pagination: Pagination = { page: 1, limit: 50, total: 0 }
  let notFoundError = false

  try {
    const result = await chatService.getMessages(sessionId)
    messages = result.data
    pagination = result.pagination
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
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const { sessionId } = await params
  const { messages, pagination, notFoundError } = await fetchMessages(sessionId)

  if (notFoundError) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <MessageThread
        sessionId={sessionId}
        initialMessages={messages}
        initialPagination={pagination}
      />
    </div>
  )
}
