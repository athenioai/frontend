'use server'

import { chatService } from '@/lib/services'
import { revalidatePath } from 'next/cache'
import type { ChatMessage, Pagination } from '@/lib/services/interfaces/chat-service'

export async function deleteChatSession(
  sessionId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await chatService.deleteSession(sessionId)
    revalidatePath('/conversas')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao deletar conversa',
    }
  }
}

export async function loadMoreMessages(
  sessionId: string,
  page: number,
): Promise<{
  success: boolean
  data?: ChatMessage[]
  pagination?: Pagination
  error?: string
}> {
  try {
    const result = await chatService.getMessages(sessionId, { page })
    return { success: true, data: result.data, pagination: result.pagination }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao carregar mensagens',
    }
  }
}
