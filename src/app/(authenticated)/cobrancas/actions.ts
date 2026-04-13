'use server'

import { z } from 'zod'
import { financeService } from '@/lib/services'
import { revalidatePath } from 'next/cache'

const IdSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    'ID inválido.',
  )

const SAFE_ERRORS: Record<string, string> = {
  NOT_FOUND: 'Cobrança não encontrada.',
  NOT_AUTHENTICATED: 'Sessão expirada. Faça login novamente.',
}

function safeError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message in SAFE_ERRORS) {
    return SAFE_ERRORS[error.message]
  }
  return fallback
}

export async function markInvoicePaid(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const parsed = IdSchema.safeParse(id)
  if (!parsed.success) return { success: false, error: 'ID inválido.' }
  try {
    await financeService.markInvoicePaid(parsed.data)
    revalidatePath('/cobrancas')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao marcar como pago.') }
  }
}

export async function cancelInvoice(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const parsed = IdSchema.safeParse(id)
  if (!parsed.success) return { success: false, error: 'ID inválido.' }
  try {
    await financeService.cancelInvoice(parsed.data)
    revalidatePath('/cobrancas')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao cancelar cobrança.') }
  }
}
