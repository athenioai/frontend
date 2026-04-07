'use server'

import { adminUserDataService } from '@/lib/services'
import type { ChatMessage } from '@/lib/services/interfaces/chat-service'

export async function loadUserMessages(
  userId: string,
  sessionId: string,
): Promise<{
  success: boolean
  data?: ChatMessage[]
  pagination?: { page: number; limit: number; total: number }
}> {
  try {
    const initial = await adminUserDataService.getChatMessages(userId, sessionId, { limit: 50 })
    const lastPage =
      Math.ceil(initial.pagination.total / initial.pagination.limit) || 1

    if (lastPage <= 1) {
      return { success: true, data: initial.data, pagination: initial.pagination }
    }

    const result = await adminUserDataService.getChatMessages(userId, sessionId, {
      page: lastPage,
      limit: 50,
    })
    return { success: true, data: result.data, pagination: result.pagination }
  } catch {
    return { success: false, data: [], pagination: { page: 1, limit: 50, total: 0 } }
  }
}

export async function loadMoreUserMessages(
  userId: string,
  sessionId: string,
  page: number,
): Promise<{
  success: boolean
  data?: ChatMessage[]
  pagination?: { page: number; limit: number; total: number }
}> {
  try {
    const result = await adminUserDataService.getChatMessages(userId, sessionId, { page })
    return { success: true, data: result.data, pagination: result.pagination }
  } catch {
    return { success: false }
  }
}
