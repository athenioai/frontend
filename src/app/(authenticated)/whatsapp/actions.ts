'use server'

import { whatsAppService } from '@/lib/services'
import { revalidatePath } from 'next/cache'
import type { WhatsAppInstanceDetail } from '@/lib/services/interfaces/whatsapp-service'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && UUID_RE.test(id)
}

const SAFE_ERRORS: Record<string, string> = {
  NOT_AUTHENTICATED: 'Sessão expirada. Faça login novamente.',
  NOT_FOUND: 'Instância não encontrada.',
  VALIDATION_ERROR: 'Número de telefone inválido.',
  CONFLICT: 'Este número já está conectado.',
}

function safeError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message in SAFE_ERRORS) {
    return SAFE_ERRORS[error.message]
  }
  return fallback
}

export async function connectWhatsAppInstance(
  id: string,
  phoneNumber: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isValidId(id)) return { success: false, error: 'ID inválido.' }

  if (typeof phoneNumber !== 'string') return { success: false, error: 'Número inválido.' }
  const phone = phoneNumber.replace(/\D/g, '')
  if (phone.length < 10 || phone.length > 15) {
    return { success: false, error: 'Número inválido. Use formato: 5511999999999' }
  }

  try {
    await whatsAppService.connect(id, { phone_number: phone })
    revalidatePath('/configuracoes')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao conectar número.') }
  }
}

export async function disconnectWhatsAppInstance(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isValidId(id)) return { success: false, error: 'ID inválido.' }

  try {
    await whatsAppService.disconnect(id)
    revalidatePath('/configuracoes')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: safeError(error, 'Erro ao desconectar instância.'),
    }
  }
}

export async function sendWhatsAppText(
  instanceId: string,
  to: string,
  content: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isValidId(instanceId)) return { success: false, error: 'ID inválido.' }

  if (typeof to !== 'string') return { success: false, error: 'Número inválido.' }
  const phone = to.replace(/\D/g, '')
  if (phone.length < 10 || phone.length > 15) {
    return { success: false, error: 'Número inválido. Use formato: 5511999999999' }
  }

  if (typeof content !== 'string') return { success: false, error: 'Mensagem inválida.' }
  const text = content.trim()
  if (!text) return { success: false, error: 'Mensagem não pode ser vazia.' }
  if (text.length > 4096) {
    return { success: false, error: 'Mensagem deve ter no máximo 4096 caracteres.' }
  }

  try {
    await whatsAppService.sendText(instanceId, { to: phone, content: text })
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao enviar mensagem.') }
  }
}

export async function sendWhatsAppTextSequence(
  instanceId: string,
  to: string,
  messages: string[],
): Promise<{ success: boolean; error?: string }> {
  if (!isValidId(instanceId)) return { success: false, error: 'ID inválido.' }

  if (typeof to !== 'string') return { success: false, error: 'Número inválido.' }
  const phone = to.replace(/\D/g, '')
  if (phone.length < 10 || phone.length > 15) {
    return { success: false, error: 'Número inválido. Use formato: 5511999999999' }
  }

  if (!Array.isArray(messages)) return { success: false, error: 'Mensagens inválidas.' }
  if (!messages.length || messages.length > 10) {
    return { success: false, error: 'Envie entre 1 e 10 mensagens.' }
  }

  const cleaned = messages.map((m) => m.trim()).filter(Boolean)
  if (cleaned.some((m) => m.length > 4096)) {
    return { success: false, error: 'Cada mensagem deve ter no máximo 4096 caracteres.' }
  }

  try {
    await whatsAppService.sendTextSequence(instanceId, { to: phone, messages: cleaned })
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao enviar mensagens.') }
  }
}

export async function fetchWhatsAppStatus(
  id: string,
): Promise<{ success: boolean; data?: WhatsAppInstanceDetail; error?: string }> {
  if (!isValidId(id)) return { success: false, error: 'ID inválido.' }

  try {
    const data = await whatsAppService.getStatus(id)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao buscar status.') }
  }
}
