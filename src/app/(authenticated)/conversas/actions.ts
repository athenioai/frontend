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
  } catch {
    return { success: false, error: 'Erro ao deletar conversa.' }
  }
}

export async function loadInitialMessages(
  sessionId: string,
): Promise<{
  success: boolean
  data?: ChatMessage[]
  pagination?: Pagination
}> {
  try {
    const initial = await chatService.getMessages(sessionId, { limit: 50 })
    const lastPage =
      Math.ceil(initial.pagination.total / initial.pagination.limit) || 1

    if (lastPage <= 1) {
      return { success: true, data: initial.data, pagination: initial.pagination }
    }

    const result = await chatService.getMessages(sessionId, {
      page: lastPage,
      limit: 50,
    })
    return { success: true, data: result.data, pagination: result.pagination }
  } catch {
    return { success: false, data: [], pagination: { page: 1, limit: 50, total: 0 } }
  }
}

export async function sendMessageToLead(
  sessionId: string,
  message: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await chatService.sendMessage(sessionId, message)
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao enviar mensagem.' }
  }
}

export async function activateHandoff(
  sessionId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await chatService.activateHandoff(sessionId)
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao assumir conversa.' }
  }
}

export async function deactivateHandoff(
  sessionId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await chatService.deactivateHandoff(sessionId)
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao devolver conversa.' }
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
  } catch {
    return { success: false, error: 'Erro ao carregar mensagens.' }
  }
}
