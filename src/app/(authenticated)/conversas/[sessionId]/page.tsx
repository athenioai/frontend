import { chatService } from '@/lib/services'
import { notFound } from 'next/navigation'
import { MessageThread } from './_components/message-thread'
import type { ChatMessage, Pagination } from '@/lib/services/interfaces/chat-service'

async function fetchMessages(sessionId: string) {
  let messages: ChatMessage[] = []
  let pagination: Pagination = { page: 1, limit: 50, total: 0 }
  let notFoundError = false

  try {
    // Single fetch — request page 0 as sentinel to get the last page directly
    // The API returns pagination.total, so we compute lastPage and fetch once
    const probe = await chatService.getMessages(sessionId, { limit: 50, page: 1 })
    const lastPage =
      Math.ceil(probe.pagination.total / probe.pagination.limit) || 1

    if (lastPage <= 1) {
      messages = probe.data
      pagination = probe.pagination
    } else {
      // Only fetch again if there are multiple pages
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
  const { messages, pagination, notFoundError } = await fetchMessages(sessionId)

  if (notFoundError) notFound()

  return (
    <MessageThread
      sessionId={sessionId}
      initialMessages={messages}
      initialPagination={pagination}
    />
  )
}
